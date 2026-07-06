import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MOBILY_TIMELINE } from "../../api/dataSource";
import Header from "../layout/Header";
import { RISK_COLOR } from "../../utils/risk";

type Props = {
  onSelectMobily: () => void;
};

const chartData = MOBILY_TIMELINE.filter((y) => y.year <= 2013).map((y) => ({
  year: String(y.year),
  score: y.risk_score,
  level: y.risk_level,
}));

export default function MobilyCasePage({ onSelectMobily }: Props) {
  return (
    <>
      <Header subtitle="دراسة حالة — Backtest" />

      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-line bg-gradient-to-bl from-accent/15 via-white to-primary/10 p-6 dark:border-bg/10 dark:from-accent/20 dark:via-ink/40 dark:to-primary/15 md:p-8">
        <p className="text-sm font-bold text-primary">Case Study · Tadawul 2014</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-bg md:text-4xl">
          موبايلي — قبل إعادة الإصدار
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-bg/75">
          في <strong>نوفمبر 2014</strong> أعلنت اتحاد اتصالات (موبايلي) عن أخطاء محاسبية
          في إثبات الإيرادات وأعادت إصدار أرباح 2013 بخفض{" "}
          <strong className="text-accent">1.43 مليار ريال</strong>. نظام رقيب،
          عند إدخال القوائم <em>قبل</em> الاكتشاف، يعطي 2013 درجة{" "}
          <strong className="text-accent">57 — مرتفع</strong>.
        </p>
        <button
          type="button"
          onClick={onSelectMobily}
          className="mt-6 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-bg transition hover:opacity-90 dark:bg-primary"
        >
          عرض تفاصيل موبايلي 2013 →
        </button>
      </section>

      {/* Timeline chart */}
      <section className="mb-8 rounded-2xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
        <h2 className="mb-4 font-black text-ink dark:text-bg">تطور درجة المخاطر (2011–2013)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(v) => [`${v ?? 0}`, "الدرجة"]} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((e) => (
                <Cell key={e.year} fill={RISK_COLOR[e.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Timeline steps */}
      <section className="space-y-4">
        <h2 className="font-black text-ink dark:text-bg">الخط الزمني</h2>
        {MOBILY_TIMELINE.map((step, i) => (
          <article
            key={step.year}
            className="relative flex gap-4 rounded-xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30"
          >
            <div className="flex flex-col items-center">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{
                  background: step.risk_score > 50 ? RISK_COLOR.high : step.risk_score > 25 ? RISK_COLOR.medium : RISK_COLOR.low,
                }}
              >
                {step.year === 2014 ? "📢" : step.risk_score}
              </div>
              {i < MOBILY_TIMELINE.length - 1 && (
                <div className="mt-2 h-full w-0.5 bg-line dark:bg-bg/20" />
              )}
            </div>
            <div>
              <p className="font-bold text-ink dark:text-bg">
                {step.year}
                {step.m_score != null && (
                  <span className="mr-2 text-sm font-normal text-ink-faint">
                    M-Score: {step.m_score.toFixed(2)}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-ink-soft dark:text-bg/70">{step.note}</p>
              {step.flags > 0 && (
                <p className="mt-2 text-xs font-bold text-accent">{step.flags} إشارات حمراء</p>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Key signals */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "DSRI", value: "1.41", desc: "الذمم نمت 56% · المبيعات 14%" },
          { title: "CFO/NI", value: "0.17", desc: "أرباح بلا تدفق نقدي" },
          { title: "TATA", value: "0.061", desc: "استحقاقات فوق العتبة" },
        ].map((m) => (
          <div
            key={m.title}
            className="rounded-xl border border-accent/30 bg-accent/5 p-4 dark:bg-accent/10"
          >
            <p className="text-xs font-bold text-accent">{m.title}</p>
            <p className="mt-1 text-3xl font-black text-ink dark:text-bg">{m.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{m.desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
