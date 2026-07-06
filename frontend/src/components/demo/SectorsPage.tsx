import { useEffect, useMemo, useState } from "react";
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
import { DEMO_SECTOR_META, SECTOR_AR } from "../../data/demoExtras";
import { Info } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import { RISK_COLOR, type RiskLevel } from "../../utils/risk";
import Card from "../ui/Card";
import Section from "../ui/Section";
import RiskBar from "../ui/RiskBar";

export default function SectorsPage() {
  const meta = getPageMeta("sectors");
  const { demoMode } = useDemoMode();
  const ds = createDataSource(demoMode);
  const [overview, setOverview] = useState<MarketOverview | null>(null);

  useEffect(() => {
    ds.overview().then(setOverview);
  }, [demoMode]);

  const sectors = overview?.sector_breakdown ?? [];

  const chartData = useMemo(
    () =>
      sectors.map((s) => ({
        ...s,
        sector_ar: SECTOR_AR[s.sector] ?? s.sector,
      })),
    [sectors],
  );

  const metaBySector = useMemo(
    () => Object.fromEntries(DEMO_SECTOR_META.map((m) => [m.sector, m])),
    [],
  );

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />

      <Section title="متوسط درجة المخاطر بالقطاع" className="mb-8">
        <Card variant="elevated" padding="lg">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 90, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" domain={[0, 50]} />
              <YAxis type="category" dataKey="sector_ar" width={85} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [`${v ?? 0}`, "متوسط الدرجة"]}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { sector?: string; sector_ar?: string };
                  return row?.sector_ar ?? row?.sector ?? "";
                }}
              />
              <Bar dataKey="avg_risk_score" fill="#C66E4E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((s) => {
          const level: RiskLevel =
            s.avg_risk_score > 50 ? "high" : s.avg_risk_score > 25 ? "medium" : "low";
          const meta = metaBySector[s.sector];
          return (
            <Card key={s.sector} variant="elevated">
              <p className="text-sm font-bold text-ink dark:text-bg">
                {SECTOR_AR[s.sector] ?? s.sector}
              </p>
              <p className="text-[10px] text-ink-faint">{s.sector}</p>
              <p className="mt-2 text-4xl font-black" style={{ color: RISK_COLOR[level] }}>
                {s.avg_risk_score}
              </p>
              <p className="mt-1 text-xs text-ink-soft">{s.count} شركة مراقَبة</p>
              {meta && (
                <>
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-bg/70">
                    {meta.description_ar}
                  </p>
                  <p className="mt-2 rounded-[var(--radius-control)] bg-bg-deep/50 px-2 py-1 text-[10px] text-ink-faint dark:bg-ink/40">
                    {meta.risk_driver_ar}
                  </p>
                  <p className="mt-2 text-[10px] text-ink-faint">
                    شركات: {meta.companies.join(" · ")}
                  </p>
                </>
              )}
              <div className="mt-3">
                <RiskBar score={Math.min(s.avg_risk_score * 2, 100)} level={level} showLabel={false} width="w-full" />
              </div>
            </Card>
          );
        })}
      </div>

      {overview?.banks_note_ar && (
        <Card padding="sm" className="mt-6 flex items-start gap-2 bg-bg-deep/50 dark:bg-ink/40">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="text-sm text-ink-soft dark:text-bg/70">{overview.banks_note_ar}</span>
        </Card>
      )}
    </>
  );
}
