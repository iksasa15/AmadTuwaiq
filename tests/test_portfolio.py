"""اختبارات ماسح المحفظة."""

import io

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.api.portfolio import build_portfolio_report, parse_portfolio_file
from src.api.service import get_service

client = TestClient(app)


def setup_function():
    get_service.cache_clear()


def test_parse_csv_tickers():
    df = pd.DataFrame({"ticker": ["4001.SR", "2222.SR", "7010.SR"]})
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    tickers = parse_portfolio_file(buf.getvalue(), "test.csv")
    assert tickers == ["4001.SR", "2222.SR", "7010.SR"]


def test_parse_arabic_column():
    df = pd.DataFrame({"الرمز": ["4001.SR", "2222.SR"]})
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    tickers = parse_portfolio_file(buf.getvalue(), "test.csv")
    assert len(tickers) == 2


def test_parse_missing_column_raises():
    df = pd.DataFrame({"name": ["أ", "ب"]})
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    with pytest.raises(ValueError, match="تعذّر إيجاد عمود الرموز"):
        parse_portfolio_file(buf.getvalue(), "bad.csv")


def test_build_portfolio_report():
    svc = get_service()
    companies = svc.list_companies()
    if len(companies) < 2:
        return
    tickers = [c["ticker"] for c in companies[:3]] + ["9999.SR"]
    report = build_portfolio_report(tickers, service=svc)
    assert report.matched_companies >= 2
    assert "9999.SR" in report.unmatched_tickers
    assert report.total_companies == len(tickers)


def test_portfolio_scan_api():
    df = pd.DataFrame({"ticker": ["4001.SR", "2222.SR"]})
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    r = client.post(
        "/api/v1/portfolio/scan",
        files={"file": ("portfolio.csv", buf, "text/csv")},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["matched_companies"] >= 1
    assert "rows" in data
