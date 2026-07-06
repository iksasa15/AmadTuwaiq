import { useEffect, useMemo, useState } from "react";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";
import type { CompanyDetail, FlagItem } from "../../api/client";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import { CompanyPageSkeleton } from "../ui/Skeleton";
import ScoreRing from "./ScoreRing";
import FlagCard from "./FlagCard";
import ScoreHistoryChart from "./ScoreHistoryChart";
import IndicatorsRadar from "./IndicatorsRadar";

type Props = { ticker: string; onBack: () => void };

export default function CompanyPage({ ticker, onBack }: Props) {
  const { demoMode } = useDemoMode();
  const ds = useMemo(() => createDataSource(demoMode), [demoMode]);

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([ds.company(ticker), ds.flags(ticker)])
      .then(([c, f]) => {
        if (!c) throw new Error("Company not found");
        setCompany(c);
        setFlags(f);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [ticker, demoMode]);

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

  if (!company.scoring_eligible && company.message_ar) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-primary">← العودة</button>
        <header className="rounded-2xl border border-line bg-white p-8 text-center dark:border-bg/10 dark:bg-ink/30">
          <h1 className="text-3xl font-black text-ink dark:text-bg">{company.name_ar}</h1>
          <p className="mt-2 text-ink-soft">{company.ticker} · {company.sector}</p>
          <p className="mx-auto mt-6 max-w-lg rounded-xl bg-accent/10 p-4 text-sm font-semibold text-accent">
            {company.message_ar}
          </p>
        </header>
      </div>
    );
  }

  const m = company.key_metrics;

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← العودة
      </button>

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
          {company.confidence === "low" && (
            <p className="mt-2 inline-block rounded-lg bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
              ثقة منخفضة — {company.confidence_pct != null ? `${Math.round(company.confidence_pct)}%` : ""}
            </p>
          )}
          {demoMode && ticker === "7020.SR" && (
            <p className="mt-2 inline-block rounded-lg bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
              📋 Backtest 2013 — دراسة حالة موبايلي
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

      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreHistoryChart history={company.score_history} />
        <IndicatorsRadar indicators={company.indicators} sectorAvg={company.sector_avg_indicators} />
      </div>

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
