"""قوالب أسئلة الاستجواب للإشارات الحمراء."""

from __future__ import annotations

from typing import Any

FLAG_PROMPT_TEMPLATES: dict[str, str] = {
    "receivables_outpace_revenue": (
        "نمو ذممكم المدينة يشير إلى نسبة {value} مقابل عتبة {threshold} "
        "لنمو الذمم إلى المبيعات. ما المبررات الائتمانية لهذا التباين، "
        "وهل توجد اتفاقيات تحصيل مؤجلة تفسّره؟"
    ),
    "cfo_ni_low_streak": (
        "نسبة التدفق النقدي التشغيلي إلى صافي الربح بلغت {value} "
        "(أقل من العتبة {threshold}). كيف تفسّرون الفجوة بين الربحية المحاسبية "
        "والسيولة الفعلية لنفس الفترة؟"
    ),
    "depi_high": (
        "مؤشر تباطؤ الإهلاك (DEPI) بلغ {value} مقابل عتبة {threshold}. "
        "هل طرأ تغيير في سياسة الإهلاك المحاسبية، وهل تم الإفصاح عنه؟"
    ),
    "lvgi_spike": (
        "مؤشر الرافعة المالية (LVGI) ارتفع إلى {value} مقابل عتبة {threshold}. "
        "ما مصدر التمويل الجديد وكيف يؤثر على قدرتكم على الوفاء بالتزاماتكم؟"
    ),
    "m_score_high": (
        "مؤشر Beneish (M-Score) بلغ {value} متجاوزاً عتبة {threshold}. "
        "ما التغيرات في مؤشرات DSRI وTATA مقارنة بالعام السابق؟"
    ),
    "tata_high": (
        "مؤشر الاستحقاقات (TATA) بلغ {value} مقابل عتبة {threshold}. "
        "ما مصدر الاستحقاقات غير النقدية في قائمة الدخل؟"
    ),
}


def _fmt_value(val: Any) -> str:
    if val is None:
        return "—"
    if isinstance(val, float):
        return f"{val:.3f}".rstrip("0").rstrip(".")
    return str(val)


def generate_interrogation_prompt(flag_id: str, evidence: dict[str, Any]) -> str:
    template = FLAG_PROMPT_TEMPLATES.get(flag_id)
    if not template:
        return "يُنصح بمراجعة هذا المؤشر مع الشركة للحصول على توضيح إضافي."

    ctx = {
        "value": _fmt_value(evidence.get("value")),
        "threshold": _fmt_value(evidence.get("threshold")),
        "year": evidence.get("year", ""),
        "metric": evidence.get("metric", ""),
    }
    try:
        return template.format(**ctx)
    except KeyError:
        return template
