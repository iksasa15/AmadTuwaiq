import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelineResponse } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";
import Card from "../ui/Card";
import Disclaimer from "../ui/Disclaimer";

type Point = { year: number; risk_score: number };

type Props = {
  history: Point[];
  timeline?: TimelineResponse | null;
};

export default function ScoreHistoryChart({ history, timeline }: Props) {
  if (history.length === 0) return null;

  const crisisPoint = timeline?.points.find((p) => p.is_known_crisis_point);
  const firstHigh = timeline?.points.find((p) => p.is_first_high_risk);
  const showHistorical = timeline?.has_known_case && timeline.points.length > 0;

  return (
    <Card variant="elevated">
      <h3 className="section-title mb-2">تطور درجة المخاطر</h3>

      {showHistorical && timeline?.months_before_official != null && timeline.months_before_official > 0 && (
        <p className="mb-3 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400">
          رقيب رصدها قبل {timeline.months_before_official} شهرًا من الإعلان الرسمي
        </p>
      )}

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(12,35,65,0.1)" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v ?? 0}`, "الدرجة"]} labelFormatter={(l) => `سنة ${l}`} />
          {crisisPoint && (
            <ReferenceLine
              x={crisisPoint.year}
              stroke="#F58E7C"
              strokeDasharray="4 4"
              label={{ value: "تاريخ الاكتشاف الرسمي", position: "top", fontSize: 10 }}
            />
          )}
          {firstHigh && (
            <ReferenceDot
              x={firstHigh.year}
              y={firstHigh.risk_score}
              r={6}
              fill={RISK_COLOR.high}
              stroke="#fff"
              strokeWidth={2}
            />
          )}
          <Line type="monotone" dataKey="risk_score" stroke="#C66E4E" strokeWidth={3} dot={{ r: 5, fill: "#C66E4E" }} />
        </LineChart>
      </ResponsiveContainer>

      {showHistorical && crisisPoint?.crisis_label_ar && (
        <p className="mt-3 text-xs text-ink-faint">
          بيانات تاريخية معلنة رسميًا — {crisisPoint.crisis_label_ar}
          {timeline?.source_note ? ` · ${timeline.source_note}` : ""}
        </p>
      )}

      <Disclaimer className="mt-2" />
    </Card>
  );
}
