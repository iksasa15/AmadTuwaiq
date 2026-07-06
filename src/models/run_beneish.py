"""تشغيل Beneish + Risk Score على كل الشركات."""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from src.models.persist import persist_scores
from src.models.scoring import LEVEL_HIGH, LEVEL_LOW, LEVEL_MEDIUM, compute_risk_score

ROOT = Path(__file__).resolve().parents[2]
FEATURES_FILE = ROOT / "data" / "processed" / "features.parquet"
ML_SCORES_FILE = ROOT / "data" / "processed" / "ml_scores.parquet"
SCORES_OUT = ROOT / "data" / "processed" / "scores.parquet"

logger = logging.getLogger(__name__)


def _load_ml_scores() -> pd.DataFrame | None:
    if ML_SCORES_FILE.exists():
        return pd.read_parquet(ML_SCORES_FILE)
    return None


def score_all_features(features: pd.DataFrame | None = None) -> pd.DataFrame:
    """Score every company-year row and return latest year per company."""
    if features is None:
        if not FEATURES_FILE.exists():
            raise FileNotFoundError("Run ETL pipeline first: python -m src.ingestion.run_all --skip-fetch")
        features = pd.read_parquet(FEATURES_FILE)

    ml_scores = _load_ml_scores()
    ml_lookup: dict[tuple[str, int], dict] = {}
    if ml_scores is not None:
        for _, r in ml_scores.iterrows():
            ml_lookup[(r["ticker"], int(r["year"]))] = {
                "if_score": r.get("if_score"),
                "xgb_score": r.get("xgb_score"),
                "shap_top1": r.get("shap_top1", ""),
            }
        logger.info("Using ML scores from %s", ML_SCORES_FILE)

    scored_rows: list[dict] = []
    flags_records: list[dict] = []

    for ticker, company_df in features.groupby("ticker"):
        company_df = company_df.sort_values("year")
        sector = company_df.iloc[0]["sector"]
        sector_df = features[features["sector"] == sector]

        for _, row in company_df.iterrows():
            key = (ticker, int(row["year"]))
            ml = ml_lookup.get(key, {})
            result = compute_risk_score(
                row,
                company_df,
                sector_df,
                if_score=ml.get("if_score"),
                xgb_score=ml.get("xgb_score"),
            )
            scored = {
                "ticker": ticker,
                "name_ar": row["name_ar"],
                "name_en": row["name_en"],
                "sector": row["sector"],
                "year": int(row["year"]),
                "m_score": row.get("m_score"),
                "shap_top1": ml.get("shap_top1", ""),
                **{k: v for k, v in result.items() if k != "flags"},
            }
            scored_rows.append(scored)

            for flag in result["flags"]:
                flags_records.append(
                    {
                        "ticker": ticker,
                        "period": int(row["year"]),
                        "flag_id": flag.flag_id,
                        "severity": flag.severity,
                        "explanation_ar": flag.explanation_ar,
                        "evidence": flag.evidence,
                    }
                )

    scores_df = pd.DataFrame(scored_rows)
    latest = scores_df.sort_values("year").groupby("ticker").tail(1).reset_index(drop=True)

    SCORES_OUT.parent.mkdir(parents=True, exist_ok=True)
    scores_df.to_parquet(SCORES_OUT, index=False)
    persist_scores(scores_df, flags_records)

    return latest


def print_distribution(latest: pd.DataFrame) -> None:
    """Sanity check: distribution of risk levels."""
    total = len(latest)
    if total == 0:
        logger.warning("No companies scored")
        return

    dist = latest["risk_level"].value_counts()
    high_pct = dist.get(LEVEL_HIGH, 0) / total * 100

    print("\n" + "=" * 60)
    print("توزيع درجات المخاطر (أحدث سنة لكل شركة)")
    print("=" * 60)
    for level, label in [
        (LEVEL_LOW, "منخفض (0–39)"),
        (LEVEL_MEDIUM, "متوسط (40–69)"),
        (LEVEL_HIGH, "مرتفع (70–100)"),
    ]:
        count = dist.get(level, 0)
        print(f"  {label}: {count} ({count/total*100:.0f}%)")

    if high_pct > 90:
        print("\n⚠️  تحذير: >90% عالية الخطر — تحقق من وحدات البيانات!")
    elif high_pct > 60:
        print("\n⚠️  ملاحظة: نسبة مرتفعة — راجع التوزيع يدوياً")
    else:
        print("\n✓ التوزيع يبدو معقولاً")

    cols = ["ticker", "name_ar", "year", "risk_score", "risk_level", "if_score" if "if_score" in latest.columns else "anomaly_score", "xgb_score"]
    cols = [c for c in cols if c in latest.columns]

    print("\nأعلى 5 مخاطر:")
    print(latest.nlargest(5, "risk_score")[cols].to_string(index=False))

    print("\nأدنى 5:")
    print(latest.nsmallest(5, "risk_score")[cols].to_string(index=False))
    print("=" * 60 + "\n")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    latest = score_all_features()
    print_distribution(latest)
    logger.info("Scores saved → %s and data/raqeeb.db", SCORES_OUT)


if __name__ == "__main__":
    main()
