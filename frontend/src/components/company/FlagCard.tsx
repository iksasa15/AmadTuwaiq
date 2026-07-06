import { useState } from "react";
import type { FlagItem } from "../../api/client";
import { DEMO_AUDITOR_PROMPTS } from "../../data/strategicDemo";
import { useDemoMode } from "../../hooks/useDemoMode";
import { formatEvidence } from "../../utils/risk";
import { Check, ChevronDown, ChevronUp, Copy, MessageSquare, Paperclip, SeverityIcon } from "../ui/icons";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Disclaimer from "../ui/Disclaimer";

export default function FlagCard({ flag }: { flag: FlagItem }) {
  const { demoMode } = useDemoMode();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const evidence = formatEvidence(flag.evidence);

  const prompt =
    flag.interrogation_prompt_ar ??
    (demoMode ? DEMO_AUDITOR_PROMPTS[flag.flag_id]?.questions_ar[0] : undefined);

  const copyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severity = flag.severity === "critical" ? "critical" : flag.severity === "info" ? "info" : "warning";

  return (
    <Card variant="elevated" className="transition hover:border-primary/30">
      <div className="mb-3 flex items-start gap-3">
        <SeverityIcon severity={flag.severity} className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="text-base font-bold text-ink dark:text-bg">{flag.title_ar}</h3>
          <Badge variant="severity" severity={severity} className="mt-1" />
        </div>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft dark:text-bg/75">{flag.explanation_ar}</p>
      {evidence && (
        <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-bg-deep/70 px-3 py-2 font-mono text-xs text-ink dark:bg-ink/60 dark:text-bg/80">
          <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={2} />
          <span>{evidence}</span>
        </p>
      )}
      {prompt && (
        <Card variant="accent" padding="sm" className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
              سؤال مقترح للموظف الائتماني
            </p>
            <Button variant="ghost" size="sm" onClick={copyPrompt} className="text-[10px] text-ink-faint">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "تم النسخ" : "نسخ السؤال"}
            </Button>
          </div>
          <p className="text-sm italic leading-relaxed text-ink-soft dark:text-bg/75">«{prompt}»</p>
          {demoMode && DEMO_AUDITOR_PROMPTS[flag.flag_id] && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((o) => !o)}
              className="mt-2 text-[10px] text-primary"
            >
              {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              أسئلة إضافية
            </Button>
          )}
          {open && DEMO_AUDITOR_PROMPTS[flag.flag_id] && (
            <ol className="mt-2 space-y-1 border-t border-primary/10 pt-2">
              {DEMO_AUDITOR_PROMPTS[flag.flag_id].questions_ar.slice(1).map((q, i) => (
                <li key={i} className="text-xs text-ink-soft">• {q}</li>
              ))}
            </ol>
          )}
        </Card>
      )}
      <Disclaimer className="mt-3" />
    </Card>
  );
}
