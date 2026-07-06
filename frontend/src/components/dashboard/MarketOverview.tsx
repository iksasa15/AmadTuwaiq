import { useEffect, useMemo, useState } from "react";
import { api, type CompanySummary, type MarketOverview } from "../../api/client";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import { HeroSkeleton, TableSkeleton } from "../ui/Skeleton";
import Header from "../layout/Header";
import RiskDonut from "./RiskDonut";
import CompanyTable from "./CompanyTable";

type Props = { onSelect: (ticker: string) => void };

export default function MarketOverviewPage({ onSelect }: Props) {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [sector, setSector] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([api.companies(), api.overview()])
      .then(([c, o]) => {
        setCompanies(c);
        setOverview(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const sectors = useMemo(() => [...new Set(companies.map((c) => c.sector))].sort(), [companies]);

  const filtered = useMemo(() => {
    let list = sector ? companies.filter((c) => c.sector === sector) : [...companies];
    list.sort((a, b) => {
      const av = a.risk_score ?? -1;
      const bv = b.risk_score ?? -1;
      return sortDesc ? bv - av : av - bv;
    });
    return list;
  }, [companies, sector, sortDesc]);

  if (loading) {
    return (
      <>
        <Header subtitle="جاري التحميل..." />
        <HeroSkeleton />
        <div className="mt-8">
          <TableSkeleton />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <ErrorBanner message={error} onRetry={load} />
      </>
    );
  }

  return (
    <>
      <Header subtitle="منصة رقابة مالية استباقية" />

      {/* Hero */}
      <section className="mb-8 grid gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-bg/10 dark:bg-ink/30 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary">تحت المراقبة الآن</p>
          <p className="mt-2 text-5xl font-black text-ink dark:text-bg">
            {overview?.total_companies ?? companies.length}
            <span className="mr-2 text-2xl font-bold text-ink-faint">شركة</span>
          </p>
          <p className="mt-3 text-sm text-ink-soft dark:text-bg/70">
            متوسط درجة المخاطر:{" "}
            <strong>{overview?.avg_risk_score ?? "—"}</strong>
          </p>
        </div>
        {overview && <RiskDonut overview={overview} />}
      </section>

      {/* Sector filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSector("")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            !sector ? "bg-ink text-bg dark:bg-primary" : "border border-line bg-white text-ink-soft dark:bg-ink/30 dark:text-bg"
          }`}
        >
          الكل
        </button>
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              sector === s ? "bg-ink text-bg dark:bg-primary" : "border border-line bg-white text-ink-soft dark:bg-ink/30 dark:text-bg"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا شركات في هذا القطاع" message="جرّب فلتراً آخر" />
      ) : (
        <CompanyTable
          companies={filtered}
          onSelect={onSelect}
          sortDesc={sortDesc}
          onToggleSort={() => setSortDesc((d) => !d)}
        />
      )}
    </>
  );
}
