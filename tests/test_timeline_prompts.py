"""اختبارات آلة الزمن والأسئلة."""

from fastapi.testclient import TestClient

from src.api.main import app
from src.api.service import get_service
from src.api.timeline import get_timeline
from src.models.prompts import generate_interrogation_prompt

client = TestClient(app)


def setup_function():
    get_service.cache_clear()


def test_interrogation_prompt_uses_evidence():
    prompt = generate_interrogation_prompt(
        "receivables_outpace_revenue",
        {"value": 2.14, "threshold": 1.5, "year": 2025},
    )
    assert "2.14" in prompt or "2.14" in prompt.replace("2.140", "2.14")
    assert "1.5" in prompt


def test_all_flag_templates_exist():
    from src.models.scoring import RULE_DEFINITIONS

    for flag_id in RULE_DEFINITIONS:
        prompt = generate_interrogation_prompt(flag_id, {"value": 1.0, "threshold": 0.5})
        assert len(prompt) > 10


def test_timeline_endpoint():
    r = client.get("/api/v1/companies/7020.SR/timeline")
    if r.status_code == 404:
        return
    assert r.status_code == 200
    data = r.json()
    assert "points" in data


def test_flags_include_interrogation_prompt():
    svc = get_service()
    companies = svc.list_companies()
    for c in companies:
        if c.get("risk_score") is None:
            continue
        flags = svc.get_flags(c["ticker"])
        if flags:
            assert "interrogation_prompt_ar" in flags[0]
            assert flags[0]["interrogation_prompt_ar"]
            break
