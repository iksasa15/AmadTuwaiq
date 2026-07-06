import type { RiskLevel } from "../utils/risk";

export type SentimentCase = {
  ticker: string;
  company_ar: string;
  year: number;
  excerpt_ar: string;
  tone: string;
  credibility_gap: number;
  metrics: {
    cfo_trend_pct: number;
    receivables_growth_pct: number;
    revenue_growth_pct: number;
    cash_trend_pct: number;
  };
  sparkline: number[];
};

export type NetworkNode = {
  id: string;
  label: string;
  type: "company" | "person";
  risk_level: RiskLevel;
  x: number;
  y: number;
};

export type NetworkEdge = {
  from: string;
  to: string;
  label: string;
  amount_ar?: string;
  suspicious: boolean;
};

export type WhatIfBase = {
  ticker: string;
  company_ar: string;
  base_score: number;
  base_level: RiskLevel;
  breakdown: { m: number; if_: number; xgb: number; rules: number };
};

export type BacktestCase = {
  id: string;
  company_ar: string;
  ticker: string;
  crisis_year: number;
  alert_year: number;
  months_before: number;
  peak_score: number;
  write_down_ar?: string;
  timeline: {
    year: number;
    risk_score: number;
    risk_level: RiskLevel;
    m_score: number | null;
    flags: number;
    note: string;
    is_alert?: boolean;
    is_crisis?: boolean;
  }[];
};

export type AuditorPrompt = {
  flag_id: string;
  title_ar: string;
  negotiation_style: string;
  questions_ar: string[];
};

export type PortfolioRow = {
  ticker: string;
  name_ar: string;
  exposure_ar: string;
  risk_score: number;
  risk_level: RiskLevel;
  flags: number;
};

export const STRATEGIC_SECTIONS = [
  { id: "sentiment", label: "رادار النصّ", badge: "جديد 100%" },
  { id: "network", label: "الشبكة الجنائية", badge: "جديد 100%" },
  { id: "whatif", label: "ماذا لو؟", badge: "جديد 100%" },
  { id: "timemachine", label: "آلة الزمن", badge: "مثبت" },
  { id: "prompts", label: "أسئلة المدقق", badge: "عملي" },
  { id: "portfolio", label: "درع الإنماء", badge: "للبنك" },
] as const;

export type StrategicSectionId = (typeof STRATEGIC_SECTIONS)[number]["id"];

export const DEMO_SENTIMENT_CASES: SentimentCase[] = [
  {
    ticker: "4001.SR",
    company_ar: "العثيم",
    year: 2025,
    excerpt_ar:
      "حققنا نمواً استثنائياً واعداً في الإيرادات، مع تعزيز قاعدة عملائنا وتوسعنا الجغرافي الملحوظ. نتطلع بثقة لمستقبل مشرق مدعوماً باستراتيجيتنا التجارية الرائدة.",
    tone: "متفائل جداً",
    credibility_gap: 78,
    metrics: {
      cfo_trend_pct: -12,
      receivables_growth_pct: 157,
      revenue_growth_pct: 3,
      cash_trend_pct: -8,
    },
    sparkline: [62, 58, 45, 38],
  },
  {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    year: 2013,
    excerpt_ar:
      "شهدت الشركة نمواً قوياً في الإيرادات والأرباح التشغيلية، مع تحسن ملحوظ في الأداء المالي واستمرار الاستثمار في البنية التحتية للشبكة.",
    tone: "متفائل",
    credibility_gap: 71,
    metrics: {
      cfo_trend_pct: -42,
      receivables_growth_pct: 56,
      revenue_growth_pct: 14,
      cash_trend_pct: -35,
    },
    sparkline: [30, 44, 57],
  },
  {
    ticker: "2222.SR",
    company_ar: "أرامكو",
    year: 2025,
    excerpt_ar:
      "استمرت الشركة في تحقيق أداء مالي قوي مع تدفقات نقدية تشغيلية صحية، مدعومة بسياسات حوكمة شفافة والتزام بمعايير الإفصاح الدولية.",
    tone: "متوازن",
    credibility_gap: 12,
    metrics: {
      cfo_trend_pct: 5,
      receivables_growth_pct: 4,
      revenue_growth_pct: 6,
      cash_trend_pct: 3,
    },
    sparkline: [11, 12, 12, 12],
  },
];

export const DEMO_NETWORK = {
  nodes: [
    { id: "othaim", label: "العثيم", type: "company" as const, risk_level: "high" as const, x: 400, y: 200 },
    { id: "subsidiary", label: "عثيم العقارية", type: "company" as const, risk_level: "medium" as const, x: 180, y: 120 },
    { id: "partner", label: "دار الأركان", type: "company" as const, risk_level: "medium" as const, x: 620, y: 120 },
    { id: "person1", label: "أ. الخالدي", type: "person" as const, risk_level: "high" as const, x: 400, y: 40 },
    { id: "supplier", label: "مورد تموين", type: "company" as const, risk_level: "low" as const, x: 100, y: 280 },
    { id: "bank", label: "مصرف الإنماء", type: "company" as const, risk_level: "low" as const, x: 700, y: 280 },
  ] satisfies NetworkNode[],
  edges: [
    { from: "person1", to: "othaim", label: "عضو مجلس إدارة", suspicious: false },
    { from: "person1", to: "partner", label: "عضو مجلس إدارة", suspicious: true },
    { from: "othaim", to: "subsidiary", label: "شركة تابعة", amount_ar: "320M ريال", suspicious: true },
    { from: "subsidiary", to: "partner", label: "تدفق ذمم", amount_ar: "420M ريال", suspicious: true },
    { from: "supplier", to: "othaim", label: "ذمم مدينة", amount_ar: "167M ريال", suspicious: true },
    { from: "bank", to: "othaim", label: "تسهيل ائتماني", amount_ar: "1.2B ريال", suspicious: false },
  ] satisfies NetworkEdge[],
};

export const DEMO_WHATIF_BASE: Record<string, WhatIfBase> = {
  "4001.SR": {
    ticker: "4001.SR",
    company_ar: "العثيم",
    base_score: 68,
    base_level: "high",
    breakdown: { m: 72, if_: 58, xgb: 45, rules: 85 },
  },
  "7020.SR": {
    ticker: "7020.SR",
    company_ar: "موبايلي",
    base_score: 57,
    base_level: "high",
    breakdown: { m: 68, if_: 52, xgb: 41, rules: 78 },
  },
  "4300.SR": {
    ticker: "4300.SR",
    company_ar: "دار الأركان",
    base_score: 41,
    base_level: "medium",
    breakdown: { m: 38, if_: 32, xgb: 22, rules: 48 },
  },
};

export const ALMAJIL_TIMELINE: BacktestCase = {
  id: "almajil",
  company_ar: "المعجل",
  ticker: "4280.SR",
  crisis_year: 2016,
  alert_year: 2015,
  months_before: 9,
  peak_score: 54,
  write_down_ar: "تعثر ائتماني وإعادة هيكلة 2016",
  timeline: [
    { year: 2013, risk_score: 22, risk_level: "low", m_score: -2.2, flags: 0, note: "أداء مستقر" },
    { year: 2014, risk_score: 35, risk_level: "medium", m_score: -2.0, flags: 1, note: "بداية تباعد الذمم" },
    { year: 2015, risk_score: 54, risk_level: "high", m_score: -1.82, flags: 3, note: "إنذار مبكر — قبل التعثر بـ 9 أشهر", is_alert: true },
    { year: 2016, risk_score: 0, risk_level: "low", m_score: null, flags: 0, note: "إعادة هيكلة وتعثر رسمي", is_crisis: true },
  ],
};

export const DEMO_AUDITOR_PROMPTS: Record<string, AuditorPrompt> = {
  receivables_outpace_revenue: {
    flag_id: "receivables_outpace_revenue",
    title_ar: "نمو الذمم أسرع من المبيعات",
    negotiation_style: "تفاوضي — مطالبة بمبررات ائتمانية",
    questions_ar: [
      "نمو ذممكم المدينة بنسبة 157% لا يتماشى مع نمو مبيعاتكم الفعلي البالغ 3% — ما هي مبرراتكم الائتمانية لهذا التباين؟",
      "هل هناك تغيير في سياسة الاعتراف بالإيراد أو شروط السداد للعملاء الرئيسيين؟",
      "يرجى تقديم تحليل أعمار الذمم (Aging) للربع الأخير مع تفصيل العملاء الذين يمثلون 80% من الرصيد.",
    ],
  },
  cfo_ni_low_streak: {
    flag_id: "cfo_ni_low_streak",
    title_ar: "أرباح بلا تدفق نقدي",
    negotiation_style: "استجوابي — التركيز على جودة الأرباح",
    questions_ar: [
      "صافي ربحكم 250 مليون ريال بينما التدفق النقدي التشغيلي 741 مليون — ما الذي يفسر فجوة CFO/NI = 0.38؟",
      "هل هناك بنود غير نقدية متكررة تضخّم الربح المحاسبي؟",
      "كيف تخططون لتحسين تحصيل النقد خلال الـ 12 شهراً القادمة؟",
    ],
  },
  tata_high: {
    flag_id: "tata_high",
    title_ar: "استحقاقات عالية",
    negotiation_style: "تحليلي — ربط الأرباح بالأصول",
    questions_ar: [
      "مؤشر TATA = 0.062 يتجاوز العتبة — ما مصدر الاستحقاقات غير النقدية في قائمة الدخل؟",
      "هل تم تسريع الاعتراف بإيرادات عقود طويلة الأجل؟",
    ],
  },
  m_score_high: {
    flag_id: "m_score_high",
    title_ar: "مؤشر Beneish مرتفع",
    negotiation_style: "علمي — إحالة لمعايير Beneish",
    questions_ar: [
      "M-Score = -1.75 يتجاوز عتبة -1.78 — هل يمكنكم شرح التغيرات في DSRI وTATA مقارنة بالعام السابق؟",
      "ما الإجراءات التي اتخذتموها لمراجعة جودة الإيرادات المثبتة؟",
    ],
  },
  depi_high: {
    flag_id: "depi_high",
    title_ar: "تباطؤ الإهلاك",
    negotiation_style: "فني — مراجعة العمر الإنتاجي",
    questions_ar: [
      "DEPI = 1.28 يشير لتباطؤ الإهلاك — هل تم تمديد العمر الإنتاجي للأصول؟ وما أثره على الأرباح؟",
      "يرجى تقديم جدول إهلاك محدّث للأصول المكتسبة حديثاً.",
    ],
  },
  lvgi_spike: {
    flag_id: "lvgi_spike",
    title_ar: "قفزة في الرافعة المالية",
    negotiation_style: "ائتماني — تقييم القدرة على السداد",
    questions_ar: [
      "LVGI = 1.35 — ما مصدر التمويل الجديد وكيف يؤثر على التزاماتكم تجاه البنك؟",
      "هل هناك ضمانات إضافية مطلوبة لدعم التسهيلات الحالية؟",
    ],
  },
  data_partial: {
    flag_id: "data_partial",
    title_ar: "بيانات جزئية",
    negotiation_style: "إجرائي — طلب إفصاحات إضافية",
    questions_ar: [
      "بيانات COGS غير مكتملة من المصدر — هل يمكنكم تقديم قوائم مالية مدققة للفترة المطلوبة؟",
    ],
  },
  anomaly_detected: {
    flag_id: "anomaly_detected",
    title_ar: "انحراف إحصائي",
    negotiation_style: "تحليلي — مقارنة بالقطاع",
    questions_ar: [
      "نموذج Isolation Forest يكتشف انحرافاً عن متوسط قطاعكم — ما التغيرات غير الاعتيادية في القوائم؟",
    ],
  },
};

export const DEMO_ALINMA_PORTFOLIO = {
  name: "محفظة تمويل الشركات — مصرف الإنماء",
  file_name: "alinma_corporate_portfolio_2025.xlsx",
  scanned_at: "اليوم 06:15",
  summary: {
    total: 12,
    safe_pct: 82,
    low: 8,
    medium: 2,
    high: 2,
    critical: 0,
    total_exposure_ar: "4.2 مليار ريال",
  },
  rows: [
    { ticker: "4001.SR", name_ar: "العثيم", exposure_ar: "680M", risk_score: 68, risk_level: "high" as const, flags: 3 },
    { ticker: "7020.SR", name_ar: "موبايلي", exposure_ar: "420M", risk_score: 57, risk_level: "high" as const, flags: 4 },
    { ticker: "4300.SR", name_ar: "دار الأركان", exposure_ar: "550M", risk_score: 41, risk_level: "medium" as const, flags: 1 },
    { ticker: "4005.SR", name_ar: "الرعاية الطبية", exposure_ar: "310M", risk_score: 38, risk_level: "medium" as const, flags: 2 },
    { ticker: "2140.SR", name_ar: "سليمان الحبيب", exposure_ar: "890M", risk_score: 52, risk_level: "high" as const, flags: 2 },
    { ticker: "2222.SR", name_ar: "أرامكو", exposure_ar: "1.1B", risk_score: 12, risk_level: "low" as const, flags: 0 },
    { ticker: "7010.SR", name_ar: "stc", exposure_ar: "280M", risk_score: 22, risk_level: "low" as const, flags: 0 },
    { ticker: "2280.SR", name_ar: "المراعي", exposure_ar: "195M", risk_score: 15, risk_level: "low" as const, flags: 0 },
    { ticker: "2010.SR", name_ar: "سابك", exposure_ar: "340M", risk_score: 18, risk_level: "low" as const, flags: 1 },
    { ticker: "4190.SR", name_ar: "جرير", exposure_ar: "120M", risk_score: 24, risk_level: "low" as const, flags: 0 },
    { ticker: "1211.SR", name_ar: "معادن", exposure_ar: "175M", risk_score: 14, risk_level: "low" as const, flags: 0 },
    { ticker: "5110.SR", name_ar: "الكهرباء", exposure_ar: "240M", risk_score: 11, risk_level: "low" as const, flags: 0 },
  ] satisfies PortfolioRow[],
};
