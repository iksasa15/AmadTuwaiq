"""تدريب Isolation Forest + XGBoost + SHAP — اليوم 4."""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from src.models.anomaly import SectorAnomalyDetector
from src.models.explain import build_shap_explanations, plot_shap_summary
from src.models.xgb_train import (
    build_training_dataset,
    predict_proba,
    save_model,
    train_xgb,
    write_eval_report,
)

ROOT = Path(__file__).resolve().parents[2]
FEATURES_FILE = ROOT / "data" / "processed" / "features.parquet"
ML_SCORES_OUT = ROOT / "data" / "processed" / "ml_scores.parquet"

logger = logging.getLogger(__name__)


def train_all(features: pd.DataFrame | None = None) -> pd.DataFrame:
    """Full ML pipeline: IF + XGBoost + SHAP."""
    if features is None:
        if not FEATURES_FILE.exists():
            raise FileNotFoundError("Run ETL first: python -m src.ingestion.run_all --skip-fetch")
        features = pd.read_parquet(FEATURES_FILE)

    features = features.reset_index(drop=True)

    # --- Isolation Forest ---
    logger.info("=== Training Isolation Forest ===")
    if_detector = SectorAnomalyDetector()
    if_detector.fit(features)
    if_detector.save()
    if_scores = if_detector.score_samples(features)

    # --- XGBoost ---
    logger.info("=== Training XGBoost (synthetic fraud injection) ===")
    training = build_training_dataset(features)
    xgb_model, scaler, metrics = train_xgb(training)
    save_model(xgb_model, scaler)
    write_eval_report(metrics)

    xgb_scores = predict_proba(xgb_model, scaler, features)

    # --- SHAP ---
    logger.info("=== SHAP explanations ===")
    plot_shap_summary(xgb_model, scaler, features)
    shap_df = build_shap_explanations(xgb_model, scaler, features)

    # --- Merge ML scores ---
    ml_scores = features[["ticker", "year", "name_ar", "sector"]].copy()
    ml_scores["if_score"] = if_scores.values
    ml_scores["xgb_score"] = xgb_scores.values
    ml_scores = ml_scores.merge(
        shap_df[["ticker", "year", "shap_explanations_ar", "shap_top1"]],
        on=["ticker", "year"],
        how="left",
    )

    ML_SCORES_OUT.parent.mkdir(parents=True, exist_ok=True)
    ml_scores.to_parquet(ML_SCORES_OUT, index=False)
    logger.info("ML scores → %s (%d rows)", ML_SCORES_OUT, len(ml_scores))

    return ml_scores


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    ml = train_all()
    print(f"\n✓ ML pipeline complete: {len(ml)} rows scored")
    print(f"  IF avg:  {ml['if_score'].mean():.1f}")
    print(f"  XGB avg: {ml['xgb_score'].mean():.1f}")
    print(f"  Reports: reports/model_eval.md, reports/shap_summary.png")


if __name__ == "__main__":
    main()
