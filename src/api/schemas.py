"""Pydantic response models — مطابقة docs/api-contract.md."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high", "critical"]
Severity = Literal["info", "warning", "critical"]
DataStatus = Literal["ok", "insufficient", "bank_excluded", "partial"]
ConfidenceLevel = Literal["high", "medium", "low"]


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
    risk_score: int | None = None
    risk_level: RiskLevel | None = None
    trend: Literal["up", "down", "stable"] = "stable"
    data_status: DataStatus = "ok"
    confidence: ConfidenceLevel | None = None
    message_ar: str | None = None


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


class StatementLine(BaseModel):
    label_ar: str
    values: list[float | None]
    bold: bool = False
    highlight: bool = False


class FinancialStatements(BaseModel):
    years: list[int]
    unit_label_ar: str
    income: list[StatementLine]
    balance: list[StatementLine]
    cashflow: list[StatementLine]


class CompanyDetail(BaseModel):
    ticker: str
    name_ar: str
    name_en: str
    sector: str
    risk_score: int | None = None
    risk_level: RiskLevel | None = None
    m_score: float | None = None
    latest_year: int | None = None
    score_history: list[ScoreHistoryItem] = Field(default_factory=list)
    flags_count: int = 0
    top_flags: list[TopFlag] = Field(default_factory=list)
    key_metrics: KeyMetrics = Field(default_factory=KeyMetrics)
    shap_top1: str | None = None
    indicators: IndicatorSet | None = None
    sector_avg_indicators: IndicatorSet | None = None
    data_status: DataStatus = "ok"
    confidence: ConfidenceLevel | None = None
    confidence_pct: float | None = None
    message_ar: str | None = None
    scoring_eligible: bool = True
    financial_statements: FinancialStatements | None = None


class FlagItem(BaseModel):
    flag_id: str
    title_ar: str
    severity: Severity
    explanation_ar: str
    evidence: dict[str, Any]
    interrogation_prompt_ar: str | None = None


class SimulationInput(BaseModel):
    ticker: str
    revenue_delta_pct: float = 0.0
    receivables_delta_pct: float = 0.0
    cogs_delta_pct: float = 0.0
    cfo_delta_pct: float = 0.0
    depreciation_delta_pct: float = 0.0


class SimulationResult(BaseModel):
    ticker: str
    original_score: float
    simulated_score: float
    score_delta: float
    original_level: str
    simulated_level: str
    triggered_flags: list[str]
    removed_flags: list[str] = Field(default_factory=list)


class TimelinePoint(BaseModel):
    period: str
    year: int
    risk_score: float
    risk_level: RiskLevel
    is_known_crisis_point: bool = False
    crisis_label_ar: str | None = None
    is_first_high_risk: bool = False


class TimelineResponse(BaseModel):
    ticker: str
    has_known_case: bool
    months_before_official: int | None = None
    source_note: str | None = None
    points: list[TimelinePoint] = Field(default_factory=list)


class PortfolioRow(BaseModel):
    ticker: str
    name_ar: str
    risk_score: float
    risk_level: RiskLevel
    top_flag_ar: str | None = None


class PortfolioReport(BaseModel):
    total_companies: int
    matched_companies: int
    unmatched_tickers: list[str]
    safe_count: int
    watch_count: int
    danger_count: int
    portfolio_safety_pct: float
    rows: list[PortfolioRow]


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
    banks_excluded: int = 0
    banks_note_ar: str | None = None


class RefreshResponse(BaseModel):
    status: str
    started_at: str
    finished_at: str
    duration_seconds: float
    companies_scored: int
    total_companies: int
    avg_risk_score: float
    distribution: RiskDistribution
    updated_at: str
