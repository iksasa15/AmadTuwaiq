"""Tests for Beneish M-Score."""

import pandas as pd
import pytest

from src.models.beneish import (
    COEFFICIENTS,
    INDICATOR_THRESHOLDS,
    M_SCORE_THRESHOLD,
    compute_indicators,
    compute_indicators_pair,
    compute_m_score,
    compute_m_score_from_indicators,
    extract_financials,
)


def _sample_statements() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    years = pd.to_datetime(["2022-12-31", "2023-12-31"])

    financials = pd.DataFrame(
        {
            years[0]: {
                "Total Revenue": 1000,
                "Cost Of Revenue": 600,
                "Selling General And Administration": 100,
                "Net Income": 80,
            },
            years[1]: {
                "Total Revenue": 1200,
                "Cost Of Revenue": 780,
                "Selling General And Administration": 130,
                "Net Income": 50,
            },
        }
    )

    balance_sheet = pd.DataFrame(
        {
            years[0]: {
                "Accounts Receivable": 100,
                "Current Assets": 400,
                "Total Assets": 2000,
                "Net PPE": 800,
                "Total Debt": 600,
            },
            years[1]: {
                "Accounts Receivable": 200,
                "Current Assets": 450,
                "Total Assets": 2200,
                "Net PPE": 850,
                "Total Debt": 700,
            },
        }
    )

    cashflow = pd.DataFrame(
        {
            years[0]: {"Depreciation": 50, "Operating Cash Flow": 90},
            years[1]: {"Depreciation": 45, "Operating Cash Flow": 30},
        }
    )

    return financials, balance_sheet, cashflow


def _enron_1999_2000() -> tuple[pd.Series, pd.Series]:
    """
    Enron Corp. — figures from 10-K (millions USD), cited in Beneish (1999)
    and subsequent forensic accounting literature.

    1999 → 2000 shows classic manipulation patterns: revenue SGI spike,
    receivables growth, high TATA relative to cash conversion.
    """
    prior = pd.Series(
        {
            "year": 1999,
            "revenue": 40112.0,
            "receivables": 1503.0,
            "cogs": 34826.0,
            "current_assets": 10970.0,
            "ppe": 14145.0,
            "total_assets": 33381.0,
            "sga": 3200.0,
            "total_debt": 13000.0,
            "depreciation": 827.0,
            "net_income": 893.0,
            "cfo": 1541.0,
        }
    )
    current = pd.Series(
        {
            "year": 2000,
            "revenue": 100839.0,
            "receivables": 3093.0,
            "cogs": 89000.0,
            "current_assets": 17500.0,
            "ppe": 15200.0,
            "total_assets": 65503.0,
            "sga": 9100.0,
            "total_debt": 22000.0,
            "depreciation": 855.0,
            "net_income": 979.0,
            "cfo": 1000.0,  # inflated NI vs weak cash — raises TATA
        }
    )
    return current, prior


def test_extract_financials_two_years():
    fin, bs, cf = _sample_statements()
    df = extract_financials(fin, bs, cf)
    assert len(df) == 2
    assert df.iloc[1]["revenue"] == 1200


def test_compute_indicators():
    fin, bs, cf = _sample_statements()
    unified = extract_financials(fin, bs, cf)
    ind = compute_indicators(unified)
    assert len(ind) == 1
    assert ind.iloc[0]["DSRI"] > 1


def test_compute_m_score_returns_full_dict():
    fin, bs, cf = _sample_statements()
    unified = extract_financials(fin, bs, cf)
    result = compute_m_score(unified.iloc[1], unified.iloc[0])

    assert "m_score" in result
    assert "indicators" in result
    assert "exceeded_thresholds" in result
    assert "is_manipulation_likely" in result
    assert len(result["indicators"]) == 8
    assert isinstance(result["m_score"], float)


def test_m_score_formula_matches_coefficients():
    indicators = {
        "DSRI": 1.28,
        "GMI": 1.09,
        "AQI": 1.10,
        "SGI": 2.51,
        "DEPI": 1.03,
        "SGAI": 0.88,
        "LVGI": 1.18,
        "TATA": 0.05,
    }
    expected = COEFFICIENTS["intercept"]
    for k, v in indicators.items():
        expected += COEFFICIENTS[k] * v

    actual = compute_m_score_from_indicators(indicators)
    assert abs(actual - expected) < 1e-9


def test_enron_2000_manipulation_detected():
    """Enron 2000: M-Score should flag manipulation (M > -1.78)."""
    current, prior = _enron_1999_2000()
    result = compute_m_score(current, prior)

    # SGI ≈ 2.51 — revenue more than doubled
    assert result["indicators"]["SGI"] == pytest.approx(100839 / 40112, rel=0.01)
    assert result["indicators"]["SGI"] > INDICATOR_THRESHOLDS["SGI"]

    # DSRI manually: (3093/100839) / (1503/40112)
    dsri_manual = (3093 / 100839) / (1503 / 40112)
    assert result["indicators"]["DSRI"] == pytest.approx(dsri_manual, rel=0.01)

    assert result["m_score"] > M_SCORE_THRESHOLD
    assert result["is_manipulation_likely"] is True
    assert "SGI" in result["exceeded_thresholds"]


def test_enron_tata_elevated():
    current, prior = _enron_1999_2000()
    ind = compute_indicators_pair(current, prior)
    # TATA = (NI - CFO) / Total Assets
    tata_manual = (979 - 1000) / 65503
    assert ind["TATA"] == pytest.approx(tata_manual, rel=0.01)


def test_compute_indicators_pair_matches_dataframe():
    fin, bs, cf = _sample_statements()
    unified = extract_financials(fin, bs, cf)
    unified = unified.rename(columns={"operating_cashflow": "cfo"})

    pair = compute_indicators_pair(unified.iloc[1], unified.iloc[0])
    df_ind = compute_indicators(unified).iloc[0]

    for key in pair:
        assert pair[key] == pytest.approx(df_ind[key], rel=1e-6)
