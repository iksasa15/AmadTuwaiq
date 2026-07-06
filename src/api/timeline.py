"""آلة الزمن — timeline مع حالات أزمات موثقة."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from pydantic import BaseModel

from src.api.service import normalize_ticker, get_service
from src.models.scoring import risk_level as compute_risk_level

ROOT = Path(__file__).resolve().parents[2]
KNOWN_CASES_FILE = ROOT / "data" / "known_cases.json"


class TimelinePoint(BaseModel):
    period: str
    year: int
    risk_score: float
    risk_level: str
    is_known_crisis_point: bool = False
    crisis_label_ar: str | None = None
    is_first_high_risk: bool = False


class TimelineResponse(BaseModel):
    ticker: str
    has_known_case: bool
    months_before_official: int | None = None
    source_note: str | None = None
    points: list[TimelinePoint]


def _load_known_cases() -> list[dict]:
    if not KNOWN_CASES_FILE.exists():
        return []
    with open(KNOWN_CASES_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def _period_to_year(period: str) -> int:
    if "-Q" in period:
        return int(period.split("-")[0])
    return int(period[:4])


def _year_to_period(year: int) -> str:
    return f"{year}-Q4"


def get_timeline(ticker: str) -> TimelineResponse | None:
    ticker = normalize_ticker(ticker)
    service = get_service()
    company = service.get_company(ticker)
    if company is None:
        return None

    history = company.get("score_history") or []
    if not history:
        return TimelineResponse(
            ticker=ticker,
            has_known_case=False,
            points=[],
        )

    known = next((c for c in _load_known_cases() if c.get("ticker") == ticker), None)
    crisis_year = _period_to_year(known["crisis_period"]) if known else None

    points: list[TimelinePoint] = []
    first_high_year: int | None = None

    for h in history:
        year = int(h["year"])
        score = float(h["risk_score"])
        level = compute_risk_level(score)
        is_crisis = known is not None and year == crisis_year
        if level in ("high", "critical") and first_high_year is None:
            first_high_year = year

        points.append(
            TimelinePoint(
                period=_year_to_period(year),
                year=year,
                risk_score=score,
                risk_level=level,
                is_known_crisis_point=is_crisis,
                crisis_label_ar=known.get("crisis_label_ar") if is_crisis else None,
                is_first_high_risk=year == first_high_year and level in ("high", "critical"),
            )
        )

    months_before = None
    source_note = None
    if known and crisis_year and first_high_year and first_high_year < crisis_year:
        months_before = (crisis_year - first_high_year) * 12
        source_note = known.get("source_note")

    return TimelineResponse(
        ticker=ticker,
        has_known_case=known is not None,
        months_before_official=months_before,
        source_note=source_note,
        points=points,
    )
