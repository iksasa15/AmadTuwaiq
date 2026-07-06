"""SHAP — تفسير XGBoost + قوالب عربية."""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd
import shap

from src.models.ml_features import ML_FEATURE_COLS

ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = ROOT / "reports"
SHAP_PLOT = REPORTS_DIR / "shap_summary.png"

logger = logging.getLogger(__name__)

FEATURE_TEMPLATES_AR: dict[str, str] = {
    "DSRI": "نمو الذمم المدينة أسرع من المبيعات (DSRI={value:.2f})",
    "GMI": "تدهور هامش الربح الإجمالي (GMI={value:.2f})",
    "AQI": "ارتفاع في مؤشر جودة الأصول (AQI={value:.2f})",
    "SGI": "نمو مبيعات غير طبيعي (SGI={value:.2f})",
    "DEPI": "تباطؤ في الإهلاك (DEPI={value:.2f})",
    "SGAI": "ارتفاع المصاريف البيعية نسبة للمبيعات (SGAI={value:.2f})",
    "LVGI": "زيادة في الرافعة المالية (LVGI={value:.2f})",
    "TATA": "استحقاقات عالية مقارنة بالأصول (TATA={value:.3f})",
    "cfo_to_net_income": "ضعف التدفق النقدي مقابل الأرباح (CFO/NI={value:.2f})",
    "receivables_growth": "نمو سريع في الذمم المدينة ({value:.1%})",
    "revenue_growth": "نمو في المبيعات ({value:.1%})",
    "receivables_to_revenue_growth": "الذمم تنمو أسرع من المبيعات ({value:.2f}×)",
    "debt_to_equity": "ارتفاع نسبة الدين لحقوق الملكية ({value:.2f})",
    "debt_to_equity_change": "تغير حاد في هيكل الديون ({value:.2f})",
    "gross_margin": "ضغط على هامش الربح ({value:.1%})",
    "operating_margin": "ضعف هامش التشغيل ({value:.1%})",
}


def shap_to_arabic(feature: str, shap_value: float, row: pd.Series) -> str:
    """Convert SHAP contribution to Arabic sentence."""
    val = row.get(feature, np.nan)
    if feature in FEATURE_TEMPLATES_AR and not pd.isna(val):
        text = FEATURE_TEMPLATES_AR[feature].format(value=val)
    else:
        text = f"مساهمة {feature} في المخاطر"
    direction = "رفعت" if shap_value > 0 else "خفّضت"
    return f"{direction} الدرجة: {text}"


def explain_row(
    shap_values: np.ndarray,
    feature_names: list[str],
    row: pd.Series,
    top_k: int = 3,
) -> list[str]:
    """Top-k Arabic explanations for one row."""
    contributions = list(zip(feature_names, shap_values))
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)

    explanations = []
    for feat, sv in contributions[:top_k]:
        if abs(sv) < 0.01:
            continue
        explanations.append(shap_to_arabic(feat, sv, row))
    return explanations


def build_shap_explanations(
    model,
    scaler,
    features: pd.DataFrame,
    top_k: int = 3,
) -> pd.DataFrame:
    """SHAP values + Arabic top-3 per row."""
    X = features[ML_FEATURE_COLS].fillna(features[ML_FEATURE_COLS].median())
    Xs = scaler.transform(X)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(Xs)

    rows = []
    for i, (_, row) in enumerate(features.iterrows()):
        sv = shap_values[i]
        explanations = explain_row(sv, ML_FEATURE_COLS, row, top_k)
        rows.append(
            {
                "ticker": row["ticker"],
                "year": int(row["year"]),
                "shap_explanations_ar": explanations,
                "shap_top1": explanations[0] if explanations else "",
            }
        )
    return pd.DataFrame(rows)


def plot_shap_summary(model, scaler, features: pd.DataFrame, path: Path | None = None) -> Path:
    """Save SHAP summary plot for presentation."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    path = path or SHAP_PLOT
    path.parent.mkdir(parents=True, exist_ok=True)

    X = features[ML_FEATURE_COLS].fillna(features[ML_FEATURE_COLS].median())
    Xs = scaler.transform(X)
    X_df = pd.DataFrame(Xs, columns=ML_FEATURE_COLS)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(Xs)

    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_df, feature_names=ML_FEATURE_COLS, show=False)
    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info("SHAP summary plot → %s", path)
    return path
