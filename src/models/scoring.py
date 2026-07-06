"""طبقة الدرجة المركّبة + قواعد الإشارات الحمراء."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np
import pandas as pd

from src.models.beneish import M_SCORE_THRESHOLD

WEIGHTS = {
    "m_score": 0.40,
    "anomaly_if": 0.20,
    "xgb": 0.15,
    "rules": 0.25,
}

# تصنيف المستويات — مطابق لـ docs/api-contract.md
LEVEL_LOW = "low"          # 0–25
LEVEL_MEDIUM = "medium"    # 26–50
LEVEL_HIGH = "high"        # 51–75
LEVEL_CRITICAL = "critical"  # 76–100


@dataclass
class RuleFlag:
    flag_id: str
    title_ar: str
    severity: str  # info | warning | critical
    explanation_ar: str
    evidence: dict[str, Any] = field(default_factory=dict)


RULE_DEFINITIONS = {
    "cfo_ni_low_streak": {
        "title_ar": "أرباح بلا تدفق نقدي",
        "severity": "critical",
        "explanation_ar": (
            "أرباح محاسبية لا يقابلها تدفق نقدي — قد تكون أرباحًا ورقية"
        ),
    },
    "receivables_outpace_revenue": {
        "title_ar": "نمو الذمم أسرع من المبيعات",
        "severity": "warning",
        "explanation_ar": (
            "الذمم المدينة تنمو أسرع من المبيعات — احتمال إيرادات مبكرة/وهمية"
        ),
    },
    "depi_high": {
        "title_ar": "تباطؤ الإهلاك",
        "severity": "warning",
        "explanation_ar": "تباطؤ ملحوظ في الإهلاك — قد يضخّم الأرباح",
    },
    "lvgi_spike": {
        "title_ar": "قفزة في الرافعة المالية",
        "severity": "warning",
        "explanation_ar": "ارتفاع حاد في الرافعة المالية",
    },
    "m_score_high": {
        "title_ar": "مؤشر Beneish مرتفع",
        "severity": "critical",
        "explanation_ar": (
            "M-Score يتجاوز عتبة -1.78 — احتمال تلاعب محاسبي وفق نموذج Beneish"
        ),
    },
    "tata_high": {
        "title_ar": "استحقاقات عالية",
        "severity": "critical",
        "explanation_ar": (
            "فرق كبير بين الأرباح والتدفق النقدي بالنسبة للأصول — إشارة TATA قوية"
        ),
    },
}


def risk_level(score: float) -> str:
    if score <= 25:
        return LEVEL_LOW
    if score <= 50:
        return LEVEL_MEDIUM
    if score <= 75:
        return LEVEL_HIGH
    return LEVEL_CRITICAL


def norm_if_score(if_score: float) -> float:
    """Compress IF outliers (IF=100 لا يجب أن يهيمن وحده)."""
    if pd.isna(if_score):
        return 25.0
    return float(min(if_score ** 0.85, 78))


def norm_m_score(m_score: float) -> float:
    """
    Map M-Score to 0–100 (higher = more risk).
    M > -1.78 → high; M < -2.6 → low.
    """
    if pd.isna(m_score):
        return 50.0
    # sigmoid-like linear map: -2.6 → 0, -1.78 → 70, -1.0 → 100
    clamped = max(-3.0, min(0.0, m_score))
    return float(np.clip((clamped + 2.6) / 1.6 * 100, 0, 100))


def simple_anomaly_score(row: pd.Series, sector_df: pd.DataFrame) -> float:
    """
    Sector z-score proxy until Isolation Forest (Day 4).
    Uses DSRI + TATA deviation from sector median.
    """
    metrics = ["DSRI", "TATA"]
    scores: list[float] = []
    for metric in metrics:
        if metric not in row or pd.isna(row[metric]):
            continue
        sector_vals = sector_df[metric].dropna()
        if len(sector_vals) < 3:
            continue
        median = sector_vals.median()
        mad = (sector_vals - median).abs().median()
        if mad == 0:
            continue
        z = abs(row[metric] - median) / mad
        scores.append(min(z / 3.0, 1.0) * 100)
    return float(np.mean(scores)) if scores else 25.0


def evaluate_rule_flags(
    row: pd.Series,
    company_history: pd.DataFrame,
) -> list[RuleFlag]:
    """Apply red-flag rules for one company-year."""
    flags: list[RuleFlag] = []
    year = int(row["year"])

    # CFO/NI < 0.5 for two consecutive years
    hist = company_history.sort_values("year")
    low_cfo_years: list[int] = []
    for _, r in hist.iterrows():
        cfo_ni = r.get("cfo_to_net_income")
        if not pd.isna(cfo_ni) and cfo_ni < 0.5:
            low_cfo_years.append(int(r["year"]))

    if year in low_cfo_years:
        consecutive = any(
            y in low_cfo_years and y + 1 in low_cfo_years for y in low_cfo_years
        )
        if consecutive:
            meta = RULE_DEFINITIONS["cfo_ni_low_streak"]
            flags.append(
                RuleFlag(
                    flag_id="cfo_ni_low_streak",
                    title_ar=meta["title_ar"],
                    severity=meta["severity"],
                    explanation_ar=meta["explanation_ar"],
                    evidence={
                        "metric": "cfo_to_net_income",
                        "value": row.get("cfo_to_net_income"),
                        "threshold": 0.5,
                        "year": year,
                    },
                )
            )

    # Receivables growth > 1.5× revenue growth
    ratio = row.get("receivables_to_revenue_growth")
    if not pd.isna(ratio) and ratio > 1.5:
        meta = RULE_DEFINITIONS["receivables_outpace_revenue"]
        flags.append(
            RuleFlag(
                flag_id="receivables_outpace_revenue",
                title_ar=meta["title_ar"],
                severity=meta["severity"],
                explanation_ar=meta["explanation_ar"],
                evidence={
                    "metric": "receivables_to_revenue_growth",
                    "value": round(float(ratio), 3),
                    "threshold": 1.5,
                    "year": year,
                },
            )
        )

    # DEPI > 1.2
    depi = row.get("DEPI")
    if not pd.isna(depi) and depi > 1.2:
        meta = RULE_DEFINITIONS["depi_high"]
        flags.append(
            RuleFlag(
                flag_id="depi_high",
                title_ar=meta["title_ar"],
                severity=meta["severity"],
                explanation_ar=meta["explanation_ar"],
                evidence={"metric": "DEPI", "value": round(float(depi), 3), "threshold": 1.2, "year": year},
            )
        )

    # LVGI spike > 1.2
    lvgi = row.get("LVGI")
    if not pd.isna(lvgi) and lvgi > 1.2:
        meta = RULE_DEFINITIONS["lvgi_spike"]
        flags.append(
            RuleFlag(
                flag_id="lvgi_spike",
                title_ar=meta["title_ar"],
                severity=meta["severity"],
                explanation_ar=meta["explanation_ar"],
                evidence={"metric": "LVGI", "value": round(float(lvgi), 3), "threshold": 1.2, "year": year},
            )
        )

    # M-Score threshold
    m = row.get("m_score")
    if not pd.isna(m) and m > M_SCORE_THRESHOLD:
        meta = RULE_DEFINITIONS["m_score_high"]
        flags.append(
            RuleFlag(
                flag_id="m_score_high",
                title_ar=meta["title_ar"],
                severity=meta["severity"],
                explanation_ar=meta["explanation_ar"],
                evidence={"metric": "m_score", "value": round(float(m), 3), "threshold": M_SCORE_THRESHOLD, "year": year},
            )
        )

    # TATA > 0.05
    tata = row.get("TATA")
    if not pd.isna(tata) and tata > 0.05:
        meta = RULE_DEFINITIONS["tata_high"]
        flags.append(
            RuleFlag(
                flag_id="tata_high",
                title_ar=meta["title_ar"],
                severity=meta["severity"],
                explanation_ar=meta["explanation_ar"],
                evidence={"metric": "TATA", "value": round(float(tata), 4), "threshold": 0.05, "year": year},
            )
        )

    return flags


def rule_flags_score(flags: list[RuleFlag]) -> float:
    """0–100 based on flag count and severity."""
    if not flags:
        return 0.0
    severity_weight = {"info": 1, "warning": 2, "critical": 3}
    total = sum(severity_weight.get(f.severity, 1) for f in flags)
    max_possible = len(RULE_DEFINITIONS) * 3
    return float(min(total / max_possible * 100 * 2, 100))


def compute_risk_score(
    row: pd.Series,
    company_history: pd.DataFrame,
    sector_df: pd.DataFrame,
    if_score: float | None = None,
    xgb_score: float | None = None,
) -> dict[str, Any]:
    """Composite risk score for one company-year."""
    m_norm = norm_m_score(row.get("m_score"))
    anomaly = norm_if_score(if_score) if if_score is not None else simple_anomaly_score(row, sector_df)
    ml_prob = xgb_score if xgb_score is not None else 15.0
    flags = evaluate_rule_flags(row, company_history)
    rules = rule_flags_score(flags)

    risk = (
        WEIGHTS["m_score"] * m_norm
        + WEIGHTS["anomaly_if"] * anomaly
        + WEIGHTS["xgb"] * ml_prob
        + WEIGHTS["rules"] * rules
    )
    risk = float(np.clip(risk, 0, 100))

    return {
        "risk_score": round(risk, 1),
        "risk_level": risk_level(risk),
        "m_score_norm": round(m_norm, 1),
        "anomaly_score": round(anomaly, 1),
        "xgb_score": round(ml_prob, 1),
        "rule_flags_score": round(rules, 1),
        "flags": flags,
    }
