import type {
  CompanyDetail,
  CompanyProfile,
  CompanySummary,
  FlagItem,
  MarketOverview,
  ScoreBreakdown,
} from "../api/client";
import { getDemoFinancials } from "./demoFinancials";
import { DEMO_AUDITOR_PROMPTS } from "./strategicDemo";

/** بيانات عرض — مصممة للـ demo أمام الحكام */

export const DEMO_OVERVIEW: MarketOverview = {
  total_companies: 24,
  avg_risk_score: 18.4,
  distribution: { low: 17, medium: 4, high: 2, critical: 1 },
  top_risks: [
    { ticker: "4001.SR", name_ar: "العثيم", risk_score: 68, risk_level: "high" },
    { ticker: "7020.SR", name_ar: "اتحاد اتصالات (موبايلي)", risk_score: 57, risk_level: "high" },
    { ticker: "2140.SR", name_ar: "سليمان الحبيب", risk_score: 52, risk_level: "high" },
    { ticker: "4300.SR", name_ar: "دار الأركان", risk_score: 41, risk_level: "medium" },
    { ticker: "4005.SR", name_ar: "الرعاية الطبية", risk_score: 38, risk_level: "medium" },
  ],
  sector_breakdown: [
    { sector: "Retail", avg_risk_score: 34.2, count: 4 },
    { sector: "Telecom", avg_risk_score: 28.5, count: 3 },
    { sector: "Healthcare", avg_risk_score: 22.1, count: 4 },
    { sector: "Petrochemicals", avg_risk_score: 14.8, count: 5 },
    { sector: "Energy", avg_risk_score: 8.2, count: 1 },
    { sector: "Real Estate", avg_risk_score: 19.6, count: 2 },
  ],
  updated_at: new Date().toISOString(),
  banks_excluded: 6,
  banks_note_ar: "6 بنوك مستبعدة — Beneish غير قابل للتطبيق على القطاع المصرفي",
};

export const DEMO_COMPANIES: CompanySummary[] = [
  { ticker: "4001.SR", name_ar: "العثيم", name_en: "Al Othaim Markets", sector: "Retail", risk_score: 68, risk_level: "high", trend: "up", data_status: "ok", confidence: "high" },
  { ticker: "7020.SR", name_ar: "اتحاد اتصالات", name_en: "Mobily", sector: "Telecom", risk_score: 57, risk_level: "high", trend: "up", data_status: "ok", confidence: "high" },
  { ticker: "2140.SR", name_ar: "سليمان الحبيب", name_en: "Dr Sulaiman Al Habib", sector: "Healthcare", risk_score: 52, risk_level: "high", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "4300.SR", name_ar: "دار الأركان", name_en: "Dar Al Arkan", sector: "Real Estate", risk_score: 41, risk_level: "medium", trend: "down", data_status: "ok", confidence: "medium" },
  { ticker: "4005.SR", name_ar: "الرعاية الطبية", name_en: "National Medical Care", sector: "Healthcare", risk_score: 38, risk_level: "medium", trend: "up", data_status: "ok", confidence: "high" },
  { ticker: "4004.SR", name_ar: "دلة للرعاية", name_en: "Dallah Healthcare", sector: "Healthcare", risk_score: 31, risk_level: "medium", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "4190.SR", name_ar: "جرير", name_en: "Jarir", sector: "Retail", risk_score: 24, risk_level: "low", trend: "down", data_status: "ok", confidence: "high" },
  { ticker: "7010.SR", name_ar: "الاتصالات السعودية", name_en: "stc", sector: "Telecom", risk_score: 22, risk_level: "low", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "7030.SR", name_ar: "زين السعودية", name_en: "Zain KSA", sector: "Telecom", risk_score: 19, risk_level: "low", trend: "down", data_status: "ok", confidence: "high" },
  { ticker: "2280.SR", name_ar: "المراعي", name_en: "Almarai", sector: "Food", risk_score: 15, risk_level: "low", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "2222.SR", name_ar: "أرامكو السعودية", name_en: "Saudi Aramco", sector: "Energy", risk_score: 12, risk_level: "low", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "1211.SR", name_ar: "معادن", name_en: "Maaden", sector: "Materials", risk_score: 14, risk_level: "low", trend: "down", data_status: "ok", confidence: "high" },
  { ticker: "2010.SR", name_ar: "سابك", name_en: "SABIC", sector: "Petrochemicals", risk_score: 18, risk_level: "low", trend: "stable", data_status: "partial", confidence: "medium", message_ar: "ثقة متوسطة — بيانات COGS ناقصة جزئياً" },
  { ticker: "5110.SR", name_ar: "الكهرباء", name_en: "SEC", sector: "Utilities", risk_score: 11, risk_level: "low", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "4030.SR", name_ar: "بحري", name_en: "Bahri", sector: "Transport", risk_score: 16, risk_level: "low", trend: "stable", data_status: "ok", confidence: "high" },
  { ticker: "4240.SR", name_ar: "إكسترا", name_en: "Extra", sector: "Retail", risk_score: 20, risk_level: "low", trend: "down", data_status: "ok", confidence: "medium" },
];

export type DemoAlert = FlagItem & {
  ticker: string;
  company_ar: string;
  year: number;
};

export const DEMO_ALERTS: DemoAlert[] = [
  {
    ticker: "4001.SR",
    company_ar: "العثيم",
    year: 2025,
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    severity: "warning",
    explanation_ar: "الذمم المدينة تنمو أسرع من المبيعات — احتمال إيرادات مبكرة أو وهمية.",
    evidence: { metric: "receivables_to_revenue_growth", value: 2.14, threshold: 1.5, year: 2025 },
  },
  {
    ticker: "4001.SR",
    company_ar: "العثيم",
    year: 2025,
    flag_id: "cfo_ni_low_streak",
    title_ar: "أرباح بلا تدفق نقدي",
    severity: "critical",
    explanation_ar: "أرباح محاسبية لا يقابلها تدفق نقدي — قد تكون أرباحًا ورقية.",
    evidence: { metric: "cfo_to_net_income", value: 0.38, threshold: 0.5, year: 2025 },
  },
  {
    ticker: "4001.SR",
    company_ar: "العثيم",
    year: 2025,
    flag_id: "tata_high",
    title_ar: "استحقاقات عالية",
    severity: "critical",
    explanation_ar: "فرق كبير بين الأرباح والتدفق النقدي بالنسبة للأصول — إشارة TATA قوية.",
    evidence: { metric: "TATA", value: 0.062, threshold: 0.05, year: 2025 },
  },
  {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    year: 2013,
    flag_id: "m_score_high",
    title_ar: "مؤشر Beneish مرتفع",
    severity: "critical",
    explanation_ar: "M-Score يتجاوز عتبة -1.78 — احتمال تلاعب محاسبي وفق نموذج Beneish.",
    evidence: { metric: "m_score", value: -1.75, threshold: -1.78, year: 2013 },
  },
  {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    year: 2013,
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    severity: "warning",
    explanation_ar: "الذمم نمت 56% بينما المبيعات 14% — نمط موبايلي قبل إعادة الإصدار.",
    evidence: { metric: "receivables_to_revenue_growth", value: 4.0, threshold: 1.5, year: 2013 },
  },
  {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    year: 2013,
    flag_id: "tata_high",
    title_ar: "استحقاقات عالية",
    severity: "critical",
    explanation_ar: "فرق كبير بين الأرباح والتدفق النقدي بالنسبة للأصول — إشارة TATA قوية.",
    evidence: { metric: "TATA", value: 0.061, threshold: 0.05, year: 2013 },
  },
  {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    year: 2013,
    flag_id: "cfo_ni_low_streak",
    title_ar: "أرباح بلا تدفق نقدي",
    severity: "critical",
    explanation_ar: "سنتان متتاليتان: CFO/NI = 0.17 — نمط موبايلي قبل إعادة الإصدار.",
    evidence: { metric: "cfo_to_net_income", value: 0.17, threshold: 0.5, year: 2013 },
  },
  {
    ticker: "2140.SR",
    company_ar: "سليمان الحبيب",
    year: 2025,
    flag_id: "depi_high",
    title_ar: "تباطؤ الإهلاك",
    severity: "warning",
    explanation_ar: "تباطؤ ملحوظ في الإهلاك — قد يضخّم الأرباح.",
    evidence: { metric: "DEPI", value: 1.28, threshold: 1.2, year: 2025 },
  },
  {
    ticker: "2140.SR",
    company_ar: "سليمان الحبيب",
    year: 2025,
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    severity: "warning",
    explanation_ar: "ذمم التأمين الطبي تنمو أسرع من إيرادات المستشفيات.",
    evidence: { metric: "receivables_to_revenue_growth", value: 1.62, threshold: 1.5, year: 2025 },
  },
  {
    ticker: "4005.SR",
    company_ar: "الرعاية الطبية",
    year: 2025,
    flag_id: "cfo_ni_low_streak",
    title_ar: "أرباح بلا تدفق نقدي",
    severity: "warning",
    explanation_ar: "تدفق تشغيلي ضعيف مقارنة بصافي الربح — يستحق المتابعة.",
    evidence: { metric: "cfo_to_net_income", value: 0.48, threshold: 0.5, year: 2025 },
  },
  {
    ticker: "4005.SR",
    company_ar: "الرعاية الطبية",
    year: 2025,
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    severity: "warning",
    explanation_ar: "ذمم مدينة مرتفعة نسبياً لقطاع الرعاية الصحية.",
    evidence: { metric: "receivables_to_revenue_growth", value: 1.55, threshold: 1.5, year: 2025 },
  },
  {
    ticker: "4004.SR",
    company_ar: "دلة للرعاية",
    year: 2025,
    flag_id: "depi_high",
    title_ar: "تباطؤ الإهلاك",
    severity: "warning",
    explanation_ar: "انخفاض نسبة الإهلاك للأصول الثابتة — قد يضخّم الربح التشغيلي.",
    evidence: { metric: "DEPI", value: 1.22, threshold: 1.2, year: 2025 },
  },
  {
    ticker: "4240.SR",
    company_ar: "إكسترا",
    year: 2025,
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    severity: "warning",
    explanation_ar: "ذمم العملاء تنمو أسرع من مبيعات الإلكترونيات.",
    evidence: { metric: "receivables_to_revenue_growth", value: 1.58, threshold: 1.5, year: 2025 },
  },
  {
    ticker: "2010.SR",
    company_ar: "سابك",
    year: 2025,
    flag_id: "data_partial",
    title_ar: "بيانات جزئية",
    severity: "info",
    explanation_ar: "ثقة متوسطة — بيانات COGS ناقصة جزئياً من yfinance.",
    evidence: { metric: "confidence", value: 0.72, threshold: 0.85, year: 2025 },
  },
  {
    ticker: "4300.SR",
    company_ar: "دار الأركان",
    year: 2025,
    flag_id: "lvgi_spike",
    title_ar: "قفزة في الرافعة المالية",
    severity: "warning",
    explanation_ar: "ارتفاع حاد في الرافعة المالية مقارنة بالعام السابق.",
    evidence: { metric: "LVGI", value: 1.35, threshold: 1.2, year: 2025 },
  },
];

export const MOBILY_TIMELINE = [
  { year: 2011, risk_score: 30, risk_level: "medium" as const, m_score: -2.05, flags: 1, note: "بداية تباعد الذمم عن المبيعات" },
  { year: 2012, risk_score: 44, risk_level: "medium" as const, m_score: -1.81, flags: 2, note: "أرباح بلا تدفق نقدي — سنتان متتاليتان" },
  { year: 2013, risk_score: 57, risk_level: "high" as const, m_score: -1.75, flags: 4, note: "M-Score فوق العتبة — سنة قبل الإعلان" },
  { year: 2014, risk_score: 0, risk_level: "low" as const, m_score: null, flags: 0, note: "نوفمبر: إعادة إصدار القوائم — خفض 1.43 مليار ريال" },
];

const DEMO_INDICATORS_4001 = {
  DSRI: 1.42, GMI: 1.08, AQI: 1.05, SGI: 1.12,
  DEPI: 1.15, SGAI: 1.02, LVGI: 1.18, TATA: 0.062,
};

const DEMO_SECTOR_AVG_RETAIL = {
  DSRI: 1.05, GMI: 1.01, AQI: 1.0, SGI: 1.08,
  DEPI: 1.0, SGAI: 1.01, LVGI: 1.05, TATA: 0.028,
};

const DEMO_PROFILES: Record<string, CompanyProfile> = {
  "4001.SR": {
    summary_ar: "سلسلة سوبرماركت رائدة في المملكة — أكثر من 230 فرعاً. نمو الذمم المدينة ارتفع 157% بين 2024–2025 بينما المبيعات نمت 3% فقط.",
    market_cap_ar: "7.2 مليار ريال",
    employees: "~12,000",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "yfinance + تداول",
    last_scan: "اليوم 05:42",
  },
  "7020.SR": {
    summary_ar: "مشغّل اتصالات جوال — حالة دراسية لإعادة إصدار القوائم نوفمبر 2014 بخفض 1.43 مليار ريال. رقيب أظهر درجة 57 في 2013 قبل الإعلان.",
    market_cap_ar: "18.5 مليار ريال",
    employees: "~4,200",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "CSV backtest + yfinance",
    last_scan: "Backtest 2013",
  },
  "2140.SR": {
    summary_ar: "مجموعة مستشفيات خاصة — نمو عبر الاستحواذات والتوسع الجغرافي. إشارة DEPI مرتفعة تشير لتباطؤ الإهلاك.",
    market_cap_ar: "52 مليار ريال",
    employees: "~18,000",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "yfinance",
    last_scan: "اليوم 05:42",
  },
  "4300.SR": {
    summary_ar: "مطوّر عقاري — مشاريع سكنية وتجارية في الرياض وجدة. رافعة مالية مرتفعة مع LVGI=1.35.",
    market_cap_ar: "4.8 مليار ريال",
    employees: "~1,200",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "yfinance",
    last_scan: "اليوم 05:42",
  },
  "4005.SR": {
    summary_ar: "مستشفى خاص في الرياض — قطاع الرعاية الصحية مع ذمم تأمين مرتفعة نسبياً.",
    market_cap_ar: "2.1 مليار ريال",
    employees: "~2,800",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "yfinance",
    last_scan: "اليوم 05:42",
  },
  "2222.SR": {
    summary_ar: "أكبر شركة نفط في العالم — قوائم مالية شفافة نسبياً، درجة مخاطر منخفضة ومستقرة.",
    market_cap_ar: "6.8 تريليون ريال",
    employees: "~70,000",
    exchange: "تداول (السوق الرئيسي)",
    data_source: "yfinance",
    last_scan: "اليوم 05:42",
  },
};

const DEMO_BREAKDOWNS: Record<string, ScoreBreakdown> = {
  "4001.SR": { m_score_norm: 72, anomaly_score: 58, xgb_score: 45, rule_flags_score: 85 },
  "7020.SR": { m_score_norm: 68, anomaly_score: 52, xgb_score: 41, rule_flags_score: 78 },
  "2140.SR": { m_score_norm: 55, anomaly_score: 48, xgb_score: 35, rule_flags_score: 62 },
  "4300.SR": { m_score_norm: 38, anomaly_score: 32, xgb_score: 22, rule_flags_score: 48 },
  "4005.SR": { m_score_norm: 35, anomaly_score: 30, xgb_score: 20, rule_flags_score: 42 },
};

const DEMO_NOTES: Record<string, string> = {
  "4001.SR": "ملاحظة المحلل: نمط مشابه لموبايلي 2013 — ذمم تنمو أسرع بكثير من المبيعات مع CFO/NI منخفض. يُنصح بمراجعة سياسة الاعتراف بالإيراد.",
  "7020.SR": "ملاحظة المحلل: Backtest ناجح — 4 إشارات حرجة في 2013 قبل إعادة الإصدار بـ 11 شهراً. درجة 57 ضمن نطاق high risk.",
  "2140.SR": "ملاحظة المحلل: DEPI مرتفع قد يعكس تمديد العمر الإنتاجي للأصول أو تباطؤ الإهلاك بعد استحواذات.",
  "4300.SR": "ملاحظة المحلل: قطاع عقاري حساس للرافعة — LVGI فوق 1.2 يستدعي متابعة تمويل المشاريع قيد الإنشاء.",
};

function breakdownForScore(score: number, level: string): ScoreBreakdown {
  const mult = level === "high" ? 1.1 : level === "medium" ? 0.75 : 0.4;
  return {
    m_score_norm: Math.min(95, Math.round(score * 0.45 * mult + 10)),
    anomaly_score: Math.min(90, Math.round(score * 0.35 * mult)),
    xgb_score: Math.min(80, Math.round(score * 0.25 * mult)),
    rule_flags_score: Math.min(95, Math.round(score * 0.5 * mult)),
  };
}

function profileForCompany(c: CompanySummary): CompanyProfile {
  const known = DEMO_PROFILES[c.ticker];
  if (known) return known;
  return {
    summary_ar: `${c.name_ar} — شركة مدرجة في قطاع ${c.sector}. تخضع لمراقبة رقيب الدورية.`,
    market_cap_ar: "غير متوفر",
    employees: "—",
    exchange: "تداول",
    data_source: c.data_status === "partial" ? "yfinance (جزئي)" : "yfinance",
    last_scan: "اليوم 05:42",
  };
}

function enrichDetail(detail: CompanyDetail): CompanyDetail {
  const level = detail.risk_level ?? "low";
  const score = detail.risk_score ?? 15;
  return {
    ...detail,
    profile: detail.profile ?? profileForCompany(detail),
    score_breakdown: detail.score_breakdown ?? DEMO_BREAKDOWNS[detail.ticker] ?? breakdownForScore(score, level),
    analyst_note_ar: detail.analyst_note_ar ?? DEMO_NOTES[detail.ticker] ?? (
      score > 40
        ? `ملاحظة المحلل: درجة ${score} — يُنصح بمراجعة القوائم المالية والإشارات النشطة.`
        : score > 25
          ? `ملاحظة المحلل: مخاطر متوسطة — متابعة دورية كافية حالياً.`
          : undefined
    ),
    top_flags: detail.top_flags.length > 0
      ? detail.top_flags
      : (DEMO_FLAGS[detail.ticker] ?? []).slice(0, 3).map((f) => ({
          flag_id: f.flag_id,
          title_ar: f.title_ar,
          severity: f.severity,
        })),
  };
}

const DEMO_DETAILS: Record<string, CompanyDetail> = {
  "4001.SR": {
    ticker: "4001.SR",
    name_ar: "العثيم",
    name_en: "Abdullah Al Othaim Markets",
    sector: "Retail",
    risk_score: 68,
    risk_level: "high",
    trend: "up",
    m_score: -1.62,
    latest_year: 2025,
    score_history: [
      { year: 2022, risk_score: 38, m_score: -2.1 },
      { year: 2023, risk_score: 45, m_score: -1.95 },
      { year: 2024, risk_score: 58, m_score: -1.78 },
      { year: 2025, risk_score: 68, m_score: -1.62 },
    ],
    flags_count: 3,
    top_flags: [
      { flag_id: "cfo_ni_low_streak", title_ar: "أرباح بلا تدفق نقدي", severity: "critical" },
      { flag_id: "receivables_outpace_revenue", title_ar: "نمو الذمم أسرع من المبيعات", severity: "warning" },
      { flag_id: "tata_high", title_ar: "استحقاقات عالية", severity: "critical" },
    ],
    key_metrics: {
      cfo_to_net_income: 0.38,
      gross_margin: 0.22,
      debt_to_equity: 1.45,
      receivables_to_revenue_growth: 2.14,
    },
    shap_top1: "رفعت الدرجة: نمو الذمم المدينة (DSRI=1.42) مقارنة بمتوسط قطاع التجزئة",
    indicators: DEMO_INDICATORS_4001,
    sector_avg_indicators: DEMO_SECTOR_AVG_RETAIL,
    data_status: "ok",
    confidence: "high",
    confidence_pct: 95,
    scoring_eligible: true,
    profile: DEMO_PROFILES["4001.SR"],
    score_breakdown: DEMO_BREAKDOWNS["4001.SR"],
    analyst_note_ar: DEMO_NOTES["4001.SR"],
  },
  "7020.SR": {
    ticker: "7020.SR",
    name_ar: "اتحاد اتصالات",
    name_en: "Etihad Etisalat (Mobily)",
    sector: "Telecom",
    risk_score: 57,
    risk_level: "high",
    trend: "up",
    m_score: -1.75,
    latest_year: 2013,
    score_history: MOBILY_TIMELINE.filter((y) => y.year <= 2013).map((y) => ({
      year: y.year,
      risk_score: y.risk_score,
      m_score: y.m_score,
    })),
    flags_count: 4,
    top_flags: [
      { flag_id: "m_score_high", title_ar: "مؤشر Beneish مرتفع", severity: "critical" },
      { flag_id: "tata_high", title_ar: "استحقاقات عالية", severity: "critical" },
      { flag_id: "cfo_ni_low_streak", title_ar: "أرباح بلا تدفق نقدي", severity: "critical" },
      { flag_id: "receivables_outpace_revenue", title_ar: "نمو الذمم أسرع من المبيعات", severity: "warning" },
    ],
    key_metrics: {
      cfo_to_net_income: 0.17,
      gross_margin: 0.55,
      debt_to_equity: 0.82,
      receivables_to_revenue_growth: 4.0,
    },
    shap_top1: "Backtest 2013: TATA=0.061 + DSRI=1.41 — نمط إعادة إصدار موبايلي 2014",
    indicators: { DSRI: 1.41, GMI: 1.0, AQI: 0.86, SGI: 1.14, DEPI: 1.04, SGAI: 0.96, LVGI: 1.0, TATA: 0.061 },
    sector_avg_indicators: { DSRI: 1.02, GMI: 1.0, AQI: 1.0, SGI: 1.06, DEPI: 1.0, SGAI: 1.0, LVGI: 1.03, TATA: 0.02 },
    data_status: "ok",
    confidence: "high",
    confidence_pct: 92,
    scoring_eligible: true,
    profile: DEMO_PROFILES["7020.SR"],
    score_breakdown: DEMO_BREAKDOWNS["7020.SR"],
    analyst_note_ar: DEMO_NOTES["7020.SR"],
  },
  "2140.SR": {
    ticker: "2140.SR",
    name_ar: "سليمان الحبيب",
    name_en: "Dr Sulaiman Al Habib Medical",
    sector: "Healthcare",
    risk_score: 52,
    risk_level: "high",
    trend: "stable",
    m_score: -1.85,
    latest_year: 2025,
    score_history: [
      { year: 2022, risk_score: 28, m_score: -2.3 },
      { year: 2023, risk_score: 35, m_score: -2.1 },
      { year: 2024, risk_score: 44, m_score: -1.95 },
      { year: 2025, risk_score: 52, m_score: -1.85 },
    ],
    flags_count: 2,
    top_flags: [
      { flag_id: "depi_high", title_ar: "تباطؤ الإهلاك", severity: "warning" },
      { flag_id: "receivables_outpace_revenue", title_ar: "نمو الذمم أسرع من المبيعات", severity: "warning" },
    ],
    key_metrics: { cfo_to_net_income: 0.72, gross_margin: 0.41, debt_to_equity: 0.65, receivables_to_revenue_growth: 1.62 },
    shap_top1: "رفعت الدرجة: انحراف IF عن متوسط قطاع الرعاية الصحية",
    indicators: { DSRI: 1.18, GMI: 0.98, AQI: 1.02, SGI: 1.15, DEPI: 1.28, SGAI: 1.04, LVGI: 1.1, TATA: 0.042 },
    sector_avg_indicators: { DSRI: 1.0, GMI: 1.0, AQI: 1.0, SGI: 1.1, DEPI: 1.0, SGAI: 1.0, LVGI: 1.02, TATA: 0.025 },
    data_status: "ok",
    confidence: "high",
    confidence_pct: 88,
    scoring_eligible: true,
    profile: DEMO_PROFILES["2140.SR"],
    score_breakdown: DEMO_BREAKDOWNS["2140.SR"],
    analyst_note_ar: DEMO_NOTES["2140.SR"],
  },
  "4300.SR": {
    ticker: "4300.SR",
    name_ar: "دار الأركان",
    name_en: "Dar Al Arkan",
    sector: "Real Estate",
    risk_score: 41,
    risk_level: "medium",
    trend: "down",
    m_score: -2.05,
    latest_year: 2025,
    score_history: [
      { year: 2022, risk_score: 28, m_score: -2.4 },
      { year: 2023, risk_score: 32, m_score: -2.25 },
      { year: 2024, risk_score: 38, m_score: -2.12 },
      { year: 2025, risk_score: 41, m_score: -2.05 },
    ],
    flags_count: 1,
    top_flags: [
      { flag_id: "lvgi_spike", title_ar: "قفزة في الرافعة المالية", severity: "warning" },
    ],
    key_metrics: { cfo_to_net_income: 0.85, gross_margin: 0.32, debt_to_equity: 1.85, receivables_to_revenue_growth: 1.1 },
    shap_top1: "رفعت الدرجة: LVGI=1.35 — رافعة مالية مرتفعة في قطاع العقار",
    indicators: { DSRI: 1.05, GMI: 1.02, AQI: 1.08, SGI: 1.1, DEPI: 1.0, SGAI: 1.01, LVGI: 1.35, TATA: 0.035 },
    sector_avg_indicators: { DSRI: 1.0, GMI: 1.0, AQI: 1.0, SGI: 1.05, DEPI: 1.0, SGAI: 1.0, LVGI: 1.08, TATA: 0.025 },
    data_status: "ok",
    confidence: "medium",
    confidence_pct: 82,
    scoring_eligible: true,
    profile: DEMO_PROFILES["4300.SR"],
    score_breakdown: DEMO_BREAKDOWNS["4300.SR"],
    analyst_note_ar: DEMO_NOTES["4300.SR"],
  },
};

export const DEMO_FLAGS: Record<string, FlagItem[]> = {
  "4001.SR": DEMO_ALERTS.filter((a) => a.ticker === "4001.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "7020.SR": DEMO_ALERTS.filter((a) => a.ticker === "7020.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "2140.SR": DEMO_ALERTS.filter((a) => a.ticker === "2140.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "4300.SR": DEMO_ALERTS.filter((a) => a.ticker === "4300.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "4005.SR": DEMO_ALERTS.filter((a) => a.ticker === "4005.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "4004.SR": DEMO_ALERTS.filter((a) => a.ticker === "4004.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "4240.SR": DEMO_ALERTS.filter((a) => a.ticker === "4240.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
  "2010.SR": DEMO_ALERTS.filter((a) => a.ticker === "2010.SR").map(({ ticker: _t, company_ar: _c, year: _y, ...f }) => f),
};

function genericDetail(c: CompanySummary): CompanyDetail {
  const score = c.risk_score ?? 15;
  return {
    ...c,
    m_score: -2.2 + score * 0.015,
    latest_year: 2025,
    score_history: [
      { year: 2022, risk_score: Math.max(5, score - 18), m_score: -2.5 },
      { year: 2023, risk_score: Math.max(5, score - 12), m_score: -2.3 },
      { year: 2024, risk_score: Math.max(5, score - 6), m_score: -2.1 },
      { year: 2025, risk_score: score, m_score: -2.2 + score * 0.015 },
    ],
    flags_count: score > 40 ? 2 : score > 25 ? 1 : 0,
    top_flags: [],
    key_metrics: {
      cfo_to_net_income: score > 50 ? 0.45 : 1.1,
      gross_margin: 0.28,
      debt_to_equity: 0.9,
      receivables_to_revenue_growth: score > 50 ? 1.8 : 0.9,
    },
    indicators: { DSRI: 1.0, GMI: 1.0, AQI: 1.0, SGI: 1.05, DEPI: 1.0, SGAI: 1.0, LVGI: 1.0, TATA: 0.02 },
    sector_avg_indicators: { DSRI: 1.0, GMI: 1.0, AQI: 1.0, SGI: 1.05, DEPI: 1.0, SGAI: 1.0, LVGI: 1.0, TATA: 0.02 },
    data_status: c.data_status ?? "ok",
    confidence: c.confidence ?? "high",
    confidence_pct: 90,
    scoring_eligible: true,
  };
}

export function getDemoCompany(ticker: string): CompanyDetail | null {
  const norm = ticker.includes(".") ? ticker : `${ticker}.SR`;
  let detail: CompanyDetail | null = null;
  if (DEMO_DETAILS[norm]) detail = { ...DEMO_DETAILS[norm] };
  else {
    const summary = DEMO_COMPANIES.find((c) => c.ticker === norm);
    detail = summary ? genericDetail(summary) : null;
  }
  if (!detail) return null;
  const enriched = enrichDetail(detail);
  return { ...enriched, financial_statements: getDemoFinancials(norm) };
}

export function getDemoFlags(ticker: string): FlagItem[] {
  const norm = ticker.includes(".") ? ticker : `${ticker}.SR`;
  let flags: FlagItem[] = [];
  if (DEMO_FLAGS[norm]?.length) flags = [...DEMO_FLAGS[norm]];
  else {
    const summary = DEMO_COMPANIES.find((c) => c.ticker === norm);
    const score = summary?.risk_score ?? 0;
    if (score > 30) {
      flags = [{
        flag_id: "anomaly_detected",
        title_ar: "انحراف إحصائي",
        severity: score > 50 ? "critical" : "warning",
        explanation_ar: `Isolation Forest يكتشف انحرافاً عن متوسط قطاع ${summary?.sector ?? ""}.`,
        evidence: { metric: "anomaly_score", value: score, threshold: 30, year: 2025 },
      }];
    }
  }
  return flags.map((f) => ({
    ...f,
    interrogation_prompt_ar:
      DEMO_AUDITOR_PROMPTS[f.flag_id]?.questions_ar[0] ??
      "يُنصح بمراجعة هذا المؤشر مع الشركة للحصول على توضيح إضافي.",
  }));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function demoFetchCompanies(): Promise<CompanySummary[]> {
  await delay(400);
  return DEMO_COMPANIES;
}

export async function demoFetchOverview(): Promise<MarketOverview> {
  await delay(300);
  return { ...DEMO_OVERVIEW, updated_at: new Date().toISOString() };
}

export async function demoFetchCompany(ticker: string): Promise<CompanyDetail | null> {
  await delay(350);
  return getDemoCompany(ticker);
}

export async function demoFetchFlags(ticker: string): Promise<FlagItem[]> {
  await delay(200);
  return getDemoFlags(ticker);
}

export async function demoRefresh(): Promise<Record<string, unknown>> {
  await delay(1800);
  return {
    status: "ok",
    companies_scored: 24,
    avg_risk_score: 18.4 + Math.random() * 2,
    duration_seconds: 1.8,
    updated_at: new Date().toISOString(),
  };
}
