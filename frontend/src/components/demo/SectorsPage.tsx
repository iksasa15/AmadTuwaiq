import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";
import type { MarketOverview } from "../../api/client";
import Header from "../layout/Header";
import { RISK_COLOR, type RiskLevel } from "../../utils/risk";

export default function SectorsPage() {
  const { demoMode } = useDemoMode();
  const ds = createDataSource(demoMode);
  const [overview, setOverview] = useState<MarketOverview | null>(null);

  useEffect(() => {
    ds.overview().then(setOverview);
  }, [demoMode]);

  const sectors = overview?.sector_breakdown ?? [];

  return (
    <>
      <Header subtitle="تحليل القطاعات" />

      <section className="mb-8 rounded-2xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
        <h2 className="mb-4 font-black text-ink dark:text-bg">متوسط درجة المخاطر بالقطاع</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={sectors}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 80, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis type="number" domain={[0, 50]} />
            <YAxis type="category" dataKey="sector" width={75} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v ?? 0}`, "متوسط الدرجة"]} />
            <Bar dataKey="avg_risk_score" fill="#C66E4E" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((s) => {
          const level: RiskLevel =
            s.avg_risk_score > 50 ? "high" : s.avg_risk_score > 25 ? "medium" : "low";
          return (
            <article
              key={s.sector}
              className="rounded-2xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30"
            >
              <p className="text-sm font-bold text-ink-faint">{s.sector}</p>
              <p className="mt-2 text-4xl font-black" style={{ color: RISK_COLOR[level] }}>
                {s.avg_risk_score}
              </p>
              <p className="mt-1 text-xs text-ink-soft">{s.count} شركة مراقَبة</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-deep dark:bg-ink/60">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(s.avg_risk_score * 2, 100)}%`,
                    background: RISK_COLOR[level],
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>

      {overview?.banks_note_ar && (
        <p className="mt-6 rounded-xl bg-bg-deep/60 p-4 text-sm text-ink-soft dark:bg-ink/40 dark:text-bg/70">
          ℹ️ {overview.banks_note_ar}
        </p>
      )}
    </>
  );
}
