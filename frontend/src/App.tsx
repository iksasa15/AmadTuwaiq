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
import { isMobilyTicker } from "./utils/mobily";

export default function App() {
  const [tab, setTab] = useState<TabId>("market");
  const [selected, setSelected] = useState<string | null>(null);
  const [mobilyDetail, setMobilyDetail] = useState(false);

  const openCompany = (ticker: string) => {
    setSelected(ticker);
    setMobilyDetail(!isMobilyTicker(ticker));
    setTab("market");
  };

  const closeCompany = () => {
    setSelected(null);
    setMobilyDetail(false);
  };

  return (
    <DemoModeProvider>
      <AppShell tab={tab} onTabChange={setTab} selected={selected}>
        {selected ? (
          isMobilyTicker(selected) && !mobilyDetail ? (
            <MobilyCasePage
              onBack={closeCompany}
              onSelectMobily={() => setMobilyDetail(true)}
            />
          ) : (
            <CompanyPage
              ticker={selected}
              onBack={() => {
                if (isMobilyTicker(selected)) {
                  setMobilyDetail(false);
                } else {
                  closeCompany();
                }
              }}
            />
          )
        ) : (
          <>
            {tab === "market" && <MarketOverviewPage onSelect={openCompany} />}
            {tab === "alerts" && <AlertsPage onSelect={openCompany} />}
            {tab === "sectors" && <SectorsPage />}
            {tab === "strategic" && <StrategicHub onSelectCompany={openCompany} />}
            {tab === "about" && <AboutPage />}
          </>
        )}
      </AppShell>
    </DemoModeProvider>
  );
}
