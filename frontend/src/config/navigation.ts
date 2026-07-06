import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  Flag,
  History,
  Info,
  LayoutDashboard,
  MessageSquare,
  Radar,
  Upload,
} from "../components/ui/icons";

export type TabId =
  | "home"
  | "alerts"
  | "sectors"
  | "portfolio"
  | "prompts"
  | "backtest"
  | "future"
  | "guide"
  | "about";

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
    contains: ["جدول الشركات", "أعلى 5 مخاطر", "آخر النشاط", "فلتر القطاع"],
    audience: "both",
  },
  alerts: {
    id: "alerts",
    label: "الإشارات",
    icon: Flag,
    title: "مركز الإشارات",
    description: "إشارات نشطة مرتبة حسب الخطورة",
    benefit: "ماذا يستدعي اتصالاً أو تدقيقاً فورياً؟",
    contains: ["إشارات حرجة", "تحذيرية", "معلوماتية"],
    audience: "work",
  },
  sectors: {
    id: "sectors",
    label: "القطاعات",
    icon: Building2,
    title: "تحليل القطاعات",
    description: "متوسط درجة المخاطر حسب القطاع",
    benefit: "أين يتجمّع الخطر على مستوى الصناعة؟",
    contains: ["رسم قطاعات", "بطاقات تفصيلية", "محرّكات الخطر"],
    audience: "work",
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
  prompts: {
    id: "prompts",
    label: "أسئلة المدقق",
    icon: MessageSquare,
    title: "أسئلة المدقق",
    description: "أسئلة استجواب جاهزة لكل إشارة",
    benefit: "جاهزة للمقابلة — أسئلة مدعومة بالأدلة",
    contains: ["أسئلة لكل نوع إشارة", "أسلوب التفاوض", "نسخ سريع"],
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
  future: {
    id: "future",
    label: "قدرات مستقبلية",
    icon: Radar,
    title: "قدرات مستقبلية",
    description: "ابتكارات لا توفرها أنظمة البنك اليوم",
    benefit: "عرض الرؤية — قدرات 2027",
    contains: ["تحليل نبرة التقارير", "شبكة العلاقات", "محاكاة ماذا لو"],
    audience: "demo",
  },
  guide: {
    id: "guide",
    label: "دليل الاستخدام",
    icon: FileText,
    title: "دليل الاستخدام",
    description: "كيف تستخدمين المنصة خطوة بخطوة",
    benefit: "مسار عمل يومي أو مسار عرض سريع",
    contains: ["مسار العمل 3 دقائق", "مسار العرض 5 دقائق"],
    audience: "both",
  },
  about: {
    id: "about",
    label: "عن رقيب",
    icon: Info,
    title: "عن رقيب",
    description: "منصة رقابة مالية استباقية — امد 2026",
    benefit: "فهم فكرة المشروع ومعادلة الدرجة",
    contains: ["كيف يعمل", "المعادلة", "الإحصائيات"],
    audience: "both",
  },
};

export const NAV_GROUPS: { label: string; items: TabId[] }[] = [
  { label: "المراقبة", items: ["home", "alerts", "sectors"] },
  { label: "أدوات العمل", items: ["portfolio", "prompts"] },
  { label: "الإثبات والعرض", items: ["backtest", "future"] },
  { label: "", items: ["guide", "about"] },
];

export const ALL_TABS: TabId[] = NAV_GROUPS.flatMap((g) => g.items);

export function getPageMeta(tab: TabId): PageMeta {
  return PAGE_META[tab];
}
