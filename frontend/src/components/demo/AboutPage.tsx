import Header from "../layout/Header";
import { DEMO_MARKET_STATS } from "../../data/demoExtras";
import { Info, Layers, Settings } from "../ui/icons";

export default function AboutPage() {
  return (
    <>
      <Header subtitle="هاكاثون امد 2026" />

      <section className="mb-8 rounded-xl border border-line bg-white p-10 text-center dark:border-bg/10 dark:bg-ink/30">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-xl bg-ink text-xl font-black text-bg dark:bg-primary">
          رق
        </div>
        <h1 className="text-3xl font-black text-ink dark:text-bg">رقيب · Raqeeb</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft dark:text-bg/75">
          منصة رقابة مالية <strong>استباقية</strong> — نرصد مخاطر التلاعب المحاسبي
          قبل أن يرصدها السوق.
        </p>
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          <h2 className="mb-4 flex items-center gap-2 font-black text-ink dark:text-bg">
            <Settings className="h-5 w-5 text-primary" strokeWidth={2} />
            كيف يعمل؟
          </h2>
          <ol className="space-y-3 text-sm text-ink-soft dark:text-bg/75">
            <li><strong>1.</strong> جلب القوائم المالية (yfinance + CSV يدوي)</li>
            <li><strong>2.</strong> حساب 8 مؤشرات Beneish + ميزات ML</li>
            <li><strong>3.</strong> درجة مركّبة 0–100 + 6 قواعد إشارات</li>
            <li><strong>4.</strong> لوحة تحكم + تنبيهات + backtest</li>
          </ol>
        </article>
        <article className="rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          <h2 className="mb-4 font-black text-ink dark:text-bg">المعادلة</h2>
          <p className="rounded-lg bg-ink p-4 font-mono text-sm text-bg dark:bg-primary/80">
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
        </article>
      </section>

      <section className="mb-8 rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
        <h2 className="mb-4 flex items-center gap-2 font-black text-ink dark:text-bg">
          <Layers className="h-5 w-5 text-secondary" strokeWidth={2} />
          المعمارية
        </h2>
        <pre className="overflow-x-auto rounded-lg bg-bg-deep/50 p-5 text-center text-xs leading-loose text-ink-soft dark:bg-ink/50 dark:text-bg/70 lg:text-sm">
{`yfinance ──► ETL ──► features.parquet
                          │
                    ML + Beneish
                          │
                   scores + SQLite
                          │
                     FastAPI ──► React (RTL)`}
        </pre>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { n: String(DEMO_MARKET_STATS.companies_scored), label: "شركة مراقَبة" },
          { n: String(DEMO_MARKET_STATS.flags_active), label: "إشارة نشطة" },
          { n: "8", label: "مؤشرات Beneish" },
          { n: "57", label: "درجة موبايلي 2013" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line bg-white p-5 text-center dark:border-bg/10 dark:bg-ink/30"
          >
            <p className="text-3xl font-black text-primary">{s.n}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
          </div>
        ))}
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-ink-faint">
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
        مصرف الإنماء × أكاديمية طويق · امد 2026
      </p>
    </>
  );
}
