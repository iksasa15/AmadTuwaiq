"""جلب القوائم المالية من yfinance وحفظها كـ parquet."""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import pandas as pd
import yfinance as yf

ROOT = Path(__file__).resolve().parents[2]
COMPANIES_CSV = ROOT / "data" / "companies.csv"
RAW_DIR = ROOT / "data" / "raw"
FAILED_FILE = ROOT / "data" / "failed.txt"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def load_companies() -> pd.DataFrame:
    return pd.read_csv(COMPANIES_CSV)


def fetch_company(ticker: str, out_dir: Path) -> bool:
    """Fetch financial statements for one ticker. Returns True on success."""
    try:
        stock = yf.Ticker(ticker)
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow

        if financials.empty and balance_sheet.empty and cashflow.empty:
            logger.warning("%s: all statements empty", ticker)
            return False

        out_dir.mkdir(parents=True, exist_ok=True)

        if not financials.empty:
            financials.to_parquet(out_dir / "financials.parquet")
        if not balance_sheet.empty:
            balance_sheet.to_parquet(out_dir / "balance_sheet.parquet")
        if not cashflow.empty:
            cashflow.to_parquet(out_dir / "cashflow.parquet")

        years = len(financials.columns) if not financials.empty else 0
        logger.info("%s: saved (%d income periods)", ticker, years)
        return True

    except Exception as exc:
        logger.error("%s: %s", ticker, exc)
        return False


def run_fetch(tickers: list[str] | None = None) -> tuple[list[str], list[str]]:
    companies = load_companies()
    if tickers:
        companies = companies[companies["ticker"].isin(tickers)]

    succeeded: list[str] = []
    failed: list[str] = []

    for _, row in companies.iterrows():
        ticker = row["ticker"]
        ok = fetch_company(ticker, RAW_DIR / ticker.replace(".", "_"))
        if ok:
            succeeded.append(ticker)
        else:
            failed.append(ticker)

    FAILED_FILE.write_text("\n".join(failed) + ("\n" if failed else ""), encoding="utf-8")
    logger.info("Done: %d succeeded, %d failed", len(succeeded), len(failed))
    return succeeded, failed


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Saudi company financials via yfinance")
    parser.add_argument("--ticker", action="append", help="Fetch specific ticker(s) only")
    args = parser.parse_args()

    succeeded, failed = run_fetch(args.ticker)

    if failed:
        logger.info("Failed tickers written to %s", FAILED_FILE)
        sys.exit(1 if not succeeded else 0)


if __name__ == "__main__":
    main()
