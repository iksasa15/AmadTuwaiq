import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { IndicatorSet } from "../../api/client";
import { INDICATOR_KEYS, INDICATOR_LABELS } from "../../utils/risk";
import Card from "../ui/Card";

type Props = {
  indicators: IndicatorSet | null | undefined;
  sectorAvg: IndicatorSet | null | undefined;
};

function normalize(val: number | null | undefined, max = 3): number {
  if (val == null || Number.isNaN(val)) return 0;
  return Math.min(Math.abs(val) / max, 1) * 100;
}

export default function IndicatorsRadar({ indicators, sectorAvg }: Props) {
  if (!indicators) return null;

  const data = INDICATOR_KEYS.map((key) => ({
    key,
    subject: INDICATOR_LABELS[key] ?? key,
    company: normalize(indicators[key] as number),
    sector: normalize(sectorAvg?.[key] as number),
  }));

  return (
    <Card variant="elevated">
      <h3 className="section-title mb-4">المؤشرات vs متوسط القطاع</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(12,35,65,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => `${Number(v ?? 0).toFixed(0)}%`} />
          <Radar name="الشركة" dataKey="company" stroke="#C66E4E" fill="#C66E4E" fillOpacity={0.35} />
          <Radar name="القطاع" dataKey="sector" stroke="#8B84D7" fill="#8B84D7" fillOpacity={0.2} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}
