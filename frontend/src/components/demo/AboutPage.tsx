import PageHeader from "../ui/PageHeader";
import { DEMO_MARKET_STATS } from "../../data/demoExtras";
import { STRATEGIC_SECTIONS } from "../../data/strategicDemo";
import { Info, Layers, Radar, Settings } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Section from "../ui/Section";
import StatCard from "../ui/StatCard";

export default function AboutPage() {
  return (
    <>
      <PageHeader title="هاكاثون امد 2026" description="منصة رقابة مالية استباقية" />

      <Card padding="lg" className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[var(--radius-card)] bg-ink text-xl font-black text-bg dark:bg-primary">
          رق
        </div>
        <h1 className="page-title">رقيب · Raqeeb</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft dark:text-bg/75">
          منصة رقابة مالية <strong>استباقية</strong> — نرصد مخاطر التلاعب المحاسبي
          قبل أن يرصدها السوق.
        </p>
      </Card>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" strokeWidth={2} />
            كيف يعمل؟
          </h2>
          <ol className="space-y-3 text-sm text-ink-soft dark:text-bg/75">
            <li><strong>1.</strong> جلب القوائم المالية (yfinance + CSV يدوي)</li>
            <li><strong>2.</strong> حساب 8 مؤشرات Beneish + ميزات ML</li>
            <li><strong>3.</strong> درجة مركّبة 0–100 + 6 قواعد إشارات</li>
            <li><strong>4.</strong> لوحة تحكم + تنبيهات + backtest</li>
          </ol>
        </Card>
        <Card>
          <h2 className="section-title mb-4">المعادلة</h2>
          <p className="rounded-[var(--radius-control)] bg-ink p-4 font-mono text-sm text-bg dark:bg-primary/80">
            Risk = 0.40×M + 0.20×IF + 0.15×XGB + 0.25×Rules
          </p>
          <ul className="mt-4 space-y-2 text-xs text-ink-soft dark:text-bg/70">
            <li>M-Score: Beneish (Enron, WorldCom)</li>
            <li>IF: Isolation Forest per-sector</li>
            <li>XGB: احتمال تلاعب (synthetic inject)</li>
            <li>Rules: CFO/NI، ذمم، TATA</li>
          </ul>
          <p className="mt-4 text-[10px] text-ink-faint">
            مصادر: {DEMO_MARKET_STATS.data_sources.join(" · ")} · آخر تحديث: {DEMO_MARKET_STATS.last_refresh}
          </p>
        </Card>
      </div>

      <Section
        title="المعمارية"
        icon={<Layers className="h-5 w-5 text-secondary" strokeWidth={2} />}
        className="mb-8"
      >
        <Card>
          <pre className="overflow-x-auto rounded-[var(--radius-control)] bg-bg-deep/50 p-5 text-center text-xs leading-loose text-ink-soft dark:bg-ink/50 dark:text-bg/70 lg:text-sm">
{`yfinance ──► ETL ──► features.parquet
                          │
                    ML + Beneish
                          │
                   scores + SQLite
                          │
                     FastAPI ──► React (RTL)`}
          </pre>
        </Card>
      </Section>

      <Section
        title="القدرات الاستراتيجية"
        icon={<Radar className="h-5 w-5 text-primary" strokeWidth={2} />}
        className="mb-8"
      >
        <Card>
          <p className="mb-4 text-sm text-ink-soft dark:text-bg/75">
            ست قدرات لا توفرها أنظمة البنك التقليدية — متوفرة في تبويب «قدرات رقيب»:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STRATEGIC_SECTIONS.map((s) => (
              <li
                key={s.id}
                className="rounded-[var(--radius-control)] bg-bg-deep/50 px-3 py-2 text-sm dark:bg-ink/40"
              >
                <strong>{s.label}</strong>
                <span className="mr-2 text-[10px] text-accent">({s.badge})</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

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
