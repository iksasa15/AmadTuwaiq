import type { ReactNode } from "react";

export type TabId = "market" | "alerts" | "mobily" | "sectors" | "about";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "market", label: "السوق", icon: "📊" },
  { id: "alerts", label: "الإشارات", icon: "🚩" },
  { id: "mobily", label: "موبايلي 2014", icon: "📋" },
  { id: "sectors", label: "القطاعات", icon: "🏭" },
  { id: "about", label: "عن رقيب", icon: "ℹ️" },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
  children: ReactNode;
};

export default function NavShell({ active, onChange, children }: Props) {
  return (
    <>
      {/* Desktop tabs */}
      <nav className="mb-6 hidden gap-1 rounded-xl border border-line bg-white p-1 dark:border-bg/10 dark:bg-ink/30 md:flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              active === t.id
                ? "bg-ink text-bg dark:bg-primary dark:text-white"
                : "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="pb-20 md:pb-0">{children}</div>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-white/95 backdrop-blur dark:border-bg/10 dark:bg-[#0a1628]/95 md:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${
              active === t.id ? "text-primary" : "text-ink-faint"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export { TABS };
