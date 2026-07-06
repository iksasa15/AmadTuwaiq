import type { CompanyDetail, ScoreBreakdown } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";
import { Building2, Calendar, Database, Users } from "../ui/icons";
import Card from "../ui/Card";
import Section from "../ui/Section";

const WEIGHTS = { m: 0.4, if: 0.2, xgb: 0.15, rules: 0.25 };

function breakdownFromScore(score: number, riskLevel: string): ScoreBreakdown {
  const rules = riskLevel === "high" ? 72 : riskLevel === "medium" ? 45 : 15;
  const m = riskLevel === "high" ? 78 : riskLevel === "medium" ? 42 : 12;
  const if_ = riskLevel === "high" ? 55 : 25;
  const xgb = riskLevel === "high" ? 38 : 12;
  const total = WEIGHTS.m * m + WEIGHTS.if * if_ + WEIGHTS.xgb * xgb + WEIGHTS.rules * (rules / 100) * 100;
  const scale = score / Math.max(total, 1);
  return {
    m_score_norm: Math.round(m * scale),
    anomaly_score: Math.round(if_ * scale),
    xgb_score: Math.round(xgb * scale),
    rule_flags_score: Math.round(rules * scale),
  };
}

export function defaultBreakdown(company: CompanyDetail): ScoreBreakdown {
  return breakdownFromScore(company.risk_score ?? 20, company.risk_level ?? "low");
}

type Props = { company: CompanyDetail };

export function CompanyProfileCard({ company }: Props) {
  const p = company.profile;
  if (!p) return null;

  return (
    <Section title="نبذة الشركة">
      <Card>
        <p className="text-sm leading-relaxed text-ink-soft dark:text-bg/80">{p.summary_ar}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs lg:grid-cols-4">
          {[
            { icon: Building2, label: "القيمة السوقية", val: p.market_cap_ar },
            { icon: Users, label: "الموظفون", val: p.employees },
            { icon: Database, label: "مصدر البيانات", val: p.data_source },
            { icon: Calendar, label: "آخر فحص", val: p.last_scan },
          ].map((item) => (
            <div key={item.label} className="rounded-[var(--radius-control)] bg-bg-deep/50 p-3 dark:bg-ink/40">
              <item.icon className="mb-1 h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <dt className="text-ink-faint">{item.label}</dt>
              <dd className="mt-0.5 font-bold text-ink dark:text-bg">{item.val}</dd>
            </div>
          ))}
        </dl>
        {company.analyst_note_ar && (
          <Card variant="accent" padding="sm" className="mt-4 text-xs leading-relaxed text-ink-soft dark:text-bg/75">
            {company.analyst_note_ar}
          </Card>
        )}
      </Card>
    </Section>
  );
}

export function ScoreBreakdownCard({ company }: Props) {
  const b = company.score_breakdown ?? defaultBreakdown(company);
  const items = [
    { label: "M-Score (Beneish)", value: b.m_score_norm, weight: "40%", color: "#C66E4E" },
    { label: "Isolation Forest", value: b.anomaly_score, weight: "20%", color: "#8B84D7" },
    { label: "XGBoost", value: b.xgb_score, weight: "15%", color: "#0C2341" },
    { label: "قواعد الإشارات", value: b.rule_flags_score, weight: "25%", color: "#F58E7C" },
  ];

  return (
    <Section title="تفكيك الدرجة المركّبة">
      <Card>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-ink-soft dark:text-bg/80">
                  {item.label}
                  <span className="mr-1 text-ink-faint">({item.weight})</span>
                </span>
                <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-deep dark:bg-ink/60">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-2xl font-black" style={{ color: RISK_COLOR[company.risk_level ?? "low"] }}>
          {company.risk_score}
          <span className="mr-2 text-sm font-semibold text-ink-faint">الدرجة النهائية</span>
        </p>
      </Card>
    </Section>
  );
}
