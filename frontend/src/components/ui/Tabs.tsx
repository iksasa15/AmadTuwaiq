import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number;
};

type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  compact?: boolean;
};

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
  compact = false,
}: TabsProps<T>) {
  return (
    <nav
      className={cn(
        "flex gap-1 rounded-[var(--radius-card)] border border-line bg-surface p-1 dark:border-bg/10",
        className,
      )}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] font-bold transition",
              compact ? "px-2.5 py-2 text-xs lg:px-3" : "px-3 py-2.5 text-sm lg:flex-none lg:px-5",
              isActive
                ? "bg-ink text-bg dark:bg-primary"
                : "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70",
            )}
          >
            {Icon && <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} strokeWidth={2} />}
            <span className={compact ? "hidden sm:inline" : undefined}>{t.label}</span>
            {t.badge != null && t.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  isActive ? "bg-white/20" : "bg-accent/20 text-accent",
                )}
              >
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
