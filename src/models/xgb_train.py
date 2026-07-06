"""XGBoost — تدريب على بيانات محقونة + تقييم."""

from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler

from src.models.ml_features import ML_FEATURE_COLS

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "data" / "models"
XGB_PATH = MODELS_DIR / "xgb_model.json"
XGB_SCALER_PATH = MODELS_DIR / "xgb_scaler.joblib"
REPORTS_DIR = ROOT / "reports"

logger = logging.getLogger(__name__)


def inject_fraud(row: pd.Series, rng: np.random.Generator | None = None) -> pd.Series:
    """
    يحاكي أنماط تلاعب موثقة أكademiًا عبر perturbation للميزات المشتقة.
    يُطبَّق على صف features (ليس raw financials).
    """
    rng = rng or np.random.default_rng()
    r = row.copy()

    # تضخيم ذمم → DSRI↑
    if not pd.isna(r.get("DSRI")):
        r["DSRI"] *= rng.uniform(1.4, 2.2)
    else:
        r["DSRI"] = rng.uniform(1.3, 1.8)

    # تضخيم مبيعات → SGI↑
    if not pd.isna(r.get("SGI")):
        r["SGI"] *= rng.uniform(1.1, 1.35)
    else:
        r["SGI"] = rng.uniform(1.15, 1.4)

    # إبطاء إهلاك → DEPI↑
    if not pd.isna(r.get("DEPI")):
        r["DEPI"] *= rng.uniform(1.1, 1.35)
    else:
        r["DEPI"] = rng.uniform(1.1, 1.25)

    # TATA↑ — أرباح ورقية
    if not pd.isna(r.get("TATA")):
        r["TATA"] = abs(r["TATA"]) + rng.uniform(0.03, 0.08)
    else:
        r["TATA"] = rng.uniform(0.04, 0.09)

    # CFO/NI↓
    if not pd.isna(r.get("cfo_to_net_income")):
        r["cfo_to_net_income"] *= rng.uniform(0.3, 0.6)
    else:
        r["cfo_to_net_income"] = rng.uniform(0.1, 0.45)

    r["receivables_to_revenue_growth"] = rng.uniform(1.6, 2.5)
    r["label"] = 1
    return r


def build_training_dataset(
    features: pd.DataFrame,
    rng: np.random.Generator | None = None,
) -> pd.DataFrame:
    """label=0 originals + label=1 injected copies (1:1)."""
    rng = rng or np.random.default_rng(42)
    clean = features.copy()
    clean["label"] = 0

    fraud_rows = []
    for _, row in clean.iterrows():
        fraud_rows.append(inject_fraud(row, rng))

    fraud = pd.DataFrame(fraud_rows)
    return pd.concat([clean, fraud], ignore_index=True)


def train_xgb(
    training: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> tuple[xgb.XGBClassifier, StandardScaler, dict]:
    """Train XGBoost with 80/20 split + 5-fold CV metrics."""
    X = training[ML_FEATURE_COLS].fillna(training[ML_FEATURE_COLS].median())
    y = training["label"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=test_size, random_state=random_state, stratify=y
    )

    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=random_state,
        eval_metric="logloss",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "train_size": len(y_train),
        "test_size": len(y_test),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_auc = cross_val_score(model, X_scaled, y, cv=cv, scoring="roc_auc")
    metrics["cv_roc_auc_mean"] = float(cv_auc.mean())
    metrics["cv_roc_auc_std"] = float(cv_auc.std())

    logger.info(
        "XGB — AUC=%.3f F1=%.3f CV-AUC=%.3f±%.3f",
        metrics["roc_auc"],
        metrics["f1"],
        metrics["cv_roc_auc_mean"],
        metrics["cv_roc_auc_std"],
    )
    return model, scaler, metrics


def predict_proba(
    model: xgb.XGBClassifier,
    scaler: StandardScaler,
    features: pd.DataFrame,
) -> pd.Series:
    X = features[ML_FEATURE_COLS].fillna(features[ML_FEATURE_COLS].median())
    Xs = scaler.transform(X)
    probs = model.predict_proba(Xs)[:, 1]
    return pd.Series(probs * 100, index=features.index)  # 0–100


def save_model(model: xgb.XGBClassifier, scaler: StandardScaler) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(XGB_PATH))
    joblib.dump(scaler, XGB_SCALER_PATH)


def load_model() -> tuple[xgb.XGBClassifier, StandardScaler]:
    model = xgb.XGBClassifier()
    model.load_model(str(XGB_PATH))
    scaler = joblib.load(XGB_SCALER_PATH)
    return model, scaler


def write_eval_report(metrics: dict, path: Path | None = None) -> None:
    path = path or REPORTS_DIR / "model_eval.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    content = f"""# تقييم النماذج — رقيب

> تاريخ: تلقائي | XGBoost على بيانات محقونة 1:1

## XGBoost (Train/Test 80/20)

| المقياس | القيمة |
|---------|--------|
| Accuracy | {metrics['accuracy']:.3f} |
| Precision | {metrics['precision']:.3f} |
| Recall | {metrics['recall']:.3f} |
| F1 | {metrics['f1']:.3f} |
| ROC-AUC | {metrics['roc_auc']:.3f} |

## 5-Fold Cross-Validation (ROC-AUC)

| المقياس | القيمة |
|---------|--------|
| Mean | {metrics['cv_roc_auc_mean']:.3f} |
| Std | {metrics['cv_roc_auc_std']:.3f} |

## Isolation Forest

- تدريب per-sector عند ≥5 عينات، وإلا global + one-hot
- `contamination=0.1`, `n_estimators=200`

## ملاحظة للعرض

> "درّبنا XGBoost على أنماط تلاعب موثقة في الأدبيات المحاسبية (حقن اصطناعي 1:1).
> Isolation Forest يكشف الشذوذ دون بيانات موسومة — الشركة الشاذة عن أقرانها في القطاع."

**أرقام حقيقية — لا تعدّلها للعرض.**

> ⚠️ AUC=1.0 متوقع هنا لأن التقييم على بيانات **محقونة اصطناعيًا** بنفس أنماط التدريب.
> على الشركات الحقيقية، XGB يُستخدم كطبقة إضافية — IF يكشف الشذوذ القطاعي.
"""
    path.write_text(content, encoding="utf-8")
    logger.info("Eval report → %s", path)
