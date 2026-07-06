"""مخطط البيانات الموحّد — مصدر واحد للحقول والأسماء البديلة."""

from __future__ import annotations

FIELD_MAP: dict[str, list[str]] = {
    "revenue": ["Total Revenue", "Operating Revenue"],
    "receivables": ["Net Receivables", "Accounts Receivable", "Receivables"],
    "cogs": ["Cost Of Revenue", "Cost Of Goods Sold", "Reconciled Cost Of Revenue"],
    "total_assets": ["Total Assets"],
    "current_assets": [
        "Total Current Assets",
        "Current Assets",
        "Cash And Cash Equivalents And Federal Funds Sold",
        "Cash Cash Equivalents And Federal Funds Sold",
    ],
    "ppe": ["Net PPE", "Property Plant Equipment Net", "Property Plant Equipment"],
    "depreciation": [
        "Depreciation",
        "Depreciation And Amortization",
        "Reconciled Depreciation",
    ],
    "sga": [
        "Selling General And Administration",
        "General And Administrative Expense",
        "SG&A",
    ],
    "total_debt": ["Total Debt", "Long Term Debt"],
    "net_income": [
        "Net Income",
        "Net Income Common Stockholders",
        "Net Income From Continuing Operation Net Minority Interest",
    ],
    "cfo": [
        "Operating Cash Flow",
        "Cash Flow From Continuing Operating Activities",
    ],
    "operating_income": ["Operating Income", "EBIT"],
    "total_liabilities": [
        "Total Liabilities Net Minority Interest",
        "Total Liabilities",
    ],
    "total_equity": [
        "Stockholders Equity",
        "Total Equity Gross Minority Interest",
        "Common Stock Equity",
    ],
}

CANONICAL_COLUMNS = list(FIELD_MAP.keys())

REQUIRED_FOR_BENEISH = [
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

REQUIRED_FOR_VALIDATION = ["revenue", "total_assets", "total_liabilities", "total_equity"]
