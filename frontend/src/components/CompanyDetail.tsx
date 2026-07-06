import { useEffect, useState } from "react";
import { api, type CompanyDetail, type FlagItem } from "../api/client";
import { RiskBadge, riskBarColor } from "./RiskBadge";

type Props = {
  ticker: string;
  onBack: () => void;
};

export default function CompanyDetail({ ticker, onBack }: Props) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.company(ticker), api.flags(ticker)])
      .then(([c, f]) => {
        setCompany(c);
        setFlags(f);
      })
      .catch((e) => setError(e.message));
  }, [ticker]);

  if (error) return <p className="text-primary">{error}</p>;
  if (!company) return <p className="text-ink-soft">جاري التحميل...</p>;

  const m = company.key_metrics;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-primary hover:underline">
        ← العودة للقائمة
      </button>

      <header className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-faint">{company.ticker} · {company.sector}</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">{company.name_ar}</h1>
            <p className="text-sm text-ink-soft">{company.name_en}</p>
          </div>
          <RiskBadge level={company.risk_level} score={company.risk_score} />
        </div>

        {company.m_score != null && (
          <p className="mt-4 text-sm text-ink-soft">
            M-Score: <strong className="text-ink">{company.m_score.toFixed(2)}</strong>
            {" · "}السنة: {company.latest_year}
          </p>
        )}

        {company.shap_top1 && (
          <p className="mt-2 rounded-lg bg-bg-deep/60 p-3 text-sm text-ink-soft">{company.shap_top1}</p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["CFO / صافي الربح", m.cfo_to_net_income?.toFixed(2)],
          ["هامش إجمالي", m.gross_margin != null ? `${(m.gross_margin * 100).toFixed(0)}%` : "—"],
          ["دين / ملكية", m.debt_to_equity?.toFixed(2)],
          ["نمو ذمم / مبيعات", m.receivables_to_revenue_growth?.toFixed(2)],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-line bg-white p-4">
            <p className="text-xs text-ink-faint">{label}</p>
            <p className="mt-1 text-xl font-bold text-ink">{val ?? "—"}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">تاريخ الدرجة</h2>
        <div className="space-y-2">
          {company.score_history.map((h) => (
            <div key={h.year} className="flex items-center gap-3">
              <span className="w-12 text-sm font-semibold text-ink-faint">{h.year}</span>
              <div className="h-2 flex-1 rounded-full bg-bg-deep">
                <div
                  className={`h-2 rounded-full ${riskBarColor(h.risk_score > 75 ? "critical" : h.risk_score > 50 ? "high" : h.risk_score > 25 ? "medium" : "low")}`}
                  style={{ width: `${h.risk_score}%` }}
                />
              </div>
              <span className="w-8 text-sm font-bold text-ink">{h.risk_score}</span>
            </div>
          ))}
        </div>
      </section>

      {flags.length > 0 && (
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">الإشارات الحمراء ({flags.length})</h2>
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.flag_id} className="rounded-xl border border-line p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${f.severity === "critical" ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"}`}>
                    {f.severity}
                  </span>
                  <strong className="text-ink">{f.title_ar}</strong>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{f.explanation_ar}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
