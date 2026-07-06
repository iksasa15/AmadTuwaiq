import { useState } from "react";
import { DemoModeProvider } from "./hooks/useDemoMode";
import Sidebar, { TopNav, type TabId } from "./components/layout/Sidebar";
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
      <div className="flex min-h-screen bg-bg dark:bg-[#0a1628]">
        <Sidebar active={tab} onChange={setTab} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-5 py-6 lg:px-10 lg:py-8 xl:max-w-7xl">
            {selected ? (
              <CompanyPage ticker={selected} onBack={() => setSelected(null)} />
            ) : (
              <>
                <TopNav active={tab} onChange={setTab} />
                {tab === "market" && <MarketOverviewPage onSelect={openCompany} />}
                {tab === "alerts" && <AlertsPage onSelect={openCompany} />}
                {tab === "mobily" && <MobilyCasePage onSelectMobily={() => openCompany("7020.SR")} />}
                {tab === "sectors" && <SectorsPage />}
                {tab === "about" && <AboutPage />}
              </>
            )}
          </div>
        </main>
      </div>
    </DemoModeProvider>
  );
}
