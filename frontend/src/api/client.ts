const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

export type CompanySummary = {
  ticker: string;
  name_ar: string;
  name_en: string;
  sector: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
};

export type CompanyDetail = CompanySummary & {
  m_score: number | null;
  latest_year: number;
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
};

export type FlagItem = {
  flag_id: string;
  title_ar: string;
  severity: string;
  explanation_ar: string;
  evidence: Record<string, unknown>;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  companies: () => get<CompanySummary[]>("/companies"),
  company: (ticker: string) => get<CompanyDetail>(`/companies/${encodeURIComponent(ticker)}`),
  flags: (ticker: string) => get<FlagItem[]>(`/companies/${encodeURIComponent(ticker)}/flags`),
  overview: () => get<Record<string, unknown>>("/market/overview"),
};
