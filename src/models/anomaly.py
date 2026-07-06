"""Isolation Forest — كشف الشذوذ حسب القطاع."""

from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from src.models.ml_features import MIN_SECTOR_SAMPLES, ML_FEATURE_COLS, normalize_scores

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "data" / "models"
IF_PATH = MODELS_DIR / "isolation_forest.joblib"

logger = logging.getLogger(__name__)


class SectorAnomalyDetector:
    """Train per-sector IsolationForest when sample size allows, else global."""

    def __init__(
        self,
        n_estimators: int = 200,
        contamination: float = 0.1,
        random_state: int = 42,
    ):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state
        self.models: dict[str, IsolationForest] = {}
        self.scalers: dict[str, StandardScaler] = {}
        self.global_model: IsolationForest | None = None
        self.global_scaler: StandardScaler | None = None
        self.global_columns: list[str] = []
        self.use_global_sectors: set[str] = set()

    def _make_model(self) -> IsolationForest:
        return IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
        )

    def fit(self, df: pd.DataFrame) -> "SectorAnomalyDetector":
        X_all = df[ML_FEATURE_COLS].fillna(df[ML_FEATURE_COLS].median())

        # Global fallback model (with sector one-hot for small sectors)
        sectors_oh = pd.get_dummies(df["sector"], prefix="sector", dtype=float)
        X_global = pd.concat([X_all.reset_index(drop=True), sectors_oh.reset_index(drop=True)], axis=1)
        self.global_columns = list(X_global.columns)
        self.global_scaler = StandardScaler()
        Xg = self.global_scaler.fit_transform(X_global)
        self.global_model = self._make_model()
        self.global_model.fit(Xg)

        for sector, group in df.groupby("sector"):
            if len(group) >= MIN_SECTOR_SAMPLES:
                X = group[ML_FEATURE_COLS].fillna(group[ML_FEATURE_COLS].median())
                scaler = StandardScaler()
                Xs = scaler.fit_transform(X)
                model = self._make_model()
                model.fit(Xs)
                self.models[sector] = model
                self.scalers[sector] = scaler
                logger.info("IF trained for sector %s (%d samples)", sector, len(group))
            else:
                self.use_global_sectors.add(sector)
                logger.info("Sector %s → global IF (%d samples)", sector, len(group))

        return self

    def score_samples(self, df: pd.DataFrame) -> pd.Series:
        """Return 0–100 anomaly scores (higher = more anomalous)."""
        raw_scores: list[float] = []

        for sector, group in df.groupby("sector"):
            if sector in self.models:
                X = group[ML_FEATURE_COLS].fillna(group[ML_FEATURE_COLS].median())
                Xs = self.scalers[sector].transform(X)
                scores = -self.models[sector].score_samples(Xs)
            else:
                sectors_oh = pd.get_dummies(group["sector"], prefix="sector", dtype=float)
                X = group[ML_FEATURE_COLS].fillna(group[ML_FEATURE_COLS].median())
                X_combined = pd.concat(
                    [X.reset_index(drop=True), sectors_oh.reset_index(drop=True)], axis=1
                )
                for col in self.global_columns:
                    if col not in X_combined.columns:
                        X_combined[col] = 0.0
                X_combined = X_combined[self.global_columns]
                Xs = self.global_scaler.transform(X_combined)
                scores = -self.global_model.score_samples(Xs)

            for idx, s in zip(group.index, scores):
                raw_scores.append((idx, float(s)))

        raw_scores.sort(key=lambda x: x[0])
        values = np.array([s for _, s in raw_scores])
        normalized = normalize_scores(values)
        return pd.Series(normalized, index=[i for i, _ in raw_scores])

    def save(self, path: Path | None = None) -> None:
        path = path or IF_PATH
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, path)
        logger.info("Saved IF model → %s", path)

    @classmethod
    def load(cls, path: Path | None = None) -> "SectorAnomalyDetector":
        path = path or IF_PATH
        return joblib.load(path)
