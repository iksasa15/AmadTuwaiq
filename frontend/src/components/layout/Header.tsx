import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "../ui/icons";

export default function Header({ subtitle }: { subtitle?: string }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="text-2xl font-black text-ink dark:text-bg lg:text-3xl">
          {subtitle ?? "رقيب"}
        </h1>
      </div>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary dark:border-bg/20 dark:bg-ink/40 dark:text-bg"
        aria-label="تبديل الوضع"
      >
        {dark ? (
          <>
            <Sun className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">فاتح</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">داكن</span>
          </>
        )}
      </button>
    </header>
  );
}
