import { useDemoMode } from "../../hooks/useDemoMode";
import { Monitor, Radio } from "../ui/icons";

export default function DemoBanner() {
  const { demoMode, toggleDemoMode } = useDemoMode();

  return (
    <div
      className={`mb-5 flex items-center justify-between gap-4 rounded-lg border px-4 py-2.5 text-sm ${
        demoMode
          ? "border-secondary/30 bg-secondary/8 dark:bg-secondary/12"
          : "border-status-green/30 bg-status-green/8"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {demoMode ? (
          <Monitor className="h-4 w-4 text-secondary" strokeWidth={2} />
        ) : (
          <Radio className="h-4 w-4 text-status-green" strokeWidth={2} />
        )}
        <span className="font-semibold text-ink dark:text-bg">
          {demoMode ? "وضع العرض — بيانات ديمو" : "وضع مباشر — API"}
        </span>
      </div>
      <button
        type="button"
        onClick={toggleDemoMode}
        className="rounded-md bg-ink px-3 py-1 text-xs font-bold text-bg dark:bg-primary"
      >
        {demoMode ? "API حقيقي" : "ديمو"}
      </button>
    </div>
  );
}
