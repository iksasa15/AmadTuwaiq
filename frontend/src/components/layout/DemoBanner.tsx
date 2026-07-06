import { useDemoMode } from "../../hooks/useDemoMode";

export default function DemoBanner() {
  const { demoMode, toggleDemoMode } = useDemoMode();

  return (
    <div
      className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        demoMode
          ? "border-secondary/40 bg-secondary/10 dark:border-secondary/30 dark:bg-secondary/15"
          : "border-status-green/40 bg-status-green/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{demoMode ? "🎬" : "🔴"}</span>
        <span className="font-bold text-ink dark:text-bg">
          {demoMode ? "وضع العرض — بيانات ديمو للتقديم" : "وضع مباشر — API حقيقي"}
        </span>
      </div>
      <button
        type="button"
        onClick={toggleDemoMode}
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-bg transition hover:opacity-90 dark:bg-primary"
      >
        {demoMode ? "التبديل للـ API" : "التبديل للديمو"}
      </button>
    </div>
  );
}
