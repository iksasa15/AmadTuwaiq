import { Info } from "./icons";
import { cn } from "../../lib/cn";

type DisclaimerProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function Disclaimer({
  children = "مؤشر تحليلي يستدعي تدقيقًا إضافيًا، ليس اتهامًا.",
  className,
}: DisclaimerProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-[10px] leading-relaxed text-ink-faint",
        className,
      )}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}
