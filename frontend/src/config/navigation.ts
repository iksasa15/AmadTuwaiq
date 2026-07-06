import type { LucideIcon } from "lucide-react";
import { History, LayoutDashboard, Upload } from "../components/ui/icons";

export type TabId = "home" | "portfolio" | "backtest";

export type PageAudience = "work" | "demo" | "both";

export type PageMeta = {
  id: TabId;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  contains: string[];
  audience: PageAudience;
};

export const PAGE_META: Record<TabId, PageMeta> = {
  home: {
    id: "home",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    title: "لوحة التحكم",
    description: "نقطة البداية — نظرة عامة على السوق",
    benefit: "اعرفي أي شركات تحتاج متابعة اليوم",
    contains: ["جدول الشركات", "أعلى 5 مخاطر", "فلتر القطاع"],
    audience: "both",
  },
  portfolio: {
    id: "portfolio",
    label: "درع الإنماء",
    icon: Upload,
    title: "درع الإنماء",
    description: "ماسح المحفظة الائتمانية",
    benefit: "فحص محفظة كاملة في ثوانٍ — أداة البنك الأساسية",
    contains: ["رفع CSV/XLSX", "ملف ديمو الإنماء", "تقرير أمان المحفظة"],
    audience: "work",
  },
  backtest: {
    id: "backtest",
    label: "إثبات النموذج",
    icon: History,
    title: "إثبات النموذج",
    description: "هل رقيب يرصد قبل الإعلان الرسمي؟",
    benefit: "للعرض على الحكام — أزمات حقيقية سعودية",
    contains: ["موبايلي 2014", "المعجل 2016", "خط زمني تفاعلي"],
    audience: "demo",
  },
};

export const NAV_GROUPS: { label: string; items: TabId[] }[] = [
  { label: "المراقبة", items: ["home"] },
  { label: "أدوات العمل", items: ["portfolio"] },
  { label: "الإثبات والعرض", items: ["backtest"] },
];

export const ALL_TABS: TabId[] = NAV_GROUPS.flatMap((g) => g.items);

export function getPageMeta(tab: TabId): PageMeta {
  return PAGE_META[tab];
}
