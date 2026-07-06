"""Pydantic response models — مطابقة docs/api-contract.md."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high", "critical"]
Severity = Literal["info", "warning", "critical"]


BENEISH_INDICATORS = ["DSRI", "GMI", "AQI", "SGI", "DEPI", "SGAI", "LVGI", "TATA"]

INDICATOR_LABELS_AR = {
    "DSRI": "الذمم / المبيعات",
    "GMI": "هامش الربح",
    "AQI": "جودة الأصول",
    "SGI": "نمو المبيعات",
    "DEPI": "الإهلاك",
    "SGAI": "مصاريف بيعية",
    "LVGI": "الرافعة المالية",
    "TATA": "الاستحقاقات",
}


class IndicatorSet(BaseModel):
    DSRI: float | None = None
    GMI: float | None = None
    AQI: float | None = None
    SGI: float | None = None
    DEPI: float | None = None
    SGAI: float | None = None
    LVGI: float | None = None
    TATA: float | None = None


class CompanySummary(BaseModel):
    ticker: str
    name_ar: str
    name_en: str
    sector: str
    risk_score: int
    risk_level: RiskLevel
    trend: Literal["up", "down", "stable"] = "stable"


class ScoreHistoryItem(BaseModel):
    year: int
    risk_score: int
    m_score: float | None = None


class TopFlag(BaseModel):
    flag_id: str
    title_ar: str
    severity: Severity


class KeyMetrics(BaseModel):
    cfo_to_net_income: float | None = None
    gross_margin: float | None = None
    debt_to_equity: float | None = None
    receivables_to_revenue_growth: float | None = None


class CompanyDetail(BaseModel):
    ticker: str
    name_ar: str
    name_en: str
    sector: str
    risk_score: int
    risk_level: RiskLevel
    m_score: float | None = None
    latest_year: int
    score_history: list[ScoreHistoryItem]
    flags_count: int
    top_flags: list[TopFlag]
    key_metrics: KeyMetrics
    shap_top1: str | None = None
    indicators: IndicatorSet | None = None
    sector_avg_indicators: IndicatorSet | None = None


class FlagItem(BaseModel):
    flag_id: str
    title_ar: str
    severity: Severity
    explanation_ar: str
    evidence: dict[str, Any]


class TopRiskItem(BaseModel):
    ticker: str
    name_ar: str
    risk_score: int
    risk_level: RiskLevel


class SectorBreakdown(BaseModel):
    sector: str
    avg_risk_score: float
    count: int


class RiskDistribution(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    critical: int = 0


class MarketOverview(BaseModel):
    total_companies: int
    avg_risk_score: float
    distribution: RiskDistribution
    top_risks: list[TopRiskItem]
    sector_breakdown: list[SectorBreakdown]
    updated_at: str
