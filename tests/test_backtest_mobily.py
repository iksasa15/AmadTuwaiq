"""Backtest: موبايلي 2014 — قوائم ما قبل إعادة الإصدار."""

import pytest

from src.backtest.mobily import run_mobily_backtest
from src.models.beneish import M_SCORE_THRESHOLD
from src.models.scoring import LEVEL_HIGH


def test_mobily_2013_high_risk_before_discovery():
    """2013 (سنة قبل الإعلان): درجة مرتفعة + M-Score فوق العتبة."""
    out = run_mobily_backtest()
    y2013 = next(r for r in out["years_scored"] if r["year"] == 2013)

    assert y2013["risk_score"] >= 51
    assert y2013["risk_level"] == LEVEL_HIGH
    assert y2013["m_score"] > M_SCORE_THRESHOLD
    assert "m_score_high" in y2013["flags"]
    assert "receivables_outpace_revenue" in y2013["flags"]


def test_mobily_detected_before_public_announcement():
    """النظام يرصد قبل نوفمبر 2014."""
    out = run_mobily_backtest()
    assert out["detected_before_announcement"] is True
    assert out["peak_pre_discovery"]["year"] == 2013
    assert out["peak_pre_discovery"]["years_before_discovery"] == 1


def test_mobily_escalating_risk_trend():
    """الدرجة تتصاعد مع تفاقم الإشارات (2011→2013)."""
    out = run_mobily_backtest()
    scores = {r["year"]: r["risk_score"] for r in out["years_scored"]}
    assert scores[2011] < scores[2012] < scores[2013]
