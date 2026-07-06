import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { MarketOverview } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";

const LABELS: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
  critical: "حرج",
};

type Props = { overview: MarketOverview };

export default function RiskDonut({ overview }: Props) {
  const d = overview.distribution;
  const data = [
    { name: LABELS.low, key: "low", value: d.low, fill: RISK_COLOR.low },
    { name: LABELS.medium, key: "medium", value: d.medium, fill: RISK_COLOR.medium },
    { name: LABELS.high, key: "high", value: d.high, fill: RISK_COLOR.high },
    { name: LABELS.critical, key: "critical", value: d.critical, fill: RISK_COLOR.critical },
  ].filter((x) => x.value > 0);

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
      <div className="mx-auto w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data.map((e) => (
                <Cell key={e.key} fill={e.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v ?? 0} شركة`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {data.map((e) => (
          <li key={e.key} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: e.fill }} />
            <span className="text-ink-soft dark:text-bg/80">{e.name}</span>
            <strong className="text-ink dark:text-bg">{e.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
