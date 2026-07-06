import { useEffect, useState } from "react";
import { api, type CompanyDetail, type FlagItem } from "../../api/client";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import { CompanyPageSkeleton } from "../ui/Skeleton";
import ScoreRing from "./ScoreRing";
import FlagCard from "./FlagCard";
import ScoreHistoryChart from "./ScoreHistoryChart";
import IndicatorsRadar from "./IndicatorsRadar";

type Props = { ticker: string; onBack: () => void };

export default function CompanyPage({ ticker, onBack }: Props) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([api.company(ticker), api.flags(ticker)])
      .then(([c, f]) => {
        setCompany(c);
        setFlags(f);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [ticker]);

  if (loading) return <CompanyPageSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-primary">← العودة</button>
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (!company) {
    return <EmptyState title="الشركة غير موجودة" />;
  }

  const m = company.key_metrics;

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← العودة للسوق
      </button>

      {/* Header + Score Ring */}
      <header className="flex flex-col items-center gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm dark:border-bg/10 dark:bg-ink/30 md:flex-row md:items-start md:justify-between">
        <div className="text-center md:text-right">
          <p className="text-sm text-ink-faint">{company.ticker} · {company.sector}</p>
          <h1 className="mt-1 text-3xl font-black text-ink dark:text-bg md:text-4xl">{company.name_ar}</h1>
          <p className="text-ink-soft dark:text-bg/70">{company.name_en}</p>
          {company.m_score != null && (
            <p className="mt-3 text-sm text-ink-soft">
              M-Score: <strong className="text-ink dark:text-bg">{company.m_score.toFixed(2)}</strong>
              {" · "}{company.latest_year}
            </p>
          )}
          {company.shap_top1 && (
            <p className="mt-3 max-w-lg rounded-xl bg-bg-deep/60 p-3 text-xs text-ink-soft dark:bg-ink/50 dark:text-bg/70">
              {company.shap_top1}
            </p>
          )}
        </div>
        <ScoreRing score={company.risk_score} level={company.risk_level} />
      </header>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["CFO / الربح", m.cfo_to_net_income?.toFixed(2) ?? "—"],
          ["هامش إجمالي", m.gross_margin != null ? `${(m.gross_margin * 100).toFixed(0)}%` : "—"],
          ["دين / ملكية", m.debt_to_equity?.toFixed(2) ?? "—"],
          ["ذمم / مبيعات", m.receivables_to_revenue_growth?.toFixed(2) ?? "—"],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-line bg-white p-4 dark:border-bg/10 dark:bg-ink/30">
            <p className="text-xs text-ink-faint">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink dark:text-bg">{val}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreHistoryChart history={company.score_history} />
        <IndicatorsRadar indicators={company.indicators} sectorAvg={company.sector_avg_indicators} />
      </div>

      {/* Red flags — star of the demo */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-ink dark:text-bg">
          <span>🚩</span> الإشارات الحمراء
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-sm font-bold text-accent">{flags.length}</span>
        </h2>
        {flags.length === 0 ? (
          <EmptyState title="لا إشارات حمراء" message="لا توجد مؤشرات تستدعي التدقيق في هذه الفترة" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {flags.map((f) => (
              <FlagCard key={`${f.flag_id}-${JSON.stringify(f.evidence)}`} flag={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
