import type { PageAudience } from "../../config/navigation";
import Card from "./Card";
import { cn } from "../../lib/cn";

const AUDIENCE_LABEL: Record<PageAudience, string> = {
  work: "عمل يومي",
  demo: "عرض",
  both: "عمل + عرض",
};

type PageIntroProps = {
  benefit: string;
  contains: string[];
  audience: PageAudience;
  className?: string;
};

export default function PageIntro({ benefit, contains, audience, className }: PageIntroProps) {
  return (
    <Card padding="sm" className={cn("mb-6 border-primary/15 bg-primary/5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink dark:text-bg">{benefit}</p>
          <p className="mt-2 text-xs text-ink-soft dark:text-bg/70">
            <span className="font-semibold text-ink-faint">ماذا فيها: </span>
            {contains.join(" · ")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[10px] font-bold text-secondary">
          {AUDIENCE_LABEL[audience]}
        </span>
      </div>
    </Card>
  );
}
