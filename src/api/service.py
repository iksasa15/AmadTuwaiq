"""طبقة الوصول للبيانات — SQLite + parquet."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

import pandas as pd

from src.api.financials import build_financial_statements
from src.models.data_quality import MESSAGES_AR, assess_company, is_bank_sector
from src.models.scoring import RULE_DEFINITIONS, risk_level as compute_risk_level

BENEISH_INDICATORS = ["DSRI", "GMI", "AQI", "SGI", "DEPI", "SGAI", "LVGI", "TATA"]

ROOT = Path(__file__).resolve().parents[2]
SCORES_FILE = ROOT / "data" / "processed" / "scores.parquet"
FEATURES_FILE = ROOT / "data" / "processed" / "features.parquet"
COMPANIES_FILE = ROOT / "data" / "companies.csv"
DB_PATH = ROOT / "data" / "raqeeb.db"
FINANCIALS_FILE = ROOT / "data" / "processed" / "financials.parquet"


def _to_contract_level(score: float) -> str:
    return compute_risk_level(score)


def _int_score(score: float) -> int:
    return int(round(score))


def _compute_trend(ticker: str, scores_df: pd.DataFrame) -> str:
    hist = scores_df[scores_df["ticker"] == ticker].sort_values("year")
    if len(hist) < 2:
        return "stable"
    prev = float(hist.iloc[-2]["risk_score"])
    cur = float(hist.iloc[-1]["risk_score"])
    diff = cur - prev
    if diff > 3:
        return "up"
    if diff < -3:
        return "down"
    return "stable"


def _extract_indicators(row: pd.Series) -> dict:
    return {k: _safe_float(row.get(k)) for k in BENEISH_INDICATORS}


def _sector_avg_indicators(sector: str, features: pd.DataFrame, year: int) -> dict:
    sector_feat = features[(features["sector"] == sector) & (features["year"] == year)]
    if sector_feat.empty:
        sector_feat = features[features["sector"] == sector]
    if sector_feat.empty:
        return {k: None for k in BENEISH_INDICATORS}
    return {k: _safe_float(sector_feat[k].median()) if k in sector_feat else None for k in BENEISH_INDICATORS}


def normalize_ticker(ticker: str) -> str:
    t = ticker.strip()
    if "." in t:
        base, suffix = t.rsplit(".", 1)
        return f"{base}.{suffix.upper()}"
    return f"{t}.SR"


class DataService:
    def __init__(self) -> None:
        self.reload()

    def reload(self) -> None:
        if SCORES_FILE.exists():
            self.scores = pd.read_parquet(SCORES_FILE)
        else:
            self.scores = pd.DataFrame()

        if FEATURES_FILE.exists():
            self.features = pd.read_parquet(FEATURES_FILE)
        else:
            self.features = pd.DataFrame()

        self.companies = pd.read_csv(COMPANIES_FILE) if COMPANIES_FILE.exists() else pd.DataFrame()
        if FINANCIALS_FILE.exists():
            self.financials = pd.read_parquet(FINANCIALS_FILE)
        else:
            self.financials = pd.DataFrame()
        self.flags = self._load_flags()
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def _load_flags(self) -> pd.DataFrame:
        if not DB_PATH.exists():
            return pd.DataFrame()
        import sqlite3

        conn = sqlite3.connect(DB_PATH)
        try:
            return pd.read_sql("SELECT * FROM flags", conn)
        except Exception:
            return pd.DataFrame()
        finally:
            conn.close()

    def _latest_per_company(self) -> pd.DataFrame:
        if self.scores.empty:
            return self.scores
        return self.scores.sort_values("year").groupby("ticker", as_index=False).tail(1)

    def _company_meta(self, ticker: str) -> dict | None:
        if self.companies.empty:
            return None
        row = self.companies[self.companies["ticker"] == ticker]
        if row.empty:
            return None
        r = row.iloc[0]
        return {
            "ticker": ticker,
            "name_ar": r["name_ar"],
            "name_en": r["name_en"],
            "sector": r["sector"],
        }

    def _financials_for(self, ticker: str) -> pd.DataFrame:
        if self.financials.empty:
            return pd.DataFrame()
        return self.financials[self.financials["ticker"] == ticker]

    def _assessment(self, ticker: str, sector: str, feature_row: pd.Series | None = None) -> dict:
        return assess_company(
            ticker,
            sector,
            self._financials_for(ticker),
            feature_row,
        )

    def list_companies(
        self,
        sector: str | None = None,
        min_risk: int = 0,
        include_banks: bool = False,
    ) -> list[dict]:
        latest = self._latest_per_company()
        rows: list[dict] = []

        # Scored companies
        if not latest.empty:
            scored = latest.copy()
            if sector:
                scored = scored[scored["sector"] == sector]
            scored = scored[scored["risk_score"] >= min_risk]
            scored = scored.sort_values("risk_score", ascending=False)

            for _, r in scored.iterrows():
                score = float(r["risk_score"])
                rows.append(
                    {
                        "ticker": r["ticker"],
                        "name_ar": r["name_ar"],
                        "name_en": r["name_en"],
                        "sector": r["sector"],
                        "risk_score": _int_score(score),
                        "risk_level": _to_contract_level(score),
                        "trend": _compute_trend(r["ticker"], self.scores),
                        "data_status": "partial" if r.get("confidence") == "low" else "ok",
                        "confidence": r.get("confidence"),
                        "message_ar": MESSAGES_AR["partial_nan"] if r.get("confidence") == "low" else None,
                    }
                )

        scored_tickers = {r["ticker"] for r in rows}

        # Banks / insufficient — listed with note, no score
        if not self.companies.empty:
            extras = self.companies.copy()
            if sector:
                extras = extras[extras["sector"] == sector]
            for _, c in extras.iterrows():
                ticker = c["ticker"]
                if ticker in scored_tickers:
                    continue
                assessment = self._assessment(ticker, c["sector"])
                if assessment["data_status"] == "bank_excluded":
                    if not include_banks:
                        continue
                elif assessment["data_status"] != "insufficient" and not include_banks:
                    continue
                if assessment["data_status"] not in ("bank_excluded", "insufficient"):
                    continue
                rows.append(
                    {
                        "ticker": ticker,
                        "name_ar": c["name_ar"],
                        "name_en": c["name_en"],
                        "sector": c["sector"],
                        "risk_score": None,
                        "risk_level": None,
                        "trend": "stable",
                        "data_status": assessment["data_status"],
                        "confidence": None,
                        "message_ar": assessment["message_ar"],
                    }
                )

        return rows

    def get_company(self, ticker: str) -> dict | None:
        ticker = normalize_ticker(ticker)
        meta = self._company_meta(ticker)
        if meta is None:
            return None

        company_scores = self.scores[self.scores["ticker"] == ticker]
        fin_group = self._financials_for(ticker)

        feat = pd.DataFrame()
        if not self.features.empty:
            feat = self.features[self.features["ticker"] == ticker]

        feature_row = feat.iloc[-1] if not feat.empty else None
        assessment = self._assessment(
            ticker,
            meta["sector"],
            feature_row,
        )

        if not assessment["scoring_eligible"]:
            return {
                **meta,
                "risk_score": None,
                "risk_level": None,
                "m_score": None,
                "latest_year": None,
                "score_history": [],
                "flags_count": 0,
                "top_flags": [],
                "key_metrics": {},
                "shap_top1": None,
                "indicators": None,
                "sector_avg_indicators": None,
                "data_status": assessment["data_status"],
                "confidence": assessment["confidence"],
                "confidence_pct": assessment["confidence_pct"],
                "message_ar": assessment["message_ar"],
                "scoring_eligible": False,
            }

        if company_scores.empty:
            return {
                **meta,
                "risk_score": None,
                "risk_level": None,
                "m_score": None,
                "latest_year": None,
                "score_history": [],
                "flags_count": 0,
                "top_flags": [],
                "key_metrics": {},
                "shap_top1": None,
                "indicators": None,
                "sector_avg_indicators": None,
                "data_status": "insufficient",
                "confidence": None,
                "confidence_pct": None,
                "message_ar": MESSAGES_AR["insufficient"],
                "scoring_eligible": False,
            }

        company_scores = company_scores.sort_values("year")
        latest = company_scores.iloc[-1]
        score_val = float(latest["risk_score"])
        period = int(latest["year"])

        history = []
        for _, r in company_scores.iterrows():
            history.append(
                {
                    "year": int(r["year"]),
                    "risk_score": _int_score(float(r["risk_score"])),
                    "m_score": None if pd.isna(r.get("m_score")) else float(r["m_score"]),
                }
            )

        confidence = latest.get("confidence") if "confidence" in latest.index else None
        confidence_pct = latest.get("confidence_pct") if "confidence_pct" in latest.index else None
        data_status = "partial" if confidence == "low" else "ok"
        message_ar = MESSAGES_AR["partial_nan"] if confidence == "low" else None

        company_flags = self.flags[
            (self.flags["ticker"] == ticker) & (self.flags["period"] == period)
        ] if not self.flags.empty else pd.DataFrame()

        top_flags = []
        for _, f in company_flags.head(5).iterrows():
            meta = RULE_DEFINITIONS.get(f["flag_id"], {})
            top_flags.append(
                {
                    "flag_id": f["flag_id"],
                    "title_ar": meta.get("title_ar", f["flag_id"]),
                    "severity": f["severity"],
                }
            )

        feat = self.features[
            (self.features["ticker"] == ticker) & (self.features["year"] == period)
        ]
        metrics: dict = {}
        indicators = None
        sector_avg = None
        if not feat.empty:
            row = feat.iloc[0]
            metrics = {
                "cfo_to_net_income": _safe_float(row.get("cfo_to_net_income")),
                "gross_margin": _safe_float(row.get("gross_margin")),
                "debt_to_equity": _safe_float(row.get("debt_to_equity")),
                "receivables_to_revenue_growth": _safe_float(row.get("receivables_to_revenue_growth")),
            }
            indicators = _extract_indicators(row)
            sector_avg = _sector_avg_indicators(latest["sector"], self.features, period)

        fin_stmts = build_financial_statements(self._financials_for(ticker))

        return {
            "ticker": ticker,
            "name_ar": latest["name_ar"],
            "name_en": latest["name_en"],
            "sector": latest["sector"],
            "risk_score": _int_score(score_val),
            "risk_level": _to_contract_level(score_val),
            "m_score": None if pd.isna(latest.get("m_score")) else float(latest["m_score"]),
            "latest_year": period,
            "score_history": history,
            "flags_count": len(company_flags),
            "top_flags": top_flags,
            "key_metrics": metrics,
            "shap_top1": latest.get("shap_top1") if "shap_top1" in latest else None,
            "indicators": indicators,
            "sector_avg_indicators": sector_avg,
            "data_status": data_status,
            "confidence": confidence,
            "confidence_pct": float(confidence_pct) if confidence_pct is not None and not pd.isna(confidence_pct) else None,
            "message_ar": message_ar,
            "scoring_eligible": True,
            "financial_statements": fin_stmts,
        }

    def get_flags(self, ticker: str, period: int | None = None) -> list[dict]:
        if self.flags.empty:
            return []

        ticker = normalize_ticker(ticker)

        df = self.flags[self.flags["ticker"] == ticker]
        if period is not None:
            df = df[df["period"] == period]
        else:
            df = df.sort_values("period", ascending=False).groupby("flag_id", as_index=False).head(1)

        rows = []
        for _, f in df.iterrows():
            meta = RULE_DEFINITIONS.get(f["flag_id"], {})
            evidence = json.loads(f["evidence_json"]) if isinstance(f["evidence_json"], str) else f["evidence_json"]
            rows.append(
                {
                    "flag_id": f["flag_id"],
                    "title_ar": meta.get("title_ar", f["flag_id"]),
                    "severity": f["severity"],
                    "explanation_ar": f["explanation_ar"],
                    "evidence": evidence,
                }
            )
        return rows

    def market_overview(self) -> dict:
        latest = self._latest_per_company()
        if latest.empty:
            banks_n = int(self.companies["sector"].eq("Banks").sum()) if not self.companies.empty else 0
            return {
                "total_companies": 0,
                "avg_risk_score": 0.0,
                "distribution": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                "top_risks": [],
                "sector_breakdown": [],
                "updated_at": self.updated_at,
                "banks_excluded": banks_n,
                "banks_note_ar": MESSAGES_AR["bank_excluded"] if banks_n else None,
            }

        dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        for score in latest["risk_score"]:
            level = _to_contract_level(float(score))
            dist[level] += 1

        top = latest.nlargest(5, "risk_score")
        top_risks = []
        for _, r in top.iterrows():
            score = float(r["risk_score"])
            top_risks.append(
                {
                    "ticker": r["ticker"],
                    "name_ar": r["name_ar"],
                    "risk_score": _int_score(score),
                    "risk_level": _to_contract_level(score),
                }
            )

        sectors = []
        for sector, grp in latest.groupby("sector"):
            sectors.append(
                {
                    "sector": sector,
                    "avg_risk_score": round(float(grp["risk_score"].mean()), 1),
                    "count": len(grp),
                }
            )
        sectors.sort(key=lambda x: x["avg_risk_score"], reverse=True)

        banks_n = 0
        if not self.companies.empty:
            banks_n = int(self.companies["sector"].eq("Banks").sum())

        return {
            "total_companies": len(latest),
            "avg_risk_score": round(float(latest["risk_score"].mean()), 1),
            "distribution": dist,
            "top_risks": top_risks,
            "sector_breakdown": sectors,
            "updated_at": self.updated_at,
            "banks_excluded": banks_n,
            "banks_note_ar": (
                f"{banks_n} بنك مستبعد — {MESSAGES_AR['bank_excluded']}" if banks_n else None
            ),
        }


def _safe_float(val) -> float | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    return float(val)


@lru_cache(maxsize=1)
def get_service() -> DataService:
    return DataService()
