"""اختبارات محاكي ماذا لو."""

from fastapi.testclient import TestClient

from src.api.main import app
from src.api.schemas import SimulationInput
from src.api.service import get_service
from src.api.simulator import run_simulation

client = TestClient(app)


def setup_function():
    get_service.cache_clear()


def test_simulate_zero_deltas_matches_stored_score():
    svc = get_service()
    companies = svc.list_companies()
    if not companies:
        return
    ticker = companies[0]["ticker"]
    company = svc.get_company(ticker)
    if not company or company.get("risk_score") is None:
        return

    result = run_simulation(SimulationInput(ticker=ticker))
    assert result.simulated_score == result.original_score
    assert result.score_delta == 0.0
    assert result.original_score == float(company["risk_score"])


def test_simulate_receivables_spike_raises_score():
    svc = get_service()
    companies = svc.list_companies(min_risk=0)
    ticker = None
    for c in companies:
        if c.get("risk_score") is not None:
            ticker = c["ticker"]
            break
    if not ticker:
        return

    baseline = run_simulation(SimulationInput(ticker=ticker))
    stressed = run_simulation(
        SimulationInput(
            ticker=ticker,
            revenue_delta_pct=0,
            receivables_delta_pct=80,
        )
    )
    assert stressed.simulated_score >= baseline.original_score


def test_simulate_api_endpoint():
    svc = get_service()
    companies = svc.list_companies()
    if not companies:
        return
    ticker = companies[0]["ticker"]
    r = client.post("/api/v1/simulate", json={"ticker": ticker})
    assert r.status_code == 200
    data = r.json()
    assert "original_score" in data
    assert "simulated_score" in data
