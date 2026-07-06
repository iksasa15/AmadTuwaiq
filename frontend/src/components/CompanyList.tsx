import { useEffect, useState } from "react";
import { api, type CompanySummary } from "../api/client";
import { RiskBadge } from "./RiskBadge";

type Props = {
  onSelect: (ticker: string) => void;
};

export default function CompanyList({ onSelect }: Props) {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [sector, setSector] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .companies()
      .then(setCompanies)
      .catch((e) => setError(e.message));
  }, []);

  const sectors = [...new Set(companies.map((c) => c.sector))].sort();
  const filtered = sector ? companies.filter((c) => c.sector === sector) : companies;

  if (error) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
        تعذّر الاتصال بالـ API — تأكد من تشغيل: <code className="font-mono">uvicorn src.api.main:app --port 8000</code>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">رقيب</h1>
        <p className="mt-1 text-ink-soft">رقابة مالية استباقية — {companies.length} شركة</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSector("")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!sector ? "bg-ink text-bg" : "border border-line bg-white text-ink-soft"}`}
        >
          الكل
        </button>
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${sector === s ? "bg-ink text-bg" : "border border-line bg-white text-ink-soft"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((c) => (
          <button
            key={c.ticker}
            type="button"
            onClick={() => onSelect(c.ticker)}
            className="flex w-full items-center justify-between rounded-2xl border border-line bg-white p-4 text-right transition hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <p className="font-bold text-ink">{c.name_ar}</p>
              <p className="text-xs text-ink-faint">{c.ticker} · {c.sector}</p>
            </div>
            <RiskBadge level={c.risk_level} score={c.risk_score} />
          </button>
        ))}
      </div>
    </div>
  );
}
