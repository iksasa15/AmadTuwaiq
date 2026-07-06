export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
  critical: "حرج",
};

export const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#22c55e",
  medium: "#C66E4E",
  high: "#F58E7C",
  critical: "#0C2341",
};

export const RISK_BG: Record<RiskLevel, string> = {
  low: "bg-status-green",
  medium: "bg-primary",
  high: "bg-accent",
  critical: "bg-ink",
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

export const INDICATOR_KEYS = ["DSRI", "GMI", "AQI", "SGI", "DEPI", "SGAI", "LVGI", "TATA"] as const;

export const INDICATOR_LABELS: Record<string, string> = {
  DSRI: "الذمم / المبيعات",
  GMI: "هامش الربح",
  AQI: "جودة الأصول",
  SGI: "نمو المبيعات",
  DEPI: "الإهلاك",
  SGAI: "مصاريف بيعية",
  LVGI: "الرافعة",
  TATA: "الاستحقاقات",
};

export function formatEvidence(evidence: Record<string, unknown>): string {
  const metric = String(evidence.metric ?? "");
  const value = evidence.value;
  const threshold = evidence.threshold;

  if (metric === "receivables_to_revenue_growth" && value != null) {
    return `نسبة نمو الذمم إلى المبيعات = ${Number(value).toFixed(2)} (العتبة ${threshold})`;
  }
  if (metric === "cfo_to_net_income" && value != null) {
    return `CFO/صافي الربح = ${Number(value).toFixed(2)} — أقل من ${threshold}`;
  }
  if (metric === "DSRI" && value != null) {
    return `مؤشر DSRI = ${Number(value).toFixed(2)}`;
  }
  if (metric === "TATA" && value != null) {
    return `TATA = ${Number(value).toFixed(3)} (العتبة ${threshold})`;
  }
  if (metric === "m_score" && value != null) {
    return `M-Score = ${Number(value).toFixed(2)} (العتبة ${threshold})`;
  }
  if (value != null) {
    return `${metric} = ${value}`;
  }
  return "";
}
