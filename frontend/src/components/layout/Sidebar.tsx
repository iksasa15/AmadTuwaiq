import { TAB_ICONS, type TabId } from "../ui/icons";

export type { TabId };

export const TABS = [
  { id: "market" as const, label: "السوق", icon: TAB_ICONS.market },
  { id: "alerts" as const, label: "الإشارات", icon: TAB_ICONS.alerts },
  { id: "mobily" as const, label: "موبايلي 2014", icon: TAB_ICONS.mobily },
  { id: "sectors" as const, label: "القطاعات", icon: TAB_ICONS.sectors },
  { id: "about" as const, label: "عن رقيب", icon: TAB_ICONS.about },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-s border-line bg-white dark:border-bg/10 dark:bg-[#0d1a2d] lg:flex">
      <div className="flex items-center gap-3 border-b border-line px-5 py-5 dark:border-bg/10">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-sm font-black text-bg dark:bg-primary">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-ink text-bg dark:bg-primary dark:text-white"
                  : "text-ink-soft hover:bg-bg-deep/60 dark:text-bg/70 dark:hover:bg-ink/50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <p className="border-t border-line px-5 py-4 text-[10px] leading-relaxed text-ink-faint dark:border-bg/10">
        رقابة مالية استباقية
        <br />
        مصرف الإنماء × طويق
      </p>
    </aside>
  );
}

/** شريط علوي للشاشات الأصغر — أيقونات فقط */
export function TopNav({ active, onChange }: Props) {
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1 dark:border-bg/10 dark:bg-ink/30 lg:hidden">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.label}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              isActive
                ? "bg-ink text-bg dark:bg-primary"
                : "text-ink-soft dark:text-bg/70"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
