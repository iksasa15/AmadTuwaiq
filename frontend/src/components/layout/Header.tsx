import { useTheme } from "../../hooks/useTheme";

export default function Header({ subtitle }: { subtitle?: string }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-sm font-black text-bg dark:bg-primary dark:text-white">
          رق
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-bg">رقيب</h1>
          {subtitle && <p className="text-xs text-ink-faint dark:text-bg/60">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary dark:border-bg/20 dark:bg-ink/40 dark:text-bg"
        aria-label="تبديل الوضع"
      >
        {dark ? "☀️ فاتح" : "🌙 داكن"}
      </button>
    </header>
  );
}
