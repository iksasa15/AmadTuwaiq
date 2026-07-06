import type { RiskLevel } from "../api/client";

export type ActivityItem = {
  time: string;
  text: string;
  level: RiskLevel;
  ticker?: string;
};

export type SectorMeta = {
  sector: string;
  name_ar: string;
  description_ar: string;
  risk_driver_ar: string;
  companies: string[];
};

export const DEMO_MARKET_STATS = {
  companies_scored: 24,
  banks_excluded: 6,
  flags_active: 18,
  last_refresh: "اليوم 05:42",
  data_sources: ["yfinance", "تداول", "CSV يدوي"],
  models: ["Beneish M-Score", "Isolation Forest", "XGBoost", "قواعد إشارات"],
};

export const DEMO_ACTIVITY: ActivityItem[] = [
  { time: "منذ 2 د", text: "العثيم (4001): ارتفعت الدرجة 58 → 68 — ذمم +157%", level: "high", ticker: "4001.SR" },
  { time: "منذ 8 د", text: "إشارة حرجة جديدة: أرباح بلا تدفق نقدي — العثيم", level: "high", ticker: "4001.SR" },
  { time: "منذ 15 د", text: "Backtest موبايلي 2013: 4 إشارات — درجة 57", level: "high", ticker: "7020.SR" },
  { time: "منذ 22 د", text: "سليمان الحبيب: تباطؤ إهلاك (DEPI=1.28)", level: "medium", ticker: "2140.SR" },
  { time: "منذ 35 د", text: "دار الأركان: قفزة رافعة مالية LVGI=1.35", level: "medium", ticker: "4300.SR" },
  { time: "منذ 1 س", text: "تحديث تلقائي: 24 شركة — متوسط المخاطر 18.4", level: "low" },
  { time: "منذ 2 س", text: "6 بنوك مستبعدة من التسجيل (Beneish N/A)", level: "low" },
  { time: "منذ 3 س", text: "أرامكو: درجة مستقرة 12 — لا إشارات", level: "low", ticker: "2222.SR" },
];

export const DEMO_SECTOR_META: SectorMeta[] = [
  {
    sector: "Retail",
    name_ar: "التجزئة",
    description_ar: "سلاسل سوبرماركت وإلكترونيات — حساسة لنمو الذمم والمخزون.",
    risk_driver_ar: "DSRI مرتفع في العثيم وإكسترا",
    companies: ["العثيم", "جرير", "إكسترا"],
  },
  {
    sector: "Telecom",
    name_ar: "الاتصالات",
    description_ar: "مشغّلو جوال وإنترنت — إيرادات اشتراكات مع تعقيد إثبات الإيراد.",
    risk_driver_ar: "Backtest موبايلي 2014 — نمط إيرادات مبكرة",
    companies: ["موبايلي", "stc", "زين"],
  },
  {
    sector: "Healthcare",
    name_ar: "الرعاية الصحية",
    description_ar: "مستشفيات وعيادات — نمو عبر الاستحواذات والإهلاك.",
    risk_driver_ar: "DEPI ونمو ذمم التأمين",
    companies: ["سليمان الحبيب", "دلة", "الرعاية الطبية"],
  },
  {
    sector: "Petrochemicals",
    name_ar: "البتروكيماويات",
    description_ar: "قطاع دوري — مرتبط بأسعار النفط والهوامش.",
    risk_driver_ar: "تقلبات COGS من yfinance",
    companies: ["سابك", "كيان", "بترو رابغ"],
  },
  {
    sector: "Energy",
    name_ar: "الطاقة",
    description_ar: "أرامكو والقطاع النفطي — قوائم شفافة نسبياً.",
    risk_driver_ar: "مخاطر منخفضة حالياً",
    companies: ["أرامكو"],
  },
  {
    sector: "Real Estate",
    name_ar: "العقار",
    description_ar: "تطوير عقاري — رافعة مالية وإيرادات معترف بها على المشاريع.",
    risk_driver_ar: "LVGI مرتفع في دار الأركان",
    companies: ["دار الأركان"],
  },
];

export const SECTOR_AR: Record<string, string> = Object.fromEntries(
  DEMO_SECTOR_META.map((s) => [s.sector, s.name_ar]),
);
