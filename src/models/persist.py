"""حفظ الدرجات والإشارات في SQLite."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine, text

ROOT = Path(__file__).resolve().parents[2]
DB_PATH = ROOT / "data" / "raqeeb.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

logger = logging.getLogger(__name__)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    period INTEGER NOT NULL,
    risk_score REAL NOT NULL,
    level TEXT NOT NULL,
    m_score REAL,
    anomaly_score REAL,
    rule_flags_score REAL,
    computed_at TEXT NOT NULL,
    UNIQUE(ticker, period)
);

CREATE TABLE IF NOT EXISTS flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    period INTEGER NOT NULL,
    flag_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    explanation_ar TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    computed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_ticker ON scores(ticker);
CREATE INDEX IF NOT EXISTS idx_flags_ticker ON flags(ticker, period);
"""


def init_db(engine) -> None:
    with engine.connect() as conn:
        for stmt in SCHEMA_SQL.strip().split(";"):
            stmt = stmt.strip()
            if stmt:
                conn.execute(text(stmt))
        conn.commit()


def get_engine():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(DATABASE_URL)
    init_db(engine)
    return engine


def persist_scores(scores_df: pd.DataFrame, flags_records: list[dict]) -> None:
    """Write scores and flags to SQLite (replace latest batch)."""
    engine = get_engine()
    now = datetime.now(timezone.utc).isoformat()

    with engine.connect() as conn:
        conn.execute(text("DELETE FROM scores"))
        conn.execute(text("DELETE FROM flags"))

        for _, row in scores_df.iterrows():
            conn.execute(
                text("""
                    INSERT INTO scores
                    (ticker, period, risk_score, level, m_score, anomaly_score,
                     rule_flags_score, computed_at)
                    VALUES (:ticker, :period, :risk_score, :level, :m_score,
                            :anomaly_score, :rule_flags_score, :computed_at)
                """),
                {
                    "ticker": row["ticker"],
                    "period": int(row["year"]),
                    "risk_score": float(row["risk_score"]),
                    "level": row["risk_level"],
                    "m_score": row.get("m_score"),
                    "anomaly_score": row.get("anomaly_score"),
                    "rule_flags_score": row.get("rule_flags_score"),
                    "computed_at": now,
                },
            )

        for flag in flags_records:
            conn.execute(
                text("""
                    INSERT INTO flags
                    (ticker, period, flag_id, severity, explanation_ar,
                     evidence_json, computed_at)
                    VALUES (:ticker, :period, :flag_id, :severity,
                            :explanation_ar, :evidence_json, :computed_at)
                """),
                {
                    "ticker": flag["ticker"],
                    "period": int(flag["period"]),
                    "flag_id": flag["flag_id"],
                    "severity": flag["severity"],
                    "explanation_ar": flag["explanation_ar"],
                    "evidence_json": json.dumps(flag["evidence"], ensure_ascii=False),
                    "computed_at": now,
                },
            )
        conn.commit()

    logger.info(
        "Persisted %d scores, %d flags → %s",
        len(scores_df),
        len(flags_records),
        DB_PATH,
    )


def load_latest_scores() -> pd.DataFrame:
    engine = get_engine()
    return pd.read_sql("SELECT * FROM scores ORDER BY risk_score DESC", engine)


def load_flags(ticker: str | None = None) -> pd.DataFrame:
    engine = get_engine()
    if ticker:
        return pd.read_sql(
            "SELECT * FROM flags WHERE ticker = :t ORDER BY period DESC",
            engine,
            params={"t": ticker},
        )
    return pd.read_sql("SELECT * FROM flags ORDER BY ticker, period DESC", engine)
