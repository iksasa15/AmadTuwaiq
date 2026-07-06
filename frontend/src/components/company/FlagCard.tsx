import type { FlagItem } from "../../api/client";
import { formatEvidence } from "../../utils/risk";
import { Paperclip, SeverityIcon } from "../ui/icons";

export default function FlagCard({ flag }: { flag: FlagItem }) {
  const evidence = formatEvidence(flag.evidence);

  return (
    <article className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:border-primary/30 dark:border-bg/10 dark:bg-ink/40">
      <div className="mb-3 flex items-start gap-3">
        <SeverityIcon severity={flag.severity} className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="text-base font-bold text-ink dark:text-bg">{flag.title_ar}</h3>
          <span
            className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              flag.severity === "critical"
                ? "bg-accent/15 text-accent"
                : "bg-primary/12 text-primary"
            }`}
          >
            {flag.severity}
          </span>
        </div>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft dark:text-bg/75">{flag.explanation_ar}</p>
      {evidence && (
        <p className="flex items-start gap-2 rounded-lg bg-bg-deep/70 px-3 py-2 font-mono text-xs text-ink dark:bg-ink/60 dark:text-bg/80">
          <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={2} />
          <span>{evidence}</span>
        </p>
      )}
    </article>
  );
}
