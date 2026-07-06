import type { ReactNode } from "react";
import Sidebar, { TopNav, type TabId } from "./Sidebar";

type AppShellProps = {
  tab: TabId;
  onTabChange: (tab: TabId) => void;
  selected: string | null;
  children: ReactNode;
};

export default function AppShell({ tab, onTabChange, selected, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-bg dark:bg-surface">
      <Sidebar active={tab} onChange={onTabChange} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-[var(--space-page)] py-6 lg:px-10 lg:py-8">
          {!selected && <TopNav active={tab} onChange={onTabChange} />}
          {children}
        </div>
      </main>
    </div>
  );
}
