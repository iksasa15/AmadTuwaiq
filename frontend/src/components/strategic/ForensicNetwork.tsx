import { useState } from "react";
import { DEMO_NETWORK } from "../../data/strategicDemo";
import { RISK_COLOR, type RiskLevel } from "../../utils/risk";
import { GitBranch } from "../ui/icons";
import Card from "../ui/Card";

type Props = { onSelect?: (ticker: string) => void };

const TICKER_MAP: Record<string, string> = {
  othaim: "4001.SR",
  partner: "4300.SR",
};

export default function ForensicNetwork({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>("othaim");

  const nodeById = Object.fromEntries(DEMO_NETWORK.nodes.map((n) => [n.id, n]));

  const isHighlighted = (id: string) =>
    selected === id ||
    hovered === id ||
    (selected &&
      DEMO_NETWORK.edges.some(
        (e) =>
          (e.from === selected && e.to === id) ||
          (e.to === selected && e.from === id),
      ));

  return (
    <div className="space-y-4">
      <Card variant="accent" padding="sm">
        <p className="flex items-center gap-2 text-sm font-bold text-accent">
          <GitBranch className="h-4 w-4" strokeWidth={2} />
          غير موجود في البنك — تحقيق جنائي بصري
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          الاحتيال يظهر عبر ترابط الكيانات وتدفق الذمم — ليس في جدول معزول.
        </p>
      </Card>

      <Card padding="none" className="overflow-x-auto">
        <svg viewBox="0 0 800 340" className="w-full min-w-[600px]">
          {DEMO_NETWORK.edges.map((e) => {
            const from = nodeById[e.from];
            const to = nodeById[e.to];
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const lit = selected === e.from || selected === e.to;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={e.suspicious ? (lit ? "#F58E7C" : "#F58E7C55") : "#94a3b855"}
                  strokeWidth={e.suspicious ? (lit ? 3 : 2) : 1.5}
                  strokeDasharray={e.suspicious ? "6 4" : undefined}
                />
                <text x={midX} y={midY - 6} textAnchor="middle" className="fill-ink-faint text-[9px]">
                  {e.label}
                  {e.amount_ar ? ` · ${e.amount_ar}` : ""}
                </text>
              </g>
            );
          })}
          {DEMO_NETWORK.nodes.map((n) => {
            const level = n.risk_level as RiskLevel;
            const color = RISK_COLOR[level];
            const lit = isHighlighted(n.id);
            const isPerson = n.type === "person";
            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  setSelected(n.id);
                  const ticker = TICKER_MAP[n.id];
                  if (ticker && onSelect) onSelect(ticker);
                }}
              >
                {isPerson ? (
                  <rect
                    x={n.x - 36}
                    y={n.y - 18}
                    width={72}
                    height={36}
                    rx={8}
                    fill={lit ? color : `${color}88`}
                    stroke={selected === n.id ? "#0C2341" : "transparent"}
                    strokeWidth={3}
                  />
                ) : (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={lit ? 38 : 32}
                    fill={lit ? color : `${color}99`}
                    stroke={selected === n.id ? "#0C2341" : "transparent"}
                    strokeWidth={3}
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-bold"
                >
                  {n.label.length > 12 ? n.label.slice(0, 10) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs">
        {(["high", "medium", "low"] as RiskLevel[]).map((l) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR[l] }} />
            {l === "high" ? "خطر مرتفع" : l === "medium" ? "متوسط" : "منخفض"}
          </span>
        ))}
        <span className="text-ink-faint">— خط متقطع = تدفق مشبوه</span>
      </div>
    </div>
  );
}
