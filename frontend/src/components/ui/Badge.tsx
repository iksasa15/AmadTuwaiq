import { cn } from "../../lib/cn";
import { RISK_BG, RISK_COLOR, RISK_LABEL, type RiskLevel } from "../../utils/risk";

type BadgeProps = {
  variant?: "risk" | "info" | "severity";
  level?: RiskLevel;
  severity?: "critical" | "warning" | "info";
  children?: React.ReactNode;
  className?: string;
};

const severityStyles = {
  critical: "bg-accent/15 text-accent",
  warning: "bg-primary/12 text-primary",
  info: "bg-secondary/15 text-secondary",
};

export default function Badge({ variant = "info", level, severity, children, className }: BadgeProps) {
  if (variant === "risk" && level) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-[var(--radius-control)] px-2 py-0.5 text-[10px] font-bold",
          RISK_BG[level],
          level === "low" ? "text-white" : level === "critical" ? "text-bg" : "text-white",
          className,
        )}
      >
        {children ?? RISK_LABEL[level]}
      </span>
    );
  }

  if (variant === "severity" && severity) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-[var(--radius-control)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
          severityStyles[severity],
          className,
        )}
      >
        {children ?? severity}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

export { RISK_COLOR };
