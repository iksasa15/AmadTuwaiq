import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { year: number; risk_score: number };

export default function ScoreHistoryChart({ history }: { history: Point[] }) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30">
      <h3 className="mb-4 font-bold text-ink dark:text-bg">تطور درجة المخاطر</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(12,35,65,0.1)" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v ?? 0}`, "الدرجة"]} labelFormatter={(l) => `سنة ${l}`} />
          <Line type="monotone" dataKey="risk_score" stroke="#C66E4E" strokeWidth={3} dot={{ r: 5, fill: "#C66E4E" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
