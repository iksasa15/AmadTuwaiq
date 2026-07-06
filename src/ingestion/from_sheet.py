"""دمج البيانات اليدوية من Google Sheet (مصدّرة CSV)."""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

from src.ingestion.schema import CANONICAL_COLUMNS

ROOT = Path(__file__).resolve().parents[2]
SHEET_CSV = ROOT / "data" / "manual" / "sheet.csv"
SHEET_TEMPLATE = ROOT / "data" / "manual" / "sheet.template.csv"
INTERIM_FILE = ROOT / "data" / "interim" / "financials.parquet"

logger = logging.getLogger(__name__)

SHEET_COLUMNS = ["ticker", "year", "source"] + CANONICAL_COLUMNS


def create_template() -> None:
    """Create empty template CSV for member 3."""
    SHEET_TEMPLATE.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(columns=SHEET_COLUMNS).to_csv(SHEET_TEMPLATE, index=False)
    logger.info("Template → %s", SHEET_TEMPLATE)


def load_sheet(path: Path | None = None) -> pd.DataFrame:
    csv_path = path or SHEET_CSV
    if not csv_path.exists():
        logger.info("No manual sheet at %s — skipping merge", csv_path)
        return pd.DataFrame()

    sheet = pd.read_csv(csv_path)
    missing = set(SHEET_COLUMNS) - set(sheet.columns)
    if missing:
        raise ValueError(f"Sheet missing columns: {missing}")

    sheet["year"] = sheet["year"].astype(int)
    if "source" not in sheet.columns:
        sheet["source"] = "manual"
    else:
        sheet["source"] = sheet["source"].fillna("manual")
    return sheet


def merge_sheet(
    interim: pd.DataFrame | None = None,
    sheet: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """
    Merge manual data into interim financials.
    Manual rows override yfinance for same (ticker, year).
    Manual-only rows are appended.
    """
    if interim is None:
        if not INTERIM_FILE.exists():
            raise FileNotFoundError("Run normalize first")
        interim = pd.read_parquet(INTERIM_FILE)

    if sheet is None:
        sheet = load_sheet()

    if sheet.empty:
        return interim

    # Align columns
    meta_cols = ["name_ar", "name_en", "sector"]
    for col in meta_cols:
        if col not in sheet.columns:
            sheet[col] = None

    combined = pd.concat([interim, sheet], ignore_index=True)

    # Manual overrides yfinance
    combined["_priority"] = combined["source"].map({"manual": 0, "yfinance": 1}).fillna(2)
    combined = (
        combined.sort_values("_priority")
        .drop_duplicates(subset=["ticker", "year"], keep="first")
        .drop(columns=["_priority"])
        .sort_values(["ticker", "year"])
        .reset_index(drop=True)
    )

    combined.to_parquet(INTERIM_FILE, index=False)
    manual_count = len(sheet)
    logger.info("Merged %d manual rows → %s", manual_count, INTERIM_FILE)
    return combined


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    create_template()
    merge_sheet()


if __name__ == "__main__":
    main()
