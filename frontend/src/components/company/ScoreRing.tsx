import { RISK_COLOR, RISK_LABEL, type RiskLevel } from "../../utils/risk";

export default function ScoreRing({
  score,
  level,
  size = "md",
}: {
  score: number | null;
  level: RiskLevel | null;
  size?: "md" | "sm";
}) {
  const dim = size === "sm" ? 100 : 160;
  const r = size === "sm" ? 34 : 54;
  const stroke = size === "sm" ? 6 : 8;
  const scoreText = size === "sm" ? "text-3xl" : "text-5xl";

  if (score == null || level == null) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line dark:border-bg/30"
        style={{ width: dim, height: dim }}
      >
        <p className="px-2 text-center text-xs font-semibold text-ink-faint">غير محسوبة</p>
      </div>
    );
  }
  const color = RISK_COLOR[level];
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: dim, height: dim }}>
      <svg className="-rotate-90" width={dim} height={dim} viewBox={`0 0 ${dim * 0.75} ${dim * 0.75}`}>
        <circle cx={dim * 0.375} cy={dim * 0.375} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-line dark:text-bg/20" />
        <circle
          cx={dim * 0.375}
          cy={dim * 0.375}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`${scoreText} font-black leading-none`} style={{ color }}>{score}</p>
        {size === "md" && (
          <p className="mt-1 text-xs font-bold text-ink-faint dark:text-bg/60">{RISK_LABEL[level]}</p>
        )}
      </div>
    </div>
  );
}
