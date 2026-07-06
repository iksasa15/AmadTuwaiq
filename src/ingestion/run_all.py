"""Pipeline كامل: raw → interim → processed."""

from __future__ import annotations

import argparse
import logging
import sys

from src.features.build import build_features
from src.ingestion.fetch_yf import run_fetch
from src.ingestion.from_sheet import create_template, merge_sheet
from src.ingestion.normalize import normalize_all
from src.ingestion.validate import validate

logger = logging.getLogger(__name__)


def run_pipeline(skip_fetch: bool = False, fetch_only: bool = False) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    if not skip_fetch:
        logger.info("=== Step 1/5: Fetch raw data (yfinance) ===")
        succeeded, failed = run_fetch()
        if not succeeded:
            logger.error("Fetch failed for all companies")
            return 1
        if failed:
            logger.warning("%d companies failed fetch — see data/failed.txt", len(failed))

    if fetch_only:
        return 0

    logger.info("=== Step 2/5: Normalize schema ===")
    normalize_all()

    logger.info("=== Step 3/5: Merge manual sheet ===")
    create_template()
    merge_sheet()

    logger.info("=== Step 4/5: Validate ===")
    validated, report = validate()
    print(report.summary())

    logger.info("=== Step 5/5: Build features ===")
    features = build_features(validated)
    print(
        f"\n✓ Pipeline complete:\n"
        f"  financials → data/processed/financials.parquet ({len(validated)} rows)\n"
        f"  features   → data/processed/features.parquet ({len(features)} rows)\n"
    )
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Run full ETL pipeline")
    parser.add_argument("--skip-fetch", action="store_true", help="Skip yfinance fetch")
    parser.add_argument("--fetch-only", action="store_true", help="Only fetch raw data")
    args = parser.parse_args()
    sys.exit(run_pipeline(skip_fetch=args.skip_fetch, fetch_only=args.fetch_only))


if __name__ == "__main__":
    main()
