"""فحوصات جودة صارمة على البيانات الموحّدة."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd

from src.ingestion.schema import REQUIRED_FOR_BENEISH

ROOT = Path(__file__).resolve().parents[2]
INTERIM_FILE = ROOT / "data" / "interim" / "financials.parquet"
VALIDATED_FILE = ROOT / "data" / "interim" / "financials_validated.parquet"
VALIDATION_REPORT = ROOT / "data" / "interim" / "validation_report.json"

BALANCE_TOLERANCE = 0.10  # yfinance often ~8% off; strict 2% logged as warning

logger = logging.getLogger(__name__)


@dataclass
class ValidationReport:
    complete: list[str] = field(default_factory=list)
    partial: list[str] = field(default_factory=list)
    excluded: list[str] = field(default_factory=list)
    details: dict = field(default_factory=dict)

    def summary(self) -> str:
        return (
            f"تقرير التحقق: {len(self.complete)} شركة كاملة، "
            f"{len(self.partial)} ناقصة حقل واحد، "
            f"{len(self.excluded)} مستبعدة"
        )


def _active_years(group: pd.DataFrame) -> pd.DataFrame:
    """Drop placeholder years with no revenue and no assets."""
    return group[group["revenue"].notna() | group["total_assets"].notna()].copy()


def _has_consecutive_years(years: list[int], min_years: int = 2) -> bool:
    if len(years) < min_years:
        return False
    sorted_years = sorted(years)
    for i in range(len(sorted_years) - 1):
        if sorted_years[i + 1] - sorted_years[i] == 1:
            return True
    return False


def _count_missing_beneish_fields(group: pd.DataFrame) -> int:
    """Count beneish fields missing in ALL active years."""
    missing_fields: set[str] = set()
    active = _active_years(group)
    for field in REQUIRED_FOR_BENEISH:
        if field not in active.columns or active[field].isna().all():
            missing_fields.add(field)
    return len(missing_fields)


def validate_company(ticker: str, group: pd.DataFrame) -> tuple[str, list[str]]:
    """
    Validate one company. Returns (category, reasons).
    category: 'complete' | 'partial' | 'excluded'
    """
    reasons: list[str] = []
    active = _active_years(group)
    years = sorted(active["year"].unique().tolist())

    if not _has_consecutive_years(years):
        reasons.append("أقل من سنتين متتاليتين")

    for _, row in active.iterrows():
        yr = row["year"]
        for col in ("revenue", "total_assets"):
            if col in row and not pd.isna(row[col]) and row[col] < 0:
                reasons.append(f"قيمة سالبة في {col} ({yr})")

        ta = row.get("total_assets")
        tl = row.get("total_liabilities")
        te = row.get("total_equity")
        if not any(pd.isna(v) for v in (ta, tl, te)) and ta != 0:
            implied = tl + te
            diff = abs(ta - implied) / abs(ta)
            if diff > BALANCE_TOLERANCE:
                reasons.append(
                    f"معادلة الميزانية غير متوازنة {yr} (فرق {diff:.1%})"
                )
            elif diff > 0.02:
                reasons.append(
                    f"تحذير: فرق ميزانية {yr} ({diff:.1%}) — ضمن السماحية"
                )

    # Warnings alone don't exclude
    hard_reasons = [r for r in reasons if not r.startswith("تحذير")]

    missing_count = _count_missing_beneish_fields(group)

    if hard_reasons:
        return "excluded", reasons
    if missing_count == 0:
        return "complete", reasons
    if missing_count == 1:
        return "partial", reasons + [f"حقل واحد ناقص من Beneish"]
    return "excluded", reasons + [f"{missing_count} حقول ناقصة من Beneish"]


def validate(df: pd.DataFrame | None = None) -> tuple[pd.DataFrame, ValidationReport]:
    """Run validation and return filtered dataframe + report."""
    if df is None:
        if not INTERIM_FILE.exists():
            raise FileNotFoundError(f"Missing file: {INTERIM_FILE} — run normalize first")
        df = pd.read_parquet(INTERIM_FILE)

    report = ValidationReport()

    for ticker, group in df.groupby("ticker"):
        category, reasons = validate_company(ticker, group)
        report.details[ticker] = {"category": category, "reasons": reasons}

        if category == "complete":
            report.complete.append(ticker)
        elif category == "partial":
            report.partial.append(ticker)
        else:
            report.excluded.append(ticker)

    keep = report.complete + report.partial
    validated = df[df["ticker"].isin(keep)].copy()

    VALIDATED_FILE.parent.mkdir(parents=True, exist_ok=True)
    validated.to_parquet(VALIDATED_FILE, index=False)

    VALIDATION_REPORT.write_text(
        json.dumps(
            {
                "complete": report.complete,
                "partial": report.partial,
                "excluded": report.excluded,
                "details": report.details,
                "summary": report.summary(),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    logger.info(report.summary())
    if report.excluded:
        logger.info("Excluded: %s", ", ".join(report.excluded))

    return validated, report


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    validate()


if __name__ == "__main__":
    main()
