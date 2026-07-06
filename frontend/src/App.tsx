import { useState } from "react";
import { DemoModeProvider } from "./hooks/useDemoMode";
import NavShell, { type TabId } from "./components/layout/NavShell";
import MarketOverviewPage from "./components/dashboard/MarketOverview";
import CompanyPage from "./components/company/CompanyPage";
import AlertsPage from "./components/demo/AlertsPage";
import MobilyCasePage from "./components/demo/MobilyCasePage";
import SectorsPage from "./components/demo/SectorsPage";
import AboutPage from "./components/demo/AboutPage";

export default function App() {
  const [tab, setTab] = useState<TabId>("market");
  const [selected, setSelected] = useState<string | null>(null);

  const openCompany = (ticker: string) => {
    setSelected(ticker);
    setTab("market");
  };

  return (
    <DemoModeProvider>
      <div className="min-h-screen bg-bg transition-colors dark:bg-[#0a1628]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {selected ? (
            <CompanyPage ticker={selected} onBack={() => setSelected(null)} />
          ) : (
            <NavShell active={tab} onChange={setTab}>
              {tab === "market" && <MarketOverviewPage onSelect={openCompany} />}
              {tab === "alerts" && <AlertsPage onSelect={openCompany} />}
              {tab === "mobily" && <MobilyCasePage onSelectMobily={() => openCompany("7020.SR")} />}
              {tab === "sectors" && <SectorsPage />}
              {tab === "about" && <AboutPage />}
            </NavShell>
          )}
        </div>
      </div>
    </DemoModeProvider>
  );
}
