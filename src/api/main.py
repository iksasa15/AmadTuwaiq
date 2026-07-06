"""FastAPI — رقيب API v1."""

from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from src.api.portfolio import build_portfolio_report, parse_portfolio_file
from src.api.schemas import (
    CompanyDetail,
    CompanySummary,
    FlagItem,
    MarketOverview,
    PortfolioReport,
    RefreshResponse,
    SimulationInput,
    SimulationResult,
    TimelineResponse,
)
from src.api.service import get_service
from src.api.simulator import run_simulation
from src.api.timeline import get_timeline

app = FastAPI(
    title="رقيب API",
    description="منصة رقابة مالية استباقية — كشف مخاطر الاحتيال",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "raqeeb"}


@app.get("/api/v1/companies", response_model=list[CompanySummary])
def list_companies(sector: str | None = None, min_risk: int = 0, include_banks: bool = False):
    return get_service().list_companies(
        sector=sector, min_risk=min_risk, include_banks=include_banks
    )


@app.get("/api/v1/companies/{ticker}", response_model=CompanyDetail)
def company_detail(ticker: str):
    data = get_service().get_company(ticker)
    if data is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return data


@app.get("/api/v1/companies/{ticker}/flags", response_model=list[FlagItem])
def company_flags(ticker: str):
    data = get_service().get_company(ticker)
    if data is None:
        raise HTTPException(status_code=404, detail="Company not found")
    if not data.get("scoring_eligible", True) or data.get("latest_year") is None:
        return []
    return get_service().get_flags(ticker, period=data["latest_year"])


@app.get("/api/v1/market/overview", response_model=MarketOverview)
def market_overview():
    return get_service().market_overview()


@app.post("/api/v1/refresh", response_model=RefreshResponse)
def refresh_data(skip_fetch: bool = True):
    """
    إعادة جلب البيانات وحساب الدرجات — للعرض التقديمي المباشر.

    `skip_fetch=true` (افتراضي): يستخدم parquet المحلي — أسرع.
    """
    try:
        from src.refresh import run_refresh

        return run_refresh(skip_fetch=skip_fetch, skip_ml=True)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
