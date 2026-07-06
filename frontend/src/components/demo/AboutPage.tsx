import type { TabId } from "../../config/navigation";
import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import { DEMO_MARKET_STATS } from "../../data/demoExtras";
import { FUTURE_SECTIONS } from "../../data/strategicDemo";
import { Info, Settings } from "../ui/icons";
import Card from "../ui/Card";
import StatCard from "../ui/StatCard";
import Logo from "../ui/Logo";
import Button from "../ui/Button";

const PLATFORM_FEATURES: { label: string; tab: TabId }[] = [
  { label: "درع الإنماء", tab: "portfolio" },
  { label: "أسئلة المدقق", tab: "prompts" },
  { label: "إثبات النموذج", tab: "backtest" },
  { label: "قدرات مستقبلية", tab: "future" },
];

type Props = {
  onNavigate?: (tab: TabId) => void;
};

export default function AboutPage({ onNavigate }: Props) {
  const meta = getPageMeta("about");

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />

      <Card padding="lg" className="mb-8 text-center">
        <Logo size="md" className="mx-auto mb-4" />
        <h1 className="page-title">رقيب · Raqeeb</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft dark:text-bg/75">
          منصة رقابة مالية <strong>استباقية</strong> — نرصد مخاطر التلاعب المحاسبي
          قبل أن يرصدها السوق.
        </p>
        {onNavigate && (
          <Button variant="secondary" size="sm" onClick={() => onNavigate("guide")} className="mt-4">
            اقرئي دليل الاستخدام
          </Button>
        )}
      </Card>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" strokeWidth={2} />
            كيف يعمل؟
          </h2>
          <ol className="space-y-3 text-sm text-ink-soft dark:text-bg/75">
            <li><strong>1.</strong> جلب القوائم المالية وتحليلها</li>
            <li><strong>2.</strong> حساب 8 مؤشرات Beneish + نماذج ML</li>
            <li><strong>3.</strong> درجة مركّبة 0–100 + قواعد إشارات</li>
            <li><strong>4.</strong> لوحة مراقبة + تنبيهات + أدوات بنكية</li>
          </ol>
        </Card>
        <Card>
          <h2 className="section-title mb-4">المعادلة</h2>
          <p className="rounded-[var(--radius-control)] bg-ink p-4 font-mono text-sm text-bg dark:bg-primary/80">
            Risk = 0.40×M + 0.20×IF + 0.15×XGB + 0.25×Rules
          </p>
          <p className="mt-4 text-xs text-ink-faint">
            مصادر: {DEMO_MARKET_STATS.data_sources.join(" · ")} · آخر تحديث: {DEMO_MARKET_STATS.last_refresh}
          </p>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="section-title mb-4">أقسام المنصة</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {PLATFORM_FEATURES.map((f) => (
            <li key={f.tab}>
              {onNavigate ? (
                <Button variant="ghost" size="sm" onClick={() => onNavigate(f.tab)} className="w-full justify-start text-primary">
                  {f.label}
                </Button>
              ) : (
                <span className="text-sm font-semibold">{f.label}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-faint">قدرات مستقبلية (ديمو): {FUTURE_SECTIONS.map((s) => s.label).join(" · ")}</p>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { n: String(DEMO_MARKET_STATS.companies_scored), label: "شركة مراقَبة" },
          { n: String(DEMO_MARKET_STATS.flags_active), label: "إشارة نشطة" },
          { n: "8", label: "مؤشرات Beneish" },
          { n: "57", label: "درجة موبايلي 2013" },
        ].map((s) => (
          <StatCard key={s.label} label={s.label} value={s.n} className="justify-center text-center [&_p:last-child]:text-primary" />
        ))}
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-ink-faint">
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
        مصرف الإنماء × أكاديمية طويق · امد 2026
      </p>
    </>
  );
}
