import { useState } from "react";
import { DemoModeProvider } from "./hooks/useDemoMode";
import AppShell from "./components/layout/AppShell";
import { type TabId } from "./components/layout/Sidebar";
import MarketOverviewPage from "./components/dashboard/MarketOverview";
import CompanyPage from "./components/company/CompanyPage";
import MobilyCasePage from "./components/demo/MobilyCasePage";
import PortfolioPage from "./components/demo/PortfolioPage";
import BacktestPage from "./components/demo/BacktestPage";
import { isMobilyTicker, MOBILY_TICKER } from "./utils/mobily";

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [selected, setSelected] = useState<string | null>(null);
  const [mobilyDetail, setMobilyDetail] = useState(false);

  const openCompany = (ticker: string) => {
    setSelected(ticker);
    setMobilyDetail(!isMobilyTicker(ticker));
    setTab("home");
  };

  const openMobilyCase = () => {
    setSelected(MOBILY_TICKER);
    setMobilyDetail(false);
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
            {tab === "home" && (
              <MarketOverviewPage onSelect={openCompany} onNavigate={setTab} />
            )}
            {tab === "portfolio" && <PortfolioPage onSelect={openCompany} />}
            {tab === "backtest" && <BacktestPage onSelectMobily={openMobilyCase} />}
          </>
        )}
      </AppShell>
    </DemoModeProvider>
  );
}
