import { useEffect, useMemo, useState } from "react";
import { createDataSource } from "../../api/dataSource";
import { useDemoMode } from "../../hooks/useDemoMode";
import type { CompanyDetail, FlagItem } from "../../api/client";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Flag,
  LayoutDashboard,
  SlidersHorizontal,
  Table2,
} from "../ui/icons";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import { CompanyPageSkeleton } from "../ui/Skeleton";
import ScoreRing from "./ScoreRing";
import FlagCard from "./FlagCard";
import ScoreHistoryChart from "./ScoreHistoryChart";
import IndicatorsRadar from "./IndicatorsRadar";
import FinancialStatementsPanel from "./FinancialStatements";
import { CompanyProfileCard, ScoreBreakdownCard } from "./CompanyExtras";
import CompanyWhatIfSimulator from "./CompanyWhatIfSimulator";
import { api, type TimelineResponse } from "../../api/client";

type Props = { ticker: string; onBack: () => void };
type PageTab = "overview" | "statements" | "flags" | "whatif";

const PAGE_TABS: { id: PageTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "whatif", label: "محاكاة ماذا لو؟", icon: SlidersHorizontal },
  { id: "statements", label: "القوائم المالية", icon: Table2 },
  { id: "flags", label: "الإشارات", icon: Flag },
];

export default function CompanyPage({ ticker, onBack }: Props) {
  const { demoMode } = useDemoMode();
  const ds = useMemo(() => createDataSource(demoMode), [demoMode]);

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<PageTab>("overview");
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    const timelineReq = demoMode
      ? Promise.resolve(null)
      : api.timeline(ticker).catch(() => null);
    Promise.all([ds.company(ticker), ds.flags(ticker), timelineReq])
      .then(([c, f, tl]) => {
        if (!c) throw new Error("Company not found");
        setCompany(c);
        setFlags(f);
        setTimeline(tl);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setTab("overview");
    load();
  }, [ticker, demoMode]);

  if (loading) return <CompanyPageSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
          العودة للسوق
        </button>
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
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
          العودة للسوق
        </button>
        <header className="rounded-xl border border-line bg-white p-8 text-center dark:border-bg/10 dark:bg-ink/30">
          <h1 className="text-3xl font-black text-ink dark:text-bg">{company.name_ar}</h1>
          <p className="mt-2 text-ink-soft">{company.ticker} · {company.sector}</p>
          <p className="mx-auto mt-6 max-w-lg rounded-lg bg-accent/10 p-4 text-sm font-semibold text-accent">
            {company.message_ar}
          </p>
        </header>
      </div>
    );
  }

  const m = company.key_metrics;
  const stmts = company.financial_statements;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
        العودة للسوق
      </button>

      {/* Header */}
      <header className="flex flex-col gap-6 rounded-xl border border-line bg-white p-6 shadow-sm dark:border-bg/10 dark:bg-ink/30 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-faint">{company.ticker} · {company.sector}</p>
          <h1 className="mt-1 text-2xl font-black text-ink dark:text-bg lg:text-3xl">{company.name_ar}</h1>
          <p className="text-sm text-ink-soft dark:text-bg/70">{company.name_en}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {company.m_score != null && (
              <span className="rounded-md bg-bg-deep/60 px-2.5 py-1 text-xs font-semibold dark:bg-ink/50">
                M-Score: <strong>{company.m_score.toFixed(2)}</strong>
                <span className="text-ink-faint"> · {company.latest_year}</span>
              </span>
            )}
            {company.confidence === "low" && (
              <span className="rounded-md bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
                ثقة منخفضة
              </span>
            )}
            {demoMode && ticker.includes("7020") && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary/12 px-2.5 py-1 text-xs font-bold text-secondary">
                <ClipboardList className="h-3 w-3" strokeWidth={2} />
                Backtest 2013
              </span>
            )}
          </div>
        </div>
        <ScoreRing score={company.risk_score} level={company.risk_level} />
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 rounded-lg border border-line bg-white p-1 dark:border-bg/10 dark:bg-ink/30">
        {PAGE_TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const badge = t.id === "flags" ? flags.length : undefined;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold transition lg:flex-none lg:px-5 ${
                active
                  ? "bg-ink text-bg dark:bg-primary"
                  : "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {t.label}
              {badge != null && badge > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-accent/20 text-accent"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <CompanyProfileCard company={company} />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "CFO / الربح", val: m.cfo_to_net_income?.toFixed(2) ?? "—", warn: (m.cfo_to_net_income ?? 1) < 0.5 },
              { label: "هامش إجمالي", val: m.gross_margin != null ? `${(m.gross_margin * 100).toFixed(0)}%` : "—", warn: false },
              { label: "دين / ملكية", val: m.debt_to_equity?.toFixed(2) ?? "—", warn: false },
              { label: "ذمم / مبيعات", val: m.receivables_to_revenue_growth?.toFixed(2) ?? "—", warn: (m.receivables_to_revenue_growth ?? 0) > 1.5 },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl border p-4 dark:bg-ink/30 ${
                  item.warn ? "border-accent/40 bg-accent/5" : "border-line bg-white dark:border-bg/10"
                }`}
              >
                <p className="text-xs text-ink-faint">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-ink dark:text-bg">{item.val}</p>
              </div>
            ))}
          </div>

          {company.shap_top1 && (
            <p className="rounded-lg border border-line bg-bg-deep/40 px-4 py-3 text-xs text-ink-soft dark:border-bg/10 dark:bg-ink/40 dark:text-bg/70">
              <BarChart3 className="mb-1 inline h-3.5 w-3.5" strokeWidth={2} />
              {" "}{company.shap_top1}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreHistoryChart history={company.score_history} timeline={timeline} />
            <IndicatorsRadar indicators={company.indicators} sectorAvg={company.sector_avg_indicators} />
          </div>

          <ScoreBreakdownCard company={company} />
        </div>
      )}

      {tab === "whatif" && !demoMode && company.scoring_eligible && (
        <CompanyWhatIfSimulator ticker={ticker} />
      )}
      {tab === "whatif" && demoMode && (
        <p className="rounded-xl border border-line bg-white p-6 text-sm text-ink-soft dark:border-bg/10 dark:bg-ink/30">
          المحاكاة الحية متوفرة في وضع API — عطّل وضع العرض من الشريط العلوي، أو جرّب المحاكي في تبويب «قدرات رقيب».
        </p>
      )}

      {/* Tab: Financial Statements */}
      {tab === "statements" && (
        stmts ? (
          <FinancialStatementsPanel data={stmts} />
        ) : (
          <EmptyState title="لا توجد قوائم مالية" message="بيانات غير متوفرة لهذه الشركة" />
        )
      )}

      {/* Tab: Flags */}
      {tab === "flags" && (
        flags.length === 0 ? (
          <EmptyState title="لا إشارات حمراء" message="لا توجد مؤشرات تستدعي التدقيق في هذه الفترة" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {flags.map((f) => (
              <FlagCard key={`${f.flag_id}-${JSON.stringify(f.evidence)}`} flag={f} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
