"""
Backtest: موبايلي 2013 (قبل إعادة الإصدار — نوفمبر 2014).

المصادر:
- Reuters: restatement of 2013 + H1 2014 profits by 1.43B SAR
- Tadawul public announcements on accounting errors (revenue recognition)
- Receivables swelled while reported profits remained strong (Reuters, 2015)

الأرقام في mobily_pre_restatement.csv مُعاد بناؤها من السرد العام
(نمو ذمم أسرع من المبيعات + أرباح بلا تدفق نقدي) — ليست نسخة من 10-K.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.features.build import _extra_features
from src.models.beneish import M_SCORE_THRESHOLD, compute_m_score, compute_indicators
from src.models.scoring import LEVEL_HIGH, compute_risk_score

ROOT = Path(__file__).resolve().parents[2]
MOBILY_CSV = ROOT / "data" / "backtest" / "mobily_pre_restatement.csv"

# إعلان تداول: اكتشاف أخطاء محاسبية — نوفمبر 2014
DISCOVERY_YEAR = 2014


def load_mobily_pre_restatement() -> pd.DataFrame:
    return pd.read_csv(MOBILY_CSV).sort_values("year").reset_index(drop=True)


def build_mobily_features(financials: pd.DataFrame | None = None) -> pd.DataFrame:
    """Feature rows from pre-restatement Mobily financials."""
    if financials is None:
        financials = load_mobily_pre_restatement()

    beneish_df = financials.rename(columns={"cfo": "operating_cashflow"})
    indicators = compute_indicators(beneish_df)
    rows: list[dict] = []

    for i in range(1, len(financials)):
        cur = financials.iloc[i]
        prev = financials.iloc[i - 1]
        year = int(cur["year"])
        ind_row = indicators[indicators["year"].astype(str) == str(year)]
        if ind_row.empty:
            continue
        ind = ind_row.iloc[0]
        m = compute_m_score(cur, prev)
        rows.append(
            {
                "ticker": cur["ticker"],
                "name_ar": cur["name_ar"],
                "name_en": cur["name_en"],
                "sector": cur["sector"],
                "year": year,
                **{k: ind[k] for k in ind.index if k != "year"},
                "m_score": m["m_score"],
                **_extra_features(cur, prev),
            }
        )
    return pd.DataFrame(rows)


def run_mobily_backtest(
    if_score: float = 35.0,
    xgb_score: float = 45.0,
) -> dict:
    """
    Score Mobily year-by-year on pre-restatement data.
    Returns summary for docs and tests.
    """
    financials = load_mobily_pre_restatement()
    features = build_mobily_features(financials)
    sector_df = features.copy()

    results: list[dict] = []
    for _, row in features.iterrows():
        year = int(row["year"])
        hist = features[features["year"] <= year]
        out = compute_risk_score(row, hist, sector_df, if_score=if_score, xgb_score=xgb_score)
        m = compute_m_score(
            financials[financials["year"] == year].iloc[0],
            financials[financials["year"] == year - 1].iloc[0],
        )
        results.append(
            {
                "year": year,
                "risk_score": out["risk_score"],
                "risk_level": out["risk_level"],
                "m_score": round(float(row["m_score"]), 3),
                "m_score_likely": m["is_manipulation_likely"],
                "flags": [f.flag_id for f in out["flags"]],
                "years_before_discovery": DISCOVERY_YEAR - year,
            }
        )

    pre_discovery = [r for r in results if r["year"] < DISCOVERY_YEAR]
    peak = max(pre_discovery, key=lambda r: r["risk_score"])
    detected_early = peak["year"] <= 2013 and peak["risk_score"] >= 51

    return {
        "case": "mobily_2014",
        "discovery_year": DISCOVERY_YEAR,
        "years_scored": results,
        "peak_pre_discovery": peak,
        "detected_before_announcement": detected_early,
        "narrative_ar": (
            f"قبل الإعلان بـ {peak['years_before_discovery']} سنة/سنوات "
            f"({peak['year']}): درجة {peak['risk_score']} ({peak['risk_level']}) "
            f"مع M-Score={'مرتفع' if peak['m_score'] > M_SCORE_THRESHOLD else 'منخفض'}"
        ),
    }


def main() -> None:
    out = run_mobily_backtest()
    print("=" * 60)
    print("Backtest: موبايلي — قوائم ما قبل إعادة الإصدار")
    print("=" * 60)
    for r in out["years_scored"]:
        print(
            f"  {r['year']}: risk={r['risk_score']} ({r['risk_level']}) "
            f"M={r['m_score']} flags={r['flags']}"
        )
    print(f"\n{out['narrative_ar']}")
    print(f"رصد مبكر: {'✓ نعم' if out['detected_before_announcement'] else '✗ لا — راجع الأوزان'}")
    print("=" * 60)


if __name__ == "__main__":
    main()
