import { useState } from "react";
import CompanyDetail from "./components/CompanyDetail";
import CompanyList from "./components/CompanyList";

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {selected ? (
          <CompanyDetail ticker={selected} onBack={() => setSelected(null)} />
        ) : (
          <CompanyList onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}
