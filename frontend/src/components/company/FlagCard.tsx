import { useState } from "react";
import type { FlagItem } from "../../api/client";
import { DEMO_AUDITOR_PROMPTS } from "../../data/strategicDemo";
import { useDemoMode } from "../../hooks/useDemoMode";
import { formatEvidence } from "../../utils/risk";
import { ChevronDown, ChevronUp, MessageSquare, Paperclip, SeverityIcon } from "../ui/icons";

export default function FlagCard({ flag }: { flag: FlagItem }) {
  const { demoMode } = useDemoMode();
  const [open, setOpen] = useState(false);
  const evidence = formatEvidence(flag.evidence);
  const prompts = demoMode ? DEMO_AUDITOR_PROMPTS[flag.flag_id] : undefined;

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
                : flag.severity === "info"
                  ? "bg-secondary/15 text-secondary"
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
      {prompts && (
        <div className="mt-4 border-t border-line/60 pt-3 dark:border-bg/10">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between text-xs font-bold text-primary"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
              أسئلة مقترحة للمدقق
            </span>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {open && (
            <ol className="mt-3 space-y-2">
              {prompts.questions_ar.map((q, i) => (
                <li key={i} className="text-xs leading-relaxed text-ink-soft dark:text-bg/75">
                  <span className="font-bold text-accent">{i + 1}.</span> «{q}»
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  );
}
