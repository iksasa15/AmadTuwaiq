import { RISK_COLOR } from "../../utils/risk";
import { Megaphone } from "../ui/icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { cn } from "../../lib/cn";

export type TimelineStep = {
  year: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  m_score: number | null;
  flags: number;
  note: string;
  is_alert?: boolean;
  is_crisis?: boolean;
};

type Props = {
  steps: TimelineStep[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export default function InteractiveTimeline({ steps, selectedYear, onSelectYear }: Props) {
  const selected = steps.find((s) => s.year === selectedYear) ?? steps[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {steps.map((step) => {
          const active = step.year === selectedYear;
          const isCrisis = step.is_crisis || step.year === steps[steps.length - 1]?.year && step.risk_score === 0;
          return (
            <Button
              key={step.year}
              variant={active ? "primary" : "ghost"}
              size="sm"
              onClick={() => onSelectYear(step.year)}
              className={cn(
                "min-w-[72px] flex-col rounded-[var(--radius-control)]",
                !active && "bg-bg-deep/50 dark:bg-ink/40",
              )}
            >
              <span className="text-xs font-bold">{step.year}</span>
              {isCrisis ? (
                <Megaphone className="mt-1 h-4 w-4" strokeWidth={2} />
              ) : (
                <span className="mt-1 text-lg font-black" style={{ color: active ? "inherit" : RISK_COLOR[step.risk_level] }}>
                  {step.risk_score}
                </span>
              )}
              {step.is_alert && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" title="لحظة الإنذار" />
              )}
            </Button>
          );
        })}
      </div>

      {selected && (
        <Card
          variant={selected.is_alert ? "accent" : selected.is_crisis ? "accent" : "default"}
          className={cn(
            selected.is_alert && "border-accent bg-accent/10",
            selected.is_crisis && !selected.is_alert && "border-primary bg-primary/5",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white"
              style={{ background: RISK_COLOR[selected.risk_level] }}
            >
              {selected.is_crisis ? <Megaphone className="h-6 w-6" strokeWidth={2} /> : selected.risk_score}
            </div>
            <div>
              <p className="font-black text-ink dark:text-bg">
                {selected.year}
                {selected.is_alert && (
                  <span className="mr-2 rounded bg-accent px-2 py-0.5 text-xs text-white">لحظة الإنذار</span>
                )}
                {selected.is_crisis && (
                  <span className="mr-2 rounded bg-primary px-2 py-0.5 text-xs text-white">الكشف الرسمي</span>
                )}
              </p>
              {selected.m_score != null && (
                <p className="text-sm text-ink-faint">M-Score: {selected.m_score.toFixed(2)}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-bg/75">{selected.note}</p>
          {selected.flags > 0 && (
            <p className="mt-2 text-xs font-bold text-accent">{selected.flags} إشارات نشطة</p>
          )}
        </Card>
      )}
    </div>
  );
}
