"""أعمدة الميزات المستخدمة في نماذج ML."""

from __future__ import annotations

import numpy as np
import pandas as pd

BENEISH_COLS = ["DSRI", "GMI", "AQI", "SGI", "DEPI", "SGAI", "LVGI", "TATA"]

EXTRA_COLS = [
    "cfo_to_net_income",
    "receivables_growth",
    "revenue_growth",
    "receivables_to_revenue_growth",
    "debt_to_equity",
    "debt_to_equity_change",
    "gross_margin",
    "operating_margin",
]

ML_FEATURE_COLS = BENEISH_COLS + EXTRA_COLS

MIN_SECTOR_SAMPLES = 5


def extract_X(df: pd.DataFrame, sector_dummies: pd.DataFrame | None = None) -> pd.DataFrame:
    """Build feature matrix; fill NaN with column median."""
    X = df[ML_FEATURE_COLS].copy()
    for col in ML_FEATURE_COLS:
        X[col] = X[col].fillna(X[col].median())
    if sector_dummies is not None:
        X = pd.concat([X.reset_index(drop=True), sector_dummies.reset_index(drop=True)], axis=1)
    return X


def sector_one_hot(df: pd.DataFrame) -> pd.DataFrame:
    return pd.get_dummies(df["sector"], prefix="sector", dtype=float)


def normalize_scores(raw: np.ndarray) -> np.ndarray:
    """Normalize raw anomaly scores to 0–100."""
    if len(raw) == 0:
        return raw
    lo, hi = np.percentile(raw, [5, 95])
    if hi == lo:
        return np.full_like(raw, 50.0, dtype=float)
    return np.clip((raw - lo) / (hi - lo) * 100, 0, 100)
