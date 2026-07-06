import Header from "../layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header subtitle="هاكاثون امد 2026" />

      <section className="mb-8 rounded-2xl border border-line bg-white p-8 text-center dark:border-bg/10 dark:bg-ink/30">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-ink text-2xl font-black text-bg dark:bg-primary">
          رق
        </div>
        <h1 className="text-3xl font-black text-ink dark:text-bg">رقيب · Raqeeb</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft dark:text-bg/75">
          منصة رقابة مالية <strong>استباقية</strong> — نرصد مخاطر التلاعب المحاسبي
          قبل أن يرصدها السوق.
        </p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          <h2 className="mb-3 font-black text-ink dark:text-bg">⚙️ كيف يعمل؟</h2>
          <ol className="space-y-3 text-sm text-ink-soft dark:text-bg/75">
            <li><strong>1.</strong> جلب القوائم المالية (yfinance + CSV يدوي)</li>
            <li><strong>2.</strong> حساب 8 مؤشرات Beneish + ميزات ML</li>
            <li><strong>3.</strong> درجة مركّبة 0–100 + 6 قواعد إشارات</li>
            <li><strong>4.</strong> لوحة تحكم + تنبيهات + backtest</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          <h2 className="mb-3 font-black text-ink dark:text-bg">📐 المعادلة</h2>
          <p className="rounded-xl bg-ink p-4 font-mono text-sm text-bg dark:bg-primary/80">
            Risk = 0.40×M + 0.20×IF + 0.15×XGB + 0.25×Rules
          </p>
          <ul className="mt-4 space-y-2 text-xs text-ink-soft dark:text-bg/70">
            <li>• M-Score: Beneish (Enron, WorldCom)</li>
            <li>• IF: Isolation Forest per-sector</li>
            <li>• XGB: احتمال تلاعب (synthetic inject)</li>
            <li>• Rules: CFO/NI، ذمم، TATA…</li>
          </ul>
        </article>
      </section>

      <section className="mb-8 rounded-2xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
        <h2 className="mb-4 font-black text-ink dark:text-bg">🏗️ المعمارية</h2>
        <div className="overflow-x-auto">
          <pre className="text-center text-xs leading-loose text-ink-soft dark:text-bg/70 md:text-sm">
{`yfinance ──► ETL ──► features.parquet
                          │
                    ML + Beneish
                          │
                   scores + SQLite
                          │
                     FastAPI ──► React (RTL)`}
          </pre>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { n: "24", label: "شركة مراقَبة" },
          { n: "6", label: "قواعد إشارات" },
          { n: "8", label: "مؤشرات Beneish" },
          { n: "57", label: "درجة موبايلي 2013" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line bg-white p-4 text-center dark:border-bg/10 dark:bg-ink/30"
          >
            <p className="text-3xl font-black text-primary">{s.n}</p>
            <p className="mt-1 text-xs text-ink-faint">{s.label}</p>
          </div>
        ))}
      </section>

      <p className="mt-8 text-center text-xs text-ink-faint">
        مصرف الإنماء × أكاديمية طويق · امد 2026
      </p>
    </>
  );
}
