import { useState } from "react";
import { DemoModeProvider } from "./hooks/useDemoMode";
import AppShell from "./components/layout/AppShell";
import { type TabId } from "./components/layout/Sidebar";
import MarketOverviewPage from "./components/dashboard/MarketOverview";
import CompanyPage from "./components/company/CompanyPage";
import AlertsPage from "./components/demo/AlertsPage";
import MobilyCasePage from "./components/demo/MobilyCasePage";
import SectorsPage from "./components/demo/SectorsPage";
import AboutPage from "./components/demo/AboutPage";
import StrategicHub from "./components/strategic/StrategicHub";

export default function App() {
  const [tab, setTab] = useState<TabId>("market");
  const [selected, setSelected] = useState<string | null>(null);

  const openCompany = (ticker: string) => {
    setSelected(ticker);
    setTab("market");
  };

  return (
    <DemoModeProvider>
      <AppShell tab={tab} onTabChange={setTab} selected={selected}>
        {selected ? (
          <CompanyPage ticker={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            {tab === "market" && <MarketOverviewPage onSelect={openCompany} />}
            {tab === "alerts" && <AlertsPage onSelect={openCompany} />}
            {tab === "mobily" && <MobilyCasePage onSelectMobily={() => openCompany("7020.SR")} />}
            {tab === "sectors" && <SectorsPage />}
            {tab === "strategic" && <StrategicHub onSelectCompany={openCompany} />}
            {tab === "about" && <AboutPage />}
          </>
        )}
      </AppShell>
    </DemoModeProvider>
  );
}
