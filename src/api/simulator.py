"""محاكي السيناريوهات — إعادة حساب الدرجة مع تعديلات افتراضية."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from src.api.schemas import SimulationInput, SimulationResult
from src.api.service import get_service, normalize_ticker
from src.features.build import _extra_features
from src.models.beneish import compute_m_score
from src.models.scoring import RULE_DEFINITIONS, compute_risk_score, risk_level

ROOT = Path(__file__).resolve().parents[2]
FEATURES_FILE = ROOT / "data" / "processed" / "features.parquet"
FINANCIALS_FILE = ROOT / "data" / "processed" / "financials.parquet"
SCORES_FILE = ROOT / "data" / "processed" / "scores.parquet"


def _apply_pct(value: float | None, delta_pct: float) -> float | None:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return value
    return float(value) * (1 + delta_pct / 100.0)


def _build_simulated_feature_row(
    cur: pd.Series,
    prev: pd.Series,
    sector: str,
    meta: dict,
) -> pd.Series:
    beneish_cur = cur.rename({"cfo": "operating_cashflow"})
    beneish_prev = prev.rename({"cfo": "operating_cashflow"})
    m_out = compute_m_score(beneish_cur, beneish_prev)
    indicators = m_out["indicators"]
    extras = _extra_features(cur, prev)

    row = {
        "ticker": meta["ticker"],
        "name_ar": meta.get("name_ar", ""),
        "name_en": meta.get("name_en", ""),
        "sector": sector,
        "year": int(cur["year"]),
        "m_score": m_out["m_score"],
        **indicators,
        **extras,
    }
    return pd.Series(row)


def run_simulation(inp: SimulationInput) -> SimulationResult:
    ticker = normalize_ticker(inp.ticker)

    if not FINANCIALS_FILE.exists() or not FEATURES_FILE.exists():
        raise ValueError("بيانات المعالجة غير متوفرة — شغّل خط الأنابيب أولاً")

    financials = pd.read_parquet(FINANCIALS_FILE)
    features = pd.read_parquet(FEATURES_FILE)

    fin = financials[financials["ticker"] == ticker].sort_values("year")
    if len(fin) < 2:
        raise ValueError(f"بيانات مالية غير كافية للشركة {ticker}")

    feat_hist = features[features["ticker"] == ticker].sort_values("year")
    if feat_hist.empty:
        raise ValueError(f"ميزات غير متوفرة للشركة {ticker}")

    latest_year = int(fin.iloc[-1]["year"])
    cur_orig = fin.iloc[-1].copy()
    prev = fin.iloc[-2].copy()

    orig_feat = feat_hist[feat_hist["year"] == latest_year]
    if orig_feat.empty:
        orig_feat_row = feat_hist.iloc[-1]
    else:
        orig_feat_row = orig_feat.iloc[0]

    sector = str(cur_orig.get("sector", feat_hist.iloc[-1].get("sector", "")))
    company_history = feat_hist.copy()

    if_score = orig_feat_row.get("anomaly_score") if "anomaly_score" in orig_feat_row else None
    xgb_score = orig_feat_row.get("xgb_score") if "xgb_score" in orig_feat_row else None

    orig_result = compute_risk_score(
        orig_feat_row,
        company_history,
        features[features["sector"] == sector],
        if_score=float(if_score) if if_score is not None and not pd.isna(if_score) else None,
        xgb_score=float(xgb_score) if xgb_score is not None and not pd.isna(xgb_score) else None,
    )

    service = get_service()
    stored_flags = service.get_flags(ticker, period=latest_year)
    orig_flag_ids = {f["flag_id"] for f in stored_flags} if stored_flags else {f.flag_id for f in orig_result["flags"]}

    orig_score = float(orig_result["risk_score"])
    if SCORES_FILE.exists():
        scores = pd.read_parquet(SCORES_FILE)
        stored = scores[(scores["ticker"] == ticker) & (scores["year"] == latest_year)]
        if not stored.empty:
            orig_score = int(round(float(stored.iloc[0]["risk_score"])))

    cur_sim = cur_orig.copy()
    cur_sim["revenue"] = _apply_pct(cur_orig.get("revenue"), inp.revenue_delta_pct)
    cur_sim["receivables"] = _apply_pct(cur_orig.get("receivables"), inp.receivables_delta_pct)
    cur_sim["cogs"] = _apply_pct(cur_orig.get("cogs"), inp.cogs_delta_pct)
    cur_sim["cfo"] = _apply_pct(cur_orig.get("cfo"), inp.cfo_delta_pct)
    cur_sim["depreciation"] = _apply_pct(cur_orig.get("depreciation"), inp.depreciation_delta_pct)

    meta = {
        "ticker": ticker,
        "name_ar": cur_orig.get("name_ar", ""),
        "name_en": cur_orig.get("name_en", ""),
    }
    sim_row = _build_simulated_feature_row(cur_sim, prev, sector, meta)

    sim_history = company_history.copy()
    if not sim_history.empty and int(sim_history.iloc[-1]["year"]) == latest_year:
        sim_history = sim_history.iloc[:-1]
    sim_history = pd.concat([sim_history, pd.DataFrame([sim_row])], ignore_index=True)

    sim_result = compute_risk_score(
        sim_row,
        sim_history,
        features[features["sector"] == sector],
        if_score=float(if_score) if if_score is not None and not pd.isna(if_score) else None,
        xgb_score=float(xgb_score) if xgb_score is not None and not pd.isna(xgb_score) else None,
    )
    sim_flag_ids = {f.flag_id for f in sim_result["flags"]}

    all_zero = (
        inp.revenue_delta_pct == 0
        and inp.receivables_delta_pct == 0
        and inp.cogs_delta_pct == 0
        and inp.cfo_delta_pct == 0
        and inp.depreciation_delta_pct == 0
    )
    sim_score = float(sim_result["risk_score"])
    if all_zero:
        sim_score = float(orig_score)
        sim_flag_ids = orig_flag_ids
    else:
        sim_score = round(sim_score, 1)

    triggered = [
        RULE_DEFINITIONS[fid]["title_ar"]
        for fid in sorted(sim_flag_ids - orig_flag_ids)
        if fid in RULE_DEFINITIONS
    ]
    removed = [
        RULE_DEFINITIONS[fid]["title_ar"]
        for fid in sorted(orig_flag_ids - sim_flag_ids)
        if fid in RULE_DEFINITIONS
    ]

    return SimulationResult(
        ticker=ticker,
        original_score=round(orig_score, 1),
        simulated_score=round(sim_score, 1),
        score_delta=round(sim_score - orig_score, 1),
        original_level=risk_level(orig_score),
        simulated_level=risk_level(sim_score),
        triggered_flags=triggered,
        removed_flags=removed,
    )
