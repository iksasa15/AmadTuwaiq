"""تحديث تلقائي: جلب → ETL → إعادة حساب → تحديث API."""

from __future__ import annotations

import argparse
import logging
import sys
import time
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def run_refresh(
    skip_fetch: bool = False,
    skip_ml: bool = True,
) -> dict:
    """
    Full data refresh pipeline.

    skip_ml=True (default): يعيد استخدام ml_scores.parquet الحالي — أسرع للـ demo.
    """
    from src.api.service import get_service
    from src.ingestion.run_all import run_pipeline
    from src.models.run_beneish import score_all_features

    started = datetime.now(timezone.utc)

    logger.info("=== Refresh: ETL ===")
    code = run_pipeline(skip_fetch=skip_fetch)
    if code != 0:
        raise RuntimeError("ETL pipeline failed")

    if not skip_ml:
        logger.info("=== Refresh: ML training ===")
        from src.models.train_ml import main as train_ml

        train_ml()

    logger.info("=== Refresh: Risk scoring ===")
    latest = score_all_features()

    get_service.cache_clear()
    svc = get_service()
    overview = svc.market_overview()

    finished = datetime.now(timezone.utc)
    return {
        "status": "ok",
        "started_at": started.isoformat(),
        "finished_at": finished.isoformat(),
        "duration_seconds": round((finished - started).total_seconds(), 1),
        "companies_scored": len(latest),
        "total_companies": overview["total_companies"],
        "avg_risk_score": overview["avg_risk_score"],
        "distribution": overview["distribution"],
        "updated_at": overview["updated_at"],
    }


def run_daemon(interval_hours: float, skip_fetch: bool = True) -> None:
    """Simple scheduler loop (بديل APScheduler — بدون تبعية إضافية)."""
    interval_sec = interval_hours * 3600
    logger.info("Daemon refresh every %.1f hours (skip_fetch=%s)", interval_hours, skip_fetch)
    while True:
        try:
            result = run_refresh(skip_fetch=skip_fetch)
            logger.info("Refresh OK: %d companies", result["companies_scored"])
        except Exception:
            logger.exception("Refresh failed")
        time.sleep(interval_sec)


def main() -> None:
    parser = argparse.ArgumentParser(description="Raqeeb data refresh")
    parser.add_argument("--skip-fetch", action="store_true", help="Skip yfinance download")
    parser.add_argument("--with-ml", action="store_true", help="Retrain IF + XGB (slow)")
    parser.add_argument(
        "--daemon",
        type=float,
        metavar="HOURS",
        help="Run refresh loop every N hours",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    if args.daemon:
        run_daemon(args.daemon, skip_fetch=args.skip_fetch)
        return

    result = run_refresh(skip_fetch=args.skip_fetch, skip_ml=not args.with_ml)
    print(f"\n✓ Refresh complete in {result['duration_seconds']}s")
    print(f"  Companies scored: {result['companies_scored']}")
    print(f"  Market avg risk:  {result['avg_risk_score']}")
    print(f"  Distribution:     {result['distribution']}")


if __name__ == "__main__":
    main()
