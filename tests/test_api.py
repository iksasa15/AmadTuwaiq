"""API integration tests."""

from fastapi.testclient import TestClient

from src.api.main import app
from src.api.service import get_service

client = TestClient(app)


def setup_function():
    get_service.cache_clear()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_companies_returns_scored():
    r = client.get("/api/v1/companies")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        assert "risk_score" in data[0]
        assert data[0]["risk_score"] is not None


def test_bank_company_returns_exclusion_note():
    r = client.get("/api/v1/companies/1120.SR")
    assert r.status_code == 200
    data = r.json()
    assert data["data_status"] == "bank_excluded"
    assert data["scoring_eligible"] is False
    assert data["risk_score"] is None
    assert "مصرفي" in data["message_ar"]


def test_bank_listed_with_include_banks():
    r = client.get("/api/v1/companies?include_banks=true")
    assert r.status_code == 200
    banks = [c for c in r.json() if c["sector"] == "Banks"]
    assert len(banks) >= 1
    assert banks[0]["data_status"] == "bank_excluded"


def test_market_overview_banks_note():
    r = client.get("/api/v1/market/overview")
    assert r.status_code == 200
    data = r.json()
    assert "banks_excluded" in data
    assert data["banks_excluded"] >= 5


def test_unknown_company_404():
    r = client.get("/api/v1/companies/9999.SR")
    assert r.status_code == 404


def test_company_detail_has_confidence_fields():
    r = client.get("/api/v1/companies/4001.SR")
    if r.status_code == 200:
        data = r.json()
        assert "confidence" in data
        assert "data_status" in data
