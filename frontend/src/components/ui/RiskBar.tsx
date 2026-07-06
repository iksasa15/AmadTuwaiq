import { RISK_COLOR, RISK_LABEL, type RiskLevel } from "../../utils/risk";
import { cn } from "../../lib/cn";

type RiskBarProps = {
  score: number;
  level: RiskLevel;
  showLabel?: boolean;
  width?: string;
  className?: string;
};

export default function RiskBar({
  score,
  level,
  showLabel = true,
  width = "w-28",
  className,
}: RiskBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("h-2 overflow-hidden rounded-full bg-bg-deep dark:bg-ink/60", width)}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: RISK_COLOR[level] }}
        />
      </div>
      <span className="w-8 font-bold" style={{ color: RISK_COLOR[level] }}>
        {score}
      </span>
      {showLabel && <span className="text-xs text-ink-faint">{RISK_LABEL[level]}</span>}
    </div>
  );
}
