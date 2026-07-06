"""ماسح المحافظ الائتمانية — درع الإنماء."""

from __future__ import annotations

import io
from typing import Any

import pandas as pd
from pydantic import BaseModel, Field

from src.api.service import DataService, get_service, normalize_ticker
from src.models.scoring import RULE_DEFINITIONS, risk_level as compute_risk_level

TICKER_COLUMN_ALIASES = {
    "ticker", "رمز", "الرمز", "رمز السهم", "symbol", "code", "الكود",
}


class PortfolioRow(BaseModel):
    ticker: str
    name_ar: str
    risk_score: float
    risk_level: str
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


def _normalize_col(name: str) -> str:
    return str(name).strip().lower().replace(" ", "_")


def parse_portfolio_file(file_bytes: bytes, filename: str) -> list[str]:
    """استخراج رموز الشركات من CSV أو XLSX."""
    lower = filename.lower()
    if lower.endswith(".xlsx") or lower.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")
    elif lower.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    else:
        raise ValueError("صيغة الملف غير مدعومة — استخدم .csv أو .xlsx")

    if df.empty:
        raise ValueError("الملف فارغ")

    ticker_col = None
    for col in df.columns:
        norm = _normalize_col(col)
        if norm in TICKER_COLUMN_ALIASES or norm.replace("_", "") in {"رمزالسهم", "ticker"}:
            ticker_col = col
            break
        if "ticker" in norm or norm == "رمز" or "رمز" in str(col):
            ticker_col = col
            break

    if ticker_col is None:
        raise ValueError(
            "تعذّر إيجاد عمود الرموز، تأكد أن الملف يحتوي عمودًا باسم ticker أو الرمز"
        )

    tickers: list[str] = []
    for raw in df[ticker_col].dropna().astype(str):
        t = raw.strip()
        if not t or t.lower() == "nan":
            continue
        tickers.append(normalize_ticker(t))

    if not tickers:
        raise ValueError("لم يُعثر على رموز صالحة في الملف")

    return list(dict.fromkeys(tickers))


def _top_flag_ar(service: DataService, ticker: str, period: int | None) -> str | None:
    flags = service.get_flags(ticker, period=period)
    if not flags:
        return None
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    flags.sort(key=lambda f: severity_order.get(f["severity"], 9))
    return flags[0]["title_ar"]


def build_portfolio_report(tickers: list[str], service: DataService | None = None) -> PortfolioReport:
    svc = service or get_service()
    latest = svc._latest_per_company()  # noqa: SLF001 — internal reuse for scan

    rows: list[PortfolioRow] = []
    unmatched: list[str] = []

    for ticker in tickers:
        meta = svc._company_meta(ticker)  # noqa: SLF001
        if meta is None:
            unmatched.append(ticker)
            continue

        company_row = latest[latest["ticker"] == ticker] if not latest.empty else pd.DataFrame()
        if company_row.empty:
            assessment = svc._assessment(ticker, meta["sector"])  # noqa: SLF001
            if not assessment.get("scoring_eligible", False):
                unmatched.append(ticker)
                continue
            unmatched.append(ticker)
            continue

        r = company_row.iloc[0]
        score = float(r["risk_score"])
        period = int(r["year"])
        level = compute_risk_level(score)

        rows.append(
            PortfolioRow(
                ticker=ticker,
                name_ar=str(r.get("name_ar", meta["name_ar"])),
                risk_score=round(score, 1),
                risk_level=level,
                top_flag_ar=_top_flag_ar(svc, ticker, period),
            )
        )

    rows.sort(key=lambda x: x.risk_score, reverse=True)

    safe = sum(1 for r in rows if r.risk_level == "low")
    watch = sum(1 for r in rows if r.risk_level in ("medium",))
    danger = sum(1 for r in rows if r.risk_level in ("high", "critical"))

    matched = len(rows)
    safety_pct = round((safe / matched) * 100, 1) if matched else 0.0

    return PortfolioReport(
        total_companies=len(tickers),
        matched_companies=matched,
        unmatched_tickers=unmatched,
        safe_count=safe,
        watch_count=watch,
        danger_count=danger,
        portfolio_safety_pct=safety_pct,
        rows=rows,
    )
