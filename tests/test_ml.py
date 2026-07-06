"""Tests for ML pipeline."""

import numpy as np
import pandas as pd

from src.models.xgb_train import build_training_dataset, inject_fraud


def _sample_feature_row() -> pd.Series:
    return pd.Series(
        {
            "ticker": "T.SR",
            "year": 2024,
            "sector": "Test",
            "DSRI": 1.0,
            "GMI": 1.0,
            "AQI": 1.0,
            "SGI": 1.05,
            "DEPI": 1.0,
            "SGAI": 1.0,
            "LVGI": 1.0,
            "TATA": 0.02,
            "cfo_to_net_income": 1.1,
            "receivables_growth": 0.05,
            "revenue_growth": 0.08,
            "receivables_to_revenue_growth": 0.6,
            "debt_to_equity": 0.5,
            "debt_to_equity_change": 1.0,
            "gross_margin": 0.3,
            "operating_margin": 0.15,
        }
    )


def test_inject_fraud_raises_risk_signals():
    row = _sample_feature_row()
    fraud = inject_fraud(row, np.random.default_rng(0))
    assert fraud["label"] == 1
    assert fraud["DSRI"] > row["DSRI"]
    assert fraud["SGI"] > row["SGI"]
    assert fraud["TATA"] > row["TATA"]
    assert fraud["cfo_to_net_income"] < row["cfo_to_net_income"]


def test_build_training_dataset_balanced():
    features = pd.DataFrame([_sample_feature_row(), _sample_feature_row()])
    features.loc[1, "ticker"] = "T2.SR"
    training = build_training_dataset(features, np.random.default_rng(0))
    assert len(training) == 4
    assert (training["label"] == 0).sum() == 2
    assert (training["label"] == 1).sum() == 2
