import { useState } from "react";
import MarketOverviewPage from "./components/dashboard/MarketOverview";
import CompanyPage from "./components/company/CompanyPage";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-bg transition-colors dark:bg-[#0a1628]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        {selected ? (
          <CompanyPage ticker={selected} onBack={() => setSelected(null)} />
        ) : (
          <MarketOverviewPage onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}
