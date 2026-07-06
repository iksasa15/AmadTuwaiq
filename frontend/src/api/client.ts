import type { FinancialStatements as FinancialStatementsData } from "../utils/financials";

export type { FinancialStatementsData as FinancialStatements };
export type { StatementLine } from "../utils/financials";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type CompanySummary = {
  ticker: string;
  name_ar: string;
  name_en: string;
  sector: string;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  trend: "up" | "down" | "stable";
  data_status?: "ok" | "insufficient" | "bank_excluded" | "partial";
  confidence?: "high" | "medium" | "low" | null;
  message_ar?: string | null;
};

export type IndicatorSet = Partial<Record<string, number | null>>;

export type CompanyDetail = CompanySummary & {
  m_score: number | null;
  latest_year: number | null;
  score_history: { year: number; risk_score: number; m_score: number | null }[];
  flags_count: number;
  top_flags: { flag_id: string; title_ar: string; severity: string }[];
  key_metrics: {
    cfo_to_net_income?: number | null;
    gross_margin?: number | null;
    debt_to_equity?: number | null;
    receivables_to_revenue_growth?: number | null;
  };
  shap_top1?: string | null;
  indicators?: IndicatorSet | null;
  sector_avg_indicators?: IndicatorSet | null;
  confidence_pct?: number | null;
  scoring_eligible?: boolean;
  financial_statements?: FinancialStatementsData | null;
};

export type FlagItem = {
  flag_id: string;
  title_ar: string;
  severity: string;
  explanation_ar: string;
  evidence: Record<string, unknown>;
};

export type MarketOverview = {
  total_companies: number;
  avg_risk_score: number;
  distribution: { low: number; medium: number; high: number; critical: number };
  top_risks: { ticker: string; name_ar: string; risk_score: number; risk_level: string }[];
  sector_breakdown: { sector: string; avg_risk_score: number; count: number }[];
  updated_at: string;
  banks_excluded?: number;
  banks_note_ar?: string | null;
};

const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

async function post<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  companies: () => get<CompanySummary[]>("/companies"),
  company: (ticker: string) => get<CompanyDetail>(`/companies/${encodeURIComponent(ticker)}`),
  flags: (ticker: string) => get<FlagItem[]>(`/companies/${encodeURIComponent(ticker)}/flags`),
  overview: () => get<MarketOverview>("/market/overview"),
  refresh: () => post<Record<string, unknown>>("/refresh?skip_fetch=true"),
};
