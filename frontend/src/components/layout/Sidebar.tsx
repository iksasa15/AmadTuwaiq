import { NAV_GROUPS, PAGE_META, type TabId } from "../../config/navigation";
import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "../ui/icons";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import { cn } from "../../lib/cn";

export type { TabId };

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

function NavButton({
  tab,
  active,
  onChange,
  compact,
}: {
  tab: TabId;
  active: TabId;
  onChange: (tab: TabId) => void;
  compact?: boolean;
}) {
  const meta = PAGE_META[tab];
  const Icon = meta.icon;
  const isActive = active === tab;
  return (
    <button
      type="button"
      onClick={() => onChange(tab)}
      title={meta.label}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-control)] font-semibold transition",
        compact ? "shrink-0 px-3 py-2 text-xs font-bold" : "w-full px-3 py-2.5 text-sm",
        isActive
          ? compact
            ? "bg-ink text-bg dark:bg-primary"
            : "border-s-2 border-primary bg-ink text-bg dark:bg-primary dark:text-white"
          : compact
            ? "text-ink-soft dark:text-bg/70"
            : "text-ink-soft hover:bg-bg-deep/60 dark:text-bg/70 dark:hover:bg-ink/50",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {!compact && meta.label}
      {compact && <span className="hidden sm:inline">{meta.label}</span>}
    </button>
  );
}

export default function Sidebar({ active, onChange }: Props) {
  const { dark, toggle } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-s border-line bg-surface-elevated dark:border-bg/10 lg:flex">
      <div className="flex items-center gap-3 border-b border-line px-5 py-5 dark:border-bg/10">
        <Logo size="sm" />
        <div>
          <p className="font-bold text-ink dark:text-bg">رقيب</p>
          <p className="text-[10px] text-ink-faint">امد 2026</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label || "footer"}>
            {group.label && (
              <p className="label-caps mb-1 px-3 pt-2">{group.label}</p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((tab) => (
                <NavButton key={tab} tab={tab} active={active} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}
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
  const { dark, toggle } = useTheme();

  return (
    <div className="mb-6 flex items-center gap-2 lg:hidden">
      <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface p-1 dark:border-bg/10">
        {NAV_GROUPS.flatMap((g) => g.items).map((tab) => (
          <NavButton key={tab} tab={tab} active={active} onChange={onChange} compact />
        ))}
      </nav>
      <Button variant="secondary" size="sm" onClick={toggle} aria-label="تبديل الوضع" className="shrink-0 px-2.5">
        {dark ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
      </Button>
    </div>
  );
}
