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

export type ScoreBreakdown = {
  m_score_norm: number;
  anomaly_score: number;
  xgb_score: number;
  rule_flags_score: number;
};

export type CompanyProfile = {
  summary_ar: string;
  market_cap_ar: string;
  employees: string;
  exchange: string;
  data_source: string;
  last_scan: string;
};

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
  score_breakdown?: ScoreBreakdown | null;
  profile?: CompanyProfile | null;
  analyst_note_ar?: string | null;
};

export type FlagItem = {
  flag_id: string;
  title_ar: string;
  severity: string;
  explanation_ar: string;
  evidence: Record<string, unknown>;
  interrogation_prompt_ar?: string | null;
};

export type SimulationResult = {
  ticker: string;
  original_score: number;
  simulated_score: number;
  score_delta: number;
  original_level: RiskLevel;
  simulated_level: RiskLevel;
  triggered_flags: string[];
  removed_flags: string[];
};

export type TimelinePoint = {
  period: string;
  year: number;
  risk_score: number;
  risk_level: RiskLevel;
  is_known_crisis_point: boolean;
  crisis_label_ar: string | null;
  is_first_high_risk: boolean;
};

export type TimelineResponse = {
  ticker: string;
  has_known_case: boolean;
  months_before_official: number | null;
  source_note: string | null;
  points: TimelinePoint[];
};

export type PortfolioRow = {
  ticker: string;
  name_ar: string;
  risk_score: number;
  risk_level: RiskLevel;
  top_flag_ar: string | null;
};

export type PortfolioReport = {
  total_companies: number;
  matched_companies: number;
  unmatched_tickers: string[];
  safe_count: number;
  watch_count: number;
  danger_count: number;
  portfolio_safety_pct: number;
  rows: PortfolioRow[];
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

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: body != null ? { "Content-Type": "application/json" } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

async function postForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "POST", body: form });
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
  timeline: (ticker: string) => get<TimelineResponse>(`/companies/${encodeURIComponent(ticker)}/timeline`),
  overview: () => get<MarketOverview>("/market/overview"),
  refresh: () => post<Record<string, unknown>>("/refresh?skip_fetch=true"),
  simulate: (body: {
    ticker: string;
    revenue_delta_pct?: number;
    receivables_delta_pct?: number;
    cogs_delta_pct?: number;
    cfo_delta_pct?: number;
    depreciation_delta_pct?: number;
  }) => post<SimulationResult>("/simulate", body),
  scanPortfolio: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return postForm<PortfolioReport>("/portfolio/scan", form);
  },
};
