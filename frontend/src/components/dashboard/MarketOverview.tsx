import { useEffect, useMemo, useState } from "react";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";
import type { CompanySummary, MarketOverview } from "../../api/client";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import { HeroSkeleton, TableSkeleton } from "../ui/Skeleton";
import Header from "../layout/Header";
import DemoBanner from "../layout/DemoBanner";
import RiskDonut from "./RiskDonut";
import CompanyTable from "./CompanyTable";
import RefreshDemoButton from "../demo/RefreshDemoButton";

type Props = { onSelect: (ticker: string) => void };

export default function MarketOverviewPage({ onSelect }: Props) {
  const { demoMode } = useDemoMode();
  const ds = useMemo(() => createDataSource(demoMode), [demoMode]);

  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [sector, setSector] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([ds.companies(), ds.overview()])
      .then(([c, o]) => {
        setCompanies(c);
        setOverview(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [demoMode]);

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
        <DemoBanner />
        <ErrorBanner message={error} onRetry={load} />
      </>
    );
  }

  return (
    <>
      <Header subtitle="منصة رقابة مالية استباقية" />
      <DemoBanner />

      {/* Hero */}
      <section className="mb-6 grid gap-6 rounded-xl border border-line bg-white p-6 shadow-sm dark:border-bg/10 dark:bg-ink/30 lg:grid-cols-[1fr_320px]">
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
          <div className="mt-4">
            <RefreshDemoButton onRefreshed={load} />
          </div>
        </div>
        {overview && <RiskDonut overview={overview} />}
      </section>

      {/* Top risks strip */}
      {overview && overview.top_risks.length > 0 && (
        <section className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {overview.top_risks.slice(0, 5).map((r) => (
            <button
              key={r.ticker}
              type="button"
              onClick={() => onSelect(r.ticker)}
              className="shrink-0 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-right transition hover:border-accent dark:bg-accent/15"
            >
              <p className="text-xs text-ink-faint">{r.name_ar}</p>
              <p className="text-2xl font-black text-accent">{r.risk_score}</p>
            </button>
          ))}
        </section>
      )}

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
