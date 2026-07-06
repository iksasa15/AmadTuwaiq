"""بناء جدول الميزات النهائي من البيانات الموثّقة."""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd

from src.models.beneish import compute_indicators, compute_m_score_from_indicators

ROOT = Path(__file__).resolve().parents[2]
VALIDATED_FILE = ROOT / "data" / "interim" / "financials_validated.parquet"
PROCESSED_DIR = ROOT / "data" / "processed"
FINANCIALS_OUT = PROCESSED_DIR / "financials.parquet"
FEATURES_OUT = PROCESSED_DIR / "features.parquet"

logger = logging.getLogger(__name__)


def _safe_div(a, b, default=np.nan):
    if b == 0 or pd.isna(a) or pd.isna(b):
        return default
    return a / b


def _pct_change(cur, prev):
    if pd.isna(cur) or pd.isna(prev) or prev == 0:
        return np.nan
    return (cur - prev) / abs(prev)


def _beneish_input(group: pd.DataFrame) -> pd.DataFrame:
    """Map canonical schema → beneish column names."""
    return group.rename(columns={"cfo": "operating_cashflow"}).sort_values("year")


def _extra_features(cur: pd.Series, prev: pd.Series) -> dict:
    cfo_ni = _safe_div(cur.get("cfo"), cur.get("net_income"))
    recv_growth = _pct_change(cur.get("receivables"), prev.get("receivables"))
    rev_growth = _pct_change(cur.get("revenue"), prev.get("revenue"))
    recv_rev_growth_ratio = _safe_div(recv_growth, rev_growth)

    debt_equity = _safe_div(cur.get("total_debt"), cur.get("total_equity"))
    debt_equity_prev = _safe_div(prev.get("total_debt"), prev.get("total_equity"))
    debt_equity_change = _safe_div(debt_equity, debt_equity_prev)

    gross_margin = _safe_div(
        cur.get("revenue", 0) - cur.get("cogs", 0),
        cur.get("revenue"),
    )
    operating_margin = _safe_div(cur.get("operating_income"), cur.get("revenue"))

    return {
        "cfo_to_net_income": cfo_ni,
        "receivables_growth": recv_growth,
        "revenue_growth": rev_growth,
        "receivables_to_revenue_growth": recv_rev_growth_ratio,
        "debt_to_equity": debt_equity,
        "debt_to_equity_change": debt_equity_change,
        "gross_margin": gross_margin,
        "operating_margin": operating_margin,
    }


def build_features(df: pd.DataFrame | None = None) -> pd.DataFrame:
    """Build feature table: one row per (company, year) with 15+ features."""
    if df is None:
        if not VALIDATED_FILE.exists():
            raise FileNotFoundError("Run validate first")
        df = pd.read_parquet(VALIDATED_FILE)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(FINANCIALS_OUT, index=False)

    feature_rows: list[dict] = []

    for ticker, group in df.groupby("ticker"):
        group = group.sort_values("year").reset_index(drop=True)
        meta = group.iloc[0]

        beneish_df = _beneish_input(group)
        if len(beneish_df) < 2:
            continue

        indicators = compute_indicators(beneish_df)

        for i in range(1, len(group)):
            cur = group.iloc[i]
            prev = group.iloc[i - 1]
            year = int(cur["year"])

            ind_row = indicators[indicators["year"].astype(str) == str(year)]
            if ind_row.empty:
                continue

            ind = ind_row.iloc[0]
            extras = _extra_features(cur, prev)

            row = {
                "ticker": ticker,
                "name_ar": meta["name_ar"],
                "name_en": meta["name_en"],
                "sector": meta["sector"],
                "year": year,
                "DSRI": ind["DSRI"],
                "GMI": ind["GMI"],
                "AQI": ind["AQI"],
                "SGI": ind["SGI"],
                "DEPI": ind["DEPI"],
                "SGAI": ind["SGAI"],
                "LVGI": ind["LVGI"],
                "TATA": ind["TATA"],
                "m_score": compute_m_score_from_indicators(ind),
                **extras,
            }
            feature_rows.append(row)

    features = pd.DataFrame(feature_rows)
    features.to_parquet(FEATURES_OUT, index=False)

    n_companies = features["ticker"].nunique() if not features.empty else 0
    logger.info(
        "Built %d feature rows (%d companies) → %s",
        len(features),
        n_companies,
        FEATURES_OUT,
    )
    return features


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    build_features()


if __name__ == "__main__":
    main()
