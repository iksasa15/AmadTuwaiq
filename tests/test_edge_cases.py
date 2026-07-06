"""Edge cases: بيانات ناقصة، NaN، بنوك."""

import numpy as np
import pandas as pd
import pytest

from src.models.data_quality import (
    assess_company,
    confidence_from_row,
    is_bank_sector,
)
from src.models.scoring import compute_risk_score


def test_single_year_insufficient_data():
    fin = pd.DataFrame(
        [
            {
                "ticker": "TEST.SR",
                "year": 2024,
                "revenue": 1000,
                "total_assets": 5000,
            }
        ]
    )
    out = assess_company("TEST.SR", "Retail", fin)
    assert out["data_status"] == "insufficient"
    assert out["scoring_eligible"] is False
    assert "بيانات غير كافية" in out["message_ar"]


def test_bank_excluded_with_clear_message():
    out = assess_company("1120.SR", "Banks", None)
    assert out["data_status"] == "bank_excluded"
    assert out["scoring_eligible"] is False
    assert is_bank_sector("Banks")
    assert "مصرفي" in out["message_ar"]


def test_nan_indicators_low_confidence_still_scores():
    row = pd.Series(
        {
            "year": 2024,
            "DSRI": np.nan,
            "GMI": np.nan,
            "AQI": np.nan,
            "SGI": 1.05,
            "DEPI": np.nan,
            "SGAI": np.nan,
            "LVGI": 1.0,
            "TATA": 0.03,
            "m_score": -2.0,
            "cfo_to_net_income": 0.8,
            "receivables_to_revenue_growth": 1.0,
            "revenue": 1000,
            "receivables": 100,
            "cogs": 500,
            "total_assets": 5000,
            "current_assets": 2000,
            "ppe": 1500,
            "depreciation": 100,
            "sga": 200,
            "total_debt": 1000,
            "net_income": 100,
            "cfo": 80,
        }
    )
    level, pct = confidence_from_row(row)
    assert level == "low"
    assert pct < 65

    hist = pd.DataFrame([row])
    result = compute_risk_score(row, hist, hist)
    assert 0 <= result["risk_score"] <= 100
    assert result["confidence"] == "low"


def test_two_consecutive_years_ok():
    fin = pd.DataFrame(
        [
            {"year": 2023, "revenue": 900, "total_assets": 4000},
            {"year": 2024, "revenue": 1000, "total_assets": 4500},
        ]
    )
    out = assess_company("TEST.SR", "Retail", fin)
    assert out["data_status"] == "ok"
    assert out["scoring_eligible"] is True


def test_partial_nan_message():
    row = pd.Series({k: 1.0 for k in ["DSRI", "GMI", "AQI", "SGI", "DEPI", "SGAI", "LVGI"]})
    row["TATA"] = np.nan
    row["revenue"] = 1000
    level, _ = confidence_from_row(row)
    assert level in ("medium", "low")
