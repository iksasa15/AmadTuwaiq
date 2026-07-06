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
import PageHeader from "../ui/PageHeader";
import Tabs from "../ui/Tabs";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

type Props = { ticker: string; onBack: () => void };
type PageTab = "overview" | "statements" | "flags" | "whatif";

const PAGE_TABS = [
  { id: "overview" as const, label: "نظرة عامة", icon: LayoutDashboard },
  { id: "whatif" as const, label: "محاكاة ماذا لو؟", icon: SlidersHorizontal },
  { id: "statements" as const, label: "القوائم المالية", icon: Table2 },
  { id: "flags" as const, label: "الإشارات", icon: Flag },
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
        <Button variant="ghost" size="sm" onClick={onBack} className="text-primary">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
          العودة للسوق
        </Button>
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
        <Button variant="ghost" size="sm" onClick={onBack} className="text-primary">
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
          العودة للسوق
        </Button>
        <Card padding="lg" className="text-center">
          <h1 className="page-title">{company.name_ar}</h1>
          <p className="mt-2 text-ink-soft">{company.ticker} · {company.sector}</p>
          <p className="mx-auto mt-6 max-w-lg rounded-[var(--radius-control)] bg-accent/10 p-4 text-sm font-semibold text-accent">
            {company.message_ar}
          </p>
        </Card>
      </div>
    );
  }

  const m = company.key_metrics;
  const stmts = company.financial_statements;

  const tabsWithBadge = PAGE_TABS.map((t) => ({
    ...t,
    badge: t.id === "flags" ? flags.length : undefined,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Button variant="ghost" size="sm" onClick={onBack} className="px-0 text-primary">
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
            العودة للسوق
          </Button>
        }
        title={company.name_ar}
        description={`${company.ticker} · ${company.sector} — ${company.name_en}`}
      />

      <Card variant="elevated" padding="lg" className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {company.m_score != null && (
              <span className="rounded-[var(--radius-control)] bg-bg-deep/60 px-2.5 py-1 text-xs font-semibold dark:bg-ink/50">
                M-Score: <strong>{company.m_score.toFixed(2)}</strong>
                <span className="text-ink-faint"> · {company.latest_year}</span>
              </span>
            )}
            {company.confidence === "low" && (
              <Badge variant="info">ثقة منخفضة</Badge>
            )}
            {demoMode && ticker.includes("7020") && (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-control)] bg-secondary/12 px-2.5 py-1 text-xs font-bold text-secondary">
                <ClipboardList className="h-3 w-3" strokeWidth={2} />
                Backtest 2013
              </span>
            )}
          </div>
        </div>
        <ScoreRing score={company.risk_score} level={company.risk_level} />
      </Card>

      <Tabs tabs={tabsWithBadge} active={tab} onChange={setTab} />

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
              <Card
                key={item.label}
                variant={item.warn ? "accent" : "default"}
                padding="sm"
                className={item.warn ? "border-accent/40" : ""}
              >
                <p className="label-caps">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-ink dark:text-bg">{item.val}</p>
              </Card>
            ))}
          </div>

          {company.shap_top1 && (
            <Card padding="sm" className="text-xs text-ink-soft dark:text-bg/70">
              <BarChart3 className="mb-1 inline h-3.5 w-3.5" strokeWidth={2} />
              {" "}{company.shap_top1}
            </Card>
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
        <Card>
          <p className="text-sm text-ink-soft">
            المحاكاة الحية تتطلب اتصالاً بالـ API — شغّل Backend على المنفذ 8000.
          </p>
        </Card>
      )}

      {tab === "statements" && (
        stmts ? (
          <FinancialStatementsPanel data={stmts} />
        ) : (
          <EmptyState title="لا توجد قوائم مالية" message="بيانات غير متوفرة لهذه الشركة" />
        )
      )}

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
