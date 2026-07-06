import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { DEMO_SENTIMENT_CASES } from "../../data/strategicDemo";
import CredibilityGauge from "./CredibilityGauge";
import { AlertCircle, FileText } from "../ui/icons";

type Props = { onSelect?: (ticker: string) => void };

export default function SentimentRadar({ onSelect }: Props) {
  const [active, setActive] = useState(0);
  const c = DEMO_SENTIMENT_CASES[active];
  const chartData = c.sparkline.map((v, i) => ({ i: i + 1, gap: v }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 dark:bg-accent/10">
        <p className="flex items-center gap-2 text-sm font-bold text-accent">
          <AlertCircle className="h-4 w-4" strokeWidth={2} />
          غير موجود في أنظمة البنك — فرصة ابتكار بكر
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          يقرأ رقيب تقارير مجلس الإدارة ويقارن النبرة اللفظية بالواقع الرقمي — الأرقام قد تُجمّل، لكن الصياغة تفضح النية.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_SENTIMENT_CASES.map((item, i) => (
          <button
            key={item.ticker}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active === i ? "bg-ink text-bg dark:bg-primary" : "border border-line bg-white dark:bg-ink/30"
            }`}
          >
            {item.company_ar}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
        <div className="space-y-4">
          <article className="rounded-xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-ink-faint">
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              مقتطف من تقرير مجلس الإدارة · {c.year}
            </p>
            <blockquote className="border-s-4 border-primary ps-4 text-sm leading-relaxed text-ink-soft italic dark:text-bg/80">
              «{c.excerpt_ar}»
            </blockquote>
            <p className="mt-3 text-xs">
              النبرة: <strong className="text-primary">{c.tone}</strong>
            </p>
          </article>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "نمو الإيرادات", val: `${c.metrics.revenue_growth_pct}%` },
              { label: "نمو الذمم", val: `${c.metrics.receivables_growth_pct}%`, warn: true },
              { label: "اتجاه الكاش", val: `${c.metrics.cash_trend_pct}%`, warn: c.metrics.cash_trend_pct < 0 },
              { label: "اتجاه CFO", val: `${c.metrics.cfo_trend_pct}%`, warn: c.metrics.cfo_trend_pct < 0 },
            ].map((m) => (
              <div
                key={m.label}
                className={`rounded-lg p-3 ${m.warn ? "border border-accent/30 bg-accent/5" : "bg-bg-deep/50 dark:bg-ink/40"}`}
              >
                <p className="text-[10px] text-ink-faint">{m.label}</p>
                <p className="text-lg font-black text-ink dark:text-bg">{m.val}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-white p-4 dark:border-bg/10 dark:bg-ink/30">
            <p className="mb-2 text-xs font-bold text-ink-faint">تطور فجوة المصداقية</p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData}>
                <Tooltip formatter={(v) => [`${v}%`, "الفجوة"]} />
                <Line type="monotone" dataKey="gap" stroke="#F58E7C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          <CredibilityGauge value={c.credibility_gap} />
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(c.ticker)}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              عرض {c.company_ar} ←
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
