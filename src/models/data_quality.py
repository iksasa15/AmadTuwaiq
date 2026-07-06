"""تقييم كفاية البيانات وثقة الدرجة — حالات الحافة."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from src.models.beneish import INDICATOR_KEYS

BANK_SECTOR = "Banks"
MIN_YEARS_FOR_SCORING = 2

BENEISH_INPUT_FIELDS = [
    "revenue",
    "receivables",
    "cogs",
    "total_assets",
    "current_assets",
    "ppe",
    "depreciation",
    "sga",
    "total_debt",
    "net_income",
    "cfo",
]

MESSAGES_AR = {
    "insufficient": "بيانات غير كافية — نحتاج سنتين ماليّتين متتاليتين على الأقل",
    "bank_excluded": (
        "قطاع مصرفي — قوائم مختلفة جذريًا عن الشركات التشغيلية؛ "
        "الدرجة غير محسوبة (Beneish غير قابل للتطبيق)"
    ),
    "partial_nan": "ثقة منخفضة — بعض المؤشرات ناقصة؛ الدرجة محسوبة من المتاح",
}


def is_bank_sector(sector: str | None) -> bool:
    return (sector or "").strip() == BANK_SECTOR


def count_active_years(group: pd.DataFrame) -> int:
    active = group[
        group["revenue"].notna() | group.get("total_assets", pd.Series(dtype=float)).notna()
    ]
    return int(active["year"].nunique()) if not active.empty else 0


def has_consecutive_years(years: list[int], min_years: int = MIN_YEARS_FOR_SCORING) -> bool:
    if len(years) < min_years:
        return False
    sorted_years = sorted(set(years))
    for i in range(len(sorted_years) - 1):
        if sorted_years[i + 1] - sorted_years[i] == 1:
            return True
    return False


def indicator_fill_ratio(row: pd.Series) -> float:
    """Share of Beneish indicators present (0–1)."""
    present = sum(
        1 for k in INDICATOR_KEYS if k in row.index and not pd.isna(row.get(k))
    )
    return present / len(INDICATOR_KEYS)


def input_field_fill_ratio(row: pd.Series) -> float:
    present = sum(
        1 for f in BENEISH_INPUT_FIELDS if f in row.index and not pd.isna(row.get(f))
    )
    return present / len(BENEISH_INPUT_FIELDS)


def confidence_from_row(row: pd.Series) -> tuple[str, float]:
    """
    Returns (level, pct) where level ∈ high | medium | low.
    """
    ind_ratio = indicator_fill_ratio(row)
    inp_ratio = input_field_fill_ratio(row)
    pct = round((ind_ratio * 0.7 + inp_ratio * 0.3) * 100, 1)

    if pct >= 90:
        return "high", pct
    if pct >= 65:
        return "medium", pct
    return "low", pct


def assess_company(
    ticker: str,
    sector: str,
    financials: pd.DataFrame | None = None,
    feature_row: pd.Series | None = None,
) -> dict[str, Any]:
    """
    Evaluate whether a company can be scored and how confident we are.

    data_status: ok | insufficient | bank_excluded | partial
    """
    if is_bank_sector(sector):
        return {
            "data_status": "bank_excluded",
            "confidence": None,
            "confidence_pct": None,
            "message_ar": MESSAGES_AR["bank_excluded"],
            "scoring_eligible": False,
        }

    years: list[int] = []
    if financials is not None and not financials.empty:
        active = financials[
            financials["revenue"].notna() | financials["total_assets"].notna()
        ]
        years = sorted(int(y) for y in active["year"].unique())

    if len(years) < MIN_YEARS_FOR_SCORING or not has_consecutive_years(years):
        return {
            "data_status": "insufficient",
            "confidence": None,
            "confidence_pct": None,
            "message_ar": MESSAGES_AR["insufficient"],
            "scoring_eligible": False,
        }

    if feature_row is None:
        return {
            "data_status": "ok",
            "confidence": "medium",
            "confidence_pct": 75.0,
            "message_ar": None,
            "scoring_eligible": True,
        }

    level, pct = confidence_from_row(feature_row)
    status = "ok" if level != "low" else "partial"
    message = MESSAGES_AR["partial_nan"] if level == "low" else None

    return {
        "data_status": status,
        "confidence": level,
        "confidence_pct": pct,
        "message_ar": message,
        "scoring_eligible": True,
    }


def impute_row_for_scoring(row: pd.Series) -> pd.Series:
    """Fill NaN indicators with sector-neutral defaults so scoring does not crash."""
    out = row.copy()
    defaults = {
        "DSRI": 1.0,
        "GMI": 1.0,
        "AQI": 1.0,
        "SGI": 1.0,
        "DEPI": 1.0,
        "SGAI": 1.0,
        "LVGI": 1.0,
        "TATA": 0.0,
        "m_score": -2.5,
        "cfo_to_net_income": np.nan,
        "receivables_to_revenue_growth": np.nan,
    }
    for k, v in defaults.items():
        if k in out.index and pd.isna(out[k]):
            out[k] = v
    return out
