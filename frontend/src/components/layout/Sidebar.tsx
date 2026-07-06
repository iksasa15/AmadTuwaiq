import { TAB_ICONS, type TabId } from "../ui/icons";
import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "../ui/icons";
import Button from "../ui/Button";
import { cn } from "../../lib/cn";

export type { TabId };

export const TABS = [
  { id: "market" as const, label: "السوق", icon: TAB_ICONS.market },
  { id: "alerts" as const, label: "الإشارات", icon: TAB_ICONS.alerts },
  { id: "mobily" as const, label: "موبايلي 2014", icon: TAB_ICONS.mobily },
  { id: "sectors" as const, label: "القطاعات", icon: TAB_ICONS.sectors },
  { id: "strategic" as const, label: "قدرات رقيب", icon: TAB_ICONS.strategic },
  { id: "about" as const, label: "عن رقيب", icon: TAB_ICONS.about },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export default function Sidebar({ active, onChange }: Props) {
  const { dark, toggle } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-s border-line bg-surface-elevated dark:border-bg/10 lg:flex">
      <div className="flex items-center gap-3 border-b border-line px-5 py-5 dark:border-bg/10">
        <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-card)] bg-ink text-sm font-black text-bg dark:bg-primary">
          رق
        </div>
        <div>
          <p className="font-bold text-ink dark:text-bg">رقيب</p>
          <p className="text-[10px] text-ink-faint">امد 2026</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "border-s-2 border-primary bg-ink text-bg dark:bg-primary dark:text-white"
                  : "text-ink-soft hover:bg-bg-deep/60 dark:text-bg/70 dark:hover:bg-ink/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-4 dark:border-bg/10">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggle}
          className="mb-3 w-full"
          aria-label="تبديل الوضع"
        >
          {dark ? (
            <>
              <Sun className="h-4 w-4" strokeWidth={2} />
              وضع فاتح
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" strokeWidth={2} />
              وضع داكن
            </>
          )}
        </Button>
        <p className="text-[10px] leading-relaxed text-ink-faint">
          رقابة مالية استباقية
          <br />
          مصرف الإنماء × طويق
        </p>
      </div>
    </aside>
  );
}

/** شريط علوي للشاشات الأصغر */
export function TopNav({ active, onChange }: Props) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface p-1 dark:border-bg/10 lg:hidden">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.label}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold transition",
              isActive ? "bg-ink text-bg dark:bg-primary" : "text-ink-soft dark:text-bg/70",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
