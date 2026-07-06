import type { FlagItem } from "../../api/client";
import { formatEvidence } from "../../utils/risk";

const ICONS: Record<string, string> = {
  critical: "🔴",
  warning: "🟠",
  info: "🔵",
};

export default function FlagCard({ flag }: { flag: FlagItem }) {
  const evidence = formatEvidence(flag.evidence);

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-primary/30 dark:border-bg/10 dark:bg-ink/40">
      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl">{ICONS[flag.severity] ?? "⚠️"}</span>
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-bg">{flag.title_ar}</h3>
          <span
            className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold ${
              flag.severity === "critical"
                ? "bg-accent/20 text-accent"
                : "bg-primary/15 text-primary"
            }`}
          >
            {flag.severity}
          </span>
        </div>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft dark:text-bg/75">{flag.explanation_ar}</p>
      {evidence && (
        <p className="rounded-lg bg-bg-deep/70 px-3 py-2 font-mono text-xs text-ink dark:bg-ink/60 dark:text-bg/80">
          📎 {evidence}
        </p>
      )}
    </article>
  );
}
