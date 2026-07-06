const LEVEL: Record<string, string> = {
  low: "bg-status-green/15 text-status-green border-status-green/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  high: "bg-accent/20 text-accent border-accent/40",
  critical: "bg-ink text-bg border-ink",
};

const LABEL: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
  critical: "حرج",
};

export function RiskBadge({ level, score }: { level: string; score: number }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${LEVEL[level] ?? LEVEL.low}`}>
      {score}
      <span className="text-xs font-medium opacity-80">{LABEL[level] ?? level}</span>
    </span>
  );
}

export function riskBarColor(level: string) {
  return level === "critical" || level === "high"
    ? "bg-accent"
    : level === "medium"
      ? "bg-primary"
      : "bg-status-green";
}
