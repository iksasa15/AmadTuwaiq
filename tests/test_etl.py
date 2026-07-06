"""Tests for ETL pipeline."""

import pandas as pd
import pytest

from src.ingestion.normalize import _resolve_field
from src.ingestion.schema import FIELD_MAP
from src.ingestion.validate import validate_company


def test_resolve_field_finds_alias():
    stmt = pd.Series({"Total Revenue": 1000.0, "Other": 99.0})
    assert _resolve_field(stmt, FIELD_MAP["revenue"]) == 1000.0


def test_resolve_field_missing_returns_nan():
    stmt = pd.Series({"Other": 99.0})
    import numpy as np

    assert np.isnan(_resolve_field(stmt, FIELD_MAP["revenue"]))


def test_validate_company_complete():
    df = pd.DataFrame(
        [
            {
                "ticker": "TEST.SR",
                "year": 2022,
                "revenue": 1000,
                "total_assets": 5000,
                "total_liabilities": 3000,
                "total_equity": 2000,
                "receivables": 100,
                "cogs": 600,
                "current_assets": 1000,
                "ppe": 2000,
                "depreciation": 50,
                "sga": 100,
                "total_debt": 1500,
                "net_income": 80,
                "cfo": 90,
            },
            {
                "ticker": "TEST.SR",
                "year": 2023,
                "revenue": 1200,
                "total_assets": 5500,
                "total_liabilities": 3200,
                "total_equity": 2300,
                "receivables": 150,
                "cogs": 720,
                "current_assets": 1100,
                "ppe": 2100,
                "depreciation": 48,
                "sga": 120,
                "total_debt": 1600,
                "net_income": 60,
                "cfo": 40,
            },
        ]
    )
    category, reasons = validate_company("TEST.SR", df)
    assert category == "complete"
    assert reasons == []


def test_validate_company_excluded_no_consecutive_years():
    df = pd.DataFrame(
        [
            {"ticker": "X.SR", "year": 2020, "revenue": 100, "total_assets": 500},
            {"ticker": "X.SR", "year": 2022, "revenue": 120, "total_assets": 550},
        ]
    )
    category, _ = validate_company("X.SR", df)
    assert category == "excluded"
