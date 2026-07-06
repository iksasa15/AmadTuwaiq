"""Tests for risk scoring."""

import pandas as pd

from src.models.scoring import LEVEL_HIGH, LEVEL_LOW, compute_risk_score, evaluate_rule_flags, risk_level


def test_risk_level_buckets():
    assert risk_level(20) == LEVEL_LOW
    assert risk_level(55) == "medium"
    assert risk_level(80) == LEVEL_HIGH


def test_rule_flag_depi():
    row = pd.Series({"year": 2024, "DEPI": 1.35, "LVGI": 1.0, "m_score": -2.5, "TATA": 0.01})
    hist = pd.DataFrame([row])
    flags = evaluate_rule_flags(row, hist)
    assert any(f.flag_id == "depi_high" for f in flags)


def test_compute_risk_score_range():
    features = pd.DataFrame(
        [
            {
                "ticker": "T.SR",
                "year": 2023,
                "sector": "Test",
                "name_ar": "اختبار",
                "DSRI": 1.0,
                "TATA": 0.02,
                "DEPI": 1.0,
                "LVGI": 1.0,
                "m_score": -2.2,
                "cfo_to_net_income": 1.2,
                "receivables_to_revenue_growth": 1.0,
            },
            {
                "ticker": "T.SR",
                "year": 2024,
                "sector": "Test",
                "name_ar": "اختبار",
                "DSRI": 1.0,
                "TATA": 0.02,
                "DEPI": 1.0,
                "LVGI": 1.0,
                "m_score": -2.2,
                "cfo_to_net_income": 1.2,
                "receivables_to_revenue_growth": 1.0,
            },
        ]
    )
    row = features.iloc[1]
    result = compute_risk_score(row, features, features)
    assert 0 <= result["risk_score"] <= 100
    assert "risk_level" in result
