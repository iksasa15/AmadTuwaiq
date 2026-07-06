import { RISK_COLOR, RISK_LABEL, type RiskLevel } from "../../utils/risk";

export default function ScoreRing({ score, level }: { score: number; level: RiskLevel }) {
  const color = RISK_COLOR[level];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="160" height="160" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-line dark:text-bg/20" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-black leading-none" style={{ color }}>
          {score}
        </p>
        <p className="mt-1 text-xs font-bold text-ink-faint dark:text-bg/60">{RISK_LABEL[level]}</p>
      </div>
    </div>
  );
}
