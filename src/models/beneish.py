"""
Beneish M-Score — كشف احتمال التلاعب بالقوائم المالية.

M > -1.78 ⇒ احتمال تلاعب مرتفع
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np
import pandas as pd

M_SCORE_THRESHOLD = -1.78

COEFFICIENTS = {
    "intercept": -4.84,
    "DSRI": 0.92,
    "GMI": 0.528,
    "AQI": 0.404,
    "SGI": 0.892,
    "DEPI": 0.115,
    "SGAI": -0.172,
    "TATA": 4.679,
    "LVGI": -0.327,
}

# عتبات المؤشرات (Beneish 1999 — mean manipulator vs non-manipulator)
INDICATOR_THRESHOLDS = {
    "DSRI": 1.031,
    "GMI": 1.014,
    "AQI": 1.039,
    "SGI": 1.134,
    "DEPI": 1.077,
    "SGAI": 1.041,
    "LVGI": 1.111,
    "TATA": 0.018,
}

INDICATOR_LABELS_AR = {
    "DSRI": "نسبة الذمم المدينة إلى المبيعات",
    "GMI": "مؤشر هامش الربح الإجمالي",
    "AQI": "مؤشر جودة الأصول",
    "SGI": "مؤشر نمو المبيعات",
    "DEPI": "مؤشر الإهلاك",
    "SGAI": "نسبة المصاريف البيعية إلى المبيعات",
    "LVGI": "مؤشر الرافعة المالية",
    "TATA": "الاستحقاقات الكلية إلى الأصول",
}

INDICATOR_KEYS = tuple(INDICATOR_THRESHOLDS.keys())


@dataclass
class BeneishResult:
    m_score: float
    is_manipulation_likely: bool
    indicators: dict[str, float]
    exceeded_thresholds: list[str] = field(default_factory=list)
    year: str = ""


def _safe_div(a: float, b: float, default: float = np.nan) -> float:
    if b == 0 or pd.isna(a) or pd.isna(b):
        return default
    return a / b


def _row_val(row: pd.Series, key: str, aliases: list[str] | None = None) -> float:
    if key in row.index and not pd.isna(row[key]):
        return float(row[key])
    if aliases:
        for alias in aliases:
            if alias in row.index and not pd.isna(row[alias]):
                return float(row[alias])
    return np.nan


def compute_indicators_pair(
    df_current: pd.Series,
    df_prior: pd.Series,
) -> dict[str, float]:
    """Compute 8 Beneish indices from consecutive year rows."""
    recv_sales_cur = _safe_div(
        _row_val(df_current, "receivables"),
        _row_val(df_current, "revenue"),
    )
    recv_sales_prev = _safe_div(
        _row_val(df_prior, "receivables"),
        _row_val(df_prior, "revenue"),
    )
    dsri = _safe_div(recv_sales_cur, recv_sales_prev)

    rev_cur = _row_val(df_current, "revenue")
    rev_prev = _row_val(df_prior, "revenue")
    cogs_cur = _row_val(df_current, "cogs")
    cogs_prev = _row_val(df_prior, "cogs")

    gm_cur = _safe_div(rev_cur - cogs_cur, rev_cur)
    gm_prev = _safe_div(rev_prev - cogs_prev, rev_prev)
    gmi = _safe_div(gm_prev, gm_cur)

    ca_cur = _row_val(df_current, "current_assets")
    ca_prev = _row_val(df_prior, "current_assets")
    ppe_cur = _row_val(df_current, "ppe")
    ppe_prev = _row_val(df_prior, "ppe")
    ta_cur = _row_val(df_current, "total_assets")
    ta_prev = _row_val(df_prior, "total_assets")

    aqi_cur = 1 - _safe_div(ca_cur + ppe_cur, ta_cur)
    aqi_prev = 1 - _safe_div(ca_prev + ppe_prev, ta_prev)
    aqi = _safe_div(aqi_cur, aqi_prev)

    sgi = _safe_div(rev_cur, rev_prev)

    dep_cur = _row_val(df_current, "depreciation")
    dep_prev = _row_val(df_prior, "depreciation")
    dep_rate_prev = _safe_div(dep_prev, dep_prev + ppe_prev)
    dep_rate_cur = _safe_div(dep_cur, dep_cur + ppe_cur)
    depi = _safe_div(dep_rate_prev, dep_rate_cur)

    sga_cur = _safe_div(_row_val(df_current, "sga"), rev_cur)
    sga_prev = _safe_div(_row_val(df_prior, "sga"), rev_prev)
    sgai = _safe_div(sga_cur, sga_prev)

    debt_cur = _row_val(df_current, "total_debt")
    debt_prev = _row_val(df_prior, "total_debt")
    lev_cur = _safe_div(debt_cur, ta_cur)
    lev_prev = _safe_div(debt_prev, ta_prev)
    lvgi = _safe_div(lev_cur, lev_prev)

    ni = _row_val(df_current, "net_income")
    cfo = _row_val(df_current, "cfo", ["operating_cashflow"])
    accruals = ni - cfo
    tata = _safe_div(accruals, ta_cur)

    return {
        "DSRI": dsri,
        "GMI": gmi,
        "AQI": aqi,
        "SGI": sgi,
        "DEPI": depi,
        "SGAI": sgai,
        "LVGI": lvgi,
        "TATA": tata,
    }


def _m_score_from_indicators(indicators: dict[str, float]) -> float:
    score = COEFFICIENTS["intercept"]
    for key in INDICATOR_KEYS:
        val = indicators.get(key, np.nan)
        if not pd.isna(val):
            score += COEFFICIENTS[key] * val
    return score


def _exceeded_thresholds(indicators: dict[str, float]) -> list[str]:
    exceeded: list[str] = []
    for key, threshold in INDICATOR_THRESHOLDS.items():
        val = indicators.get(key)
        if pd.isna(val):
            continue
        if key == "SGAI":
            if val > threshold:
                exceeded.append(key)
        elif val > threshold:
            exceeded.append(key)
    return exceeded


def compute_m_score(
    df_current: pd.Series,
    df_prior: pd.Series,
) -> dict[str, Any]:
    """
    Compute Beneish M-Score for one year vs prior year.

    Returns dict with m_score, indicators, exceeded_thresholds, is_manipulation_likely.
    """
    indicators = compute_indicators_pair(df_current, df_prior)
    m = _m_score_from_indicators(indicators)
    exceeded = _exceeded_thresholds(indicators)

    return {
        "m_score": m,
        "is_manipulation_likely": m > M_SCORE_THRESHOLD,
        "indicators": indicators,
        "exceeded_thresholds": exceeded,
        "year": str(df_current.get("year", "")),
    }


def compute_m_score_from_indicators(indicators: pd.Series | dict) -> float:
    """Backward-compatible: M-Score from precomputed indicator row."""
    if isinstance(indicators, pd.Series):
        indicators = indicators.to_dict()
    return _m_score_from_indicators(indicators)


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute 8 Beneish indices for each year (needs prior year)."""
    rows = []
    for i in range(1, len(df)):
        cur = df.iloc[i]
        prev = df.iloc[i - 1]
        ind = compute_indicators_pair(cur, prev)
        ind["year"] = cur["year"]
        rows.append(ind)
    return pd.DataFrame(rows)


def analyze_company(group: pd.DataFrame) -> list[BeneishResult]:
    """Run Beneish on normalized financial rows for one company."""
    group = group.sort_values("year").reset_index(drop=True)
    results: list[BeneishResult] = []

    for i in range(1, len(group)):
        out = compute_m_score(group.iloc[i], group.iloc[i - 1])
        results.append(
            BeneishResult(
                m_score=out["m_score"],
                is_manipulation_likely=out["is_manipulation_likely"],
                indicators=out["indicators"],
                exceeded_thresholds=out["exceeded_thresholds"],
                year=str(out["year"]),
            )
        )
    return results


# --- legacy helpers (yfinance raw statements) ---

def _get(row: pd.Series, *keys: str, default: float = np.nan) -> float:
    for key in keys:
        if key in row.index:
            val = row[key]
            if not pd.isna(val):
                return float(val)
    return default


def extract_financials(
    financials: pd.DataFrame,
    balance_sheet: pd.DataFrame,
    cashflow: pd.DataFrame,
) -> pd.DataFrame:
    """Merge yfinance statements into a unified yearly DataFrame."""
    records = []
    years = sorted(
        {str(c.year) for c in financials.columns if hasattr(c, "year")},
        reverse=True,
    )

    for year in years:
        col = next((c for c in financials.columns if str(c.year) == year), None)
        if col is None:
            continue

        bs_col = next((c for c in balance_sheet.columns if str(c.year) == year), None)
        cf_col = next((c for c in cashflow.columns if str(c.year) == year), None)

        fin = financials[col] if col in financials.columns else pd.Series(dtype=float)
        bs = balance_sheet[bs_col] if bs_col is not None else pd.Series(dtype=float)
        cf = cashflow[cf_col] if cf_col is not None else pd.Series(dtype=float)

        records.append(
            {
                "year": year,
                "revenue": _get(fin, "Total Revenue", "Operating Revenue"),
                "cogs": _get(fin, "Cost Of Revenue", "Reconciled Cost Of Revenue"),
                "sga": _get(
                    fin,
                    "Selling General And Administration",
                    "General And Administrative Expense",
                ),
                "net_income": _get(fin, "Net Income", "Net Income Common Stockholders"),
                "receivables": _get(bs, "Accounts Receivable", "Net Receivables"),
                "current_assets": _get(bs, "Current Assets"),
                "total_assets": _get(bs, "Total Assets"),
                "ppe": _get(bs, "Net PPE", "Property Plant Equipment"),
                "total_debt": _get(bs, "Total Debt", "Long Term Debt"),
                "depreciation": _get(cf, "Depreciation", "Depreciation And Amortization"),
                "operating_cashflow": _get(cf, "Operating Cash Flow"),
            }
        )

    return pd.DataFrame(records).sort_values("year").reset_index(drop=True)


def analyze(
    financials: pd.DataFrame,
    balance_sheet: pd.DataFrame,
    cashflow: pd.DataFrame,
) -> list[BeneishResult]:
    """Full pipeline from raw yfinance statements."""
    unified = extract_financials(financials, balance_sheet, cashflow)
    if len(unified) < 2:
        return []
    return analyze_company(unified)
