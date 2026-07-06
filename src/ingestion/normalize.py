"""توحيد مخطط البيانات من yfinance إلى schema موحّد."""

from __future__ import annotations

import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd

from src.ingestion.schema import CANONICAL_COLUMNS, FIELD_MAP

ROOT = Path(__file__).resolve().parents[2]
COMPANIES_CSV = ROOT / "data" / "companies.csv"
RAW_DIR = ROOT / "data" / "raw"
INTERIM_DIR = ROOT / "data" / "interim"
INTERIM_FILE = INTERIM_DIR / "financials.parquet"
QUALITY_REPORT = INTERIM_DIR / "quality_report.json"

logger = logging.getLogger(__name__)


def _year_from_col(col) -> str | None:
    if hasattr(col, "year"):
        return str(col.year)
    s = str(col)[:4]
    return s if s.isdigit() else None


def _resolve_field(statement: pd.DataFrame, aliases: list[str]) -> float:
    for alias in aliases:
        if alias in statement.index:
            val = statement[alias]
            if isinstance(val, pd.Series):
                val = val.iloc[0] if len(val) else np.nan
            if not pd.isna(val):
                return float(val)
    return np.nan


def _load_statement(path: Path) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame()
    return pd.read_parquet(path)


def _collect_years(*frames: pd.DataFrame) -> list[str]:
    years: set[str] = set()
    for frame in frames:
        for col in frame.columns:
            y = _year_from_col(col)
            if y:
                years.add(y)
    return sorted(years)


def normalize_company(ticker: str, raw_dir: Path | None = None) -> tuple[pd.DataFrame, dict]:
    """Normalize one company. Returns (records_df, quality_info)."""
    folder = (raw_dir or RAW_DIR) / ticker.replace(".", "_")

    financials = _load_statement(folder / "financials.parquet")
    balance_sheet = _load_statement(folder / "balance_sheet.parquet")
    cashflow = _load_statement(folder / "cashflow.parquet")

    if financials.empty and balance_sheet.empty and cashflow.empty:
        return pd.DataFrame(), {"error": "no raw data"}

    years = _collect_years(financials, balance_sheet, cashflow)
    records: list[dict] = []
    missing_by_year: dict[str, list[str]] = {}

    for year in years:
        fin_col = next((c for c in financials.columns if _year_from_col(c) == year), None)
        bs_col = next((c for c in balance_sheet.columns if _year_from_col(c) == year), None)
        cf_col = next((c for c in cashflow.columns if _year_from_col(c) == year), None)

        fin = financials[fin_col] if fin_col is not None else pd.Series(dtype=float)
        bs = balance_sheet[bs_col] if bs_col is not None else pd.Series(dtype=float)
        cf = cashflow[cf_col] if cf_col is not None else pd.Series(dtype=float)

        row: dict = {"ticker": ticker, "year": int(year), "source": "yfinance"}
        missing: list[str] = []

        for field, aliases in FIELD_MAP.items():
            value = np.nan
            # income statement fields
            if field in (
                "revenue", "cogs", "sga", "net_income", "operating_income"
            ):
                value = _resolve_field(fin, aliases)
            elif field in (
                "receivables", "total_assets", "current_assets", "ppe",
                "total_debt", "total_liabilities", "total_equity",
            ):
                value = _resolve_field(bs, aliases)
            elif field in ("depreciation", "cfo"):
                value = _resolve_field(cf, aliases)
                if pd.isna(value) and field == "depreciation":
                    value = _resolve_field(fin, aliases)

            row[field] = value
            if pd.isna(value):
                missing.append(field)

        if missing:
            missing_by_year[year] = missing
        records.append(row)

    df = pd.DataFrame(records).sort_values("year").reset_index(drop=True)
    quality = {"missing_by_year": missing_by_year, "years": years}
    return df, quality


def impute_sector_fields(df: pd.DataFrame) -> pd.DataFrame:
    """Sector-specific fixes for yfinance gaps."""
    df = df.copy()

    for idx, row in df.iterrows():
        if row.get("sector") != "Banks":
            continue
        if pd.isna(row["cogs"]):
            df.at[idx, "cogs"] = 0.0
        if pd.isna(row["current_assets"]) and not pd.isna(row.get("total_assets")):
            # fallback: use 40% of total assets as liquid proxy for banks
            df.at[idx, "current_assets"] = row["total_assets"] * 0.4
    return df


def normalize_all(
    tickers: list[str] | None = None,
    output: Path | None = None,
) -> pd.DataFrame:
    """Normalize all companies and save to interim."""
    companies = pd.read_csv(COMPANIES_CSV)
    if tickers:
        companies = companies[companies["ticker"].isin(tickers)]

    frames: list[pd.DataFrame] = []
    quality_report: dict = {}

    for _, row in companies.iterrows():
        ticker = row["ticker"]
        df, quality = normalize_company(ticker)
        if df.empty:
            quality_report[ticker] = {"status": "empty", **quality}
            logger.warning("%s: no data to normalize", ticker)
            continue

        meta = companies[companies["ticker"] == ticker].iloc[0]
        df["name_ar"] = meta["name_ar"]
        df["name_en"] = meta["name_en"]
        df["sector"] = meta["sector"]
        df = impute_sector_fields(df)
        frames.append(df)
        quality_report[ticker] = {"status": "ok", **quality}

    if not frames:
        logger.error("No companies normalized")
        return pd.DataFrame()

    result = pd.concat(frames, ignore_index=True)
    out = output or INTERIM_FILE
    out.parent.mkdir(parents=True, exist_ok=True)
    result.to_parquet(out, index=False)

    QUALITY_REPORT.parent.mkdir(parents=True, exist_ok=True)
    QUALITY_REPORT.write_text(
        json.dumps(quality_report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    total_missing = sum(
        len(v.get("missing_by_year", {}))
        for v in quality_report.values()
        if v.get("status") == "ok"
    )
    logger.info(
        "Normalized %d companies, %d rows → %s (quality issues in %d company-years)",
        len(frames),
        len(result),
        out,
        total_missing,
    )
    return result


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    normalize_all()


if __name__ == "__main__":
    main()
