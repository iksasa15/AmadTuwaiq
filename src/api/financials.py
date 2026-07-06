"""بناء القوائم المالية للـ API."""

from __future__ import annotations

import pandas as pd

FIELDS = [
    "revenue",
    "cogs",
    "sga",
    "operating_income",
    "net_income",
    "total_assets",
    "current_assets",
    "receivables",
    "ppe",
    "total_liabilities",
    "total_debt",
    "total_equity",
    "cfo",
    "depreciation",
]


def _line(label_ar: str, values: list, bold: bool = False, highlight: bool = False) -> dict:
    return {
        "label_ar": label_ar,
        "values": values,
        "bold": bold,
        "highlight": highlight,
    }


def _col(df: pd.DataFrame, key: str) -> list[float | None]:
    if key not in df.columns:
        return [None] * len(df)
    out: list[float | None] = []
    for v in df[key]:
        if pd.isna(v):
            out.append(None)
        else:
            out.append(float(v))
    return out


def build_financial_statements(fin_df: pd.DataFrame) -> dict | None:
    """Return structured statements for last 4 years."""
    if fin_df.empty:
        return None

    df = fin_df.sort_values("year").tail(4).reset_index(drop=True)
    years = [int(y) for y in df["year"]]

    revenue = _col(df, "revenue")
    cogs = _col(df, "cogs")
    gross = [
        (r - c) if r is not None and c is not None else None
        for r, c in zip(revenue, cogs)
    ]

    return {
        "years": years,
        "unit_label_ar": "القيم بالمليون ريال سعودي",
        "income": [
            _line("الإيرادات", revenue, bold=True, highlight=True),
            _line("تكلفة المبيعات", cogs),
            _line("مجمل الربح", gross, bold=True),
            _line("المصاريف العمومية والإدارية", _col(df, "sga")),
            _line("الربح التشغيلي", _col(df, "operating_income"), bold=True),
            _line("صافي الربح", _col(df, "net_income"), bold=True, highlight=True),
        ],
        "balance": [
            _line("إجمالي الأصول", _col(df, "total_assets"), bold=True),
            _line("الأصول المتداولة", _col(df, "current_assets")),
            _line("الذمم المدينة", _col(df, "receivables"), highlight=True),
            _line("الممتلكات والمعدات", _col(df, "ppe")),
            _line("إجمالي الخصوم", _col(df, "total_liabilities")),
            _line("إجمالي الديون", _col(df, "total_debt")),
            _line("حقوق الملكية", _col(df, "total_equity"), bold=True),
        ],
        "cashflow": [
            _line("التدفق النقدي التشغيلي", _col(df, "cfo"), bold=True, highlight=True),
            _line("الإهلاك والاستهلاك", _col(df, "depreciation")),
        ],
    }
