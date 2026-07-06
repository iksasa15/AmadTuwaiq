import type { CompanySummary } from "../../api/client";
import { RISK_COLOR, RISK_LABEL } from "../../utils/risk";

function TrendIcon({ trend }: { trend: CompanySummary["trend"] }) {
  if (trend === "up") return <span className="text-accent" title="ارتفاع">↑</span>;
  if (trend === "down") return <span className="text-status-green" title="انخفاض">↓</span>;
  return <span className="text-ink-faint" title="مستقر">→</span>;
}

type Props = {
  companies: CompanySummary[];
  onSelect: (ticker: string) => void;
  sortDesc: boolean;
  onToggleSort: () => void;
};

export default function CompanyTable({ companies, onSelect, sortDesc, onToggleSort }: Props) {
  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm dark:border-bg/10 dark:bg-ink/30">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-bg/10">
        <h2 className="font-bold text-ink dark:text-bg">الشركات المراقبة</h2>
        <button
          type="button"
          onClick={onToggleSort}
          className="text-xs font-semibold text-primary"
        >
          {sortDesc ? "الأعلى خطراً أولاً ↓" : "الأقل خطراً أولاً ↑"}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-line text-ink-faint dark:border-bg/10">
              <th className="px-4 py-3 font-semibold">الشركة</th>
              <th className="px-4 py-3 font-semibold">القطاع</th>
              <th className="px-4 py-3 font-semibold">الدرجة</th>
              <th className="px-4 py-3 font-semibold">الاتجاه</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr
                key={c.ticker}
                onClick={() => onSelect(c.ticker)}
                className="cursor-pointer border-b border-line/60 transition hover:bg-bg-deep/40 dark:border-bg/5 dark:hover:bg-ink/50"
              >
                <td className="px-4 py-3">
                  <p className="font-bold text-ink dark:text-bg">{c.name_ar}</p>
                  <p className="text-xs text-ink-faint">{c.ticker}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft dark:text-bg/70">{c.sector}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-bg-deep dark:bg-ink/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${c.risk_score}%`, background: RISK_COLOR[c.risk_level] }}
                      />
                    </div>
                    <span className="w-8 font-bold" style={{ color: RISK_COLOR[c.risk_level] }}>
                      {c.risk_score}
                    </span>
                    <span className="text-xs text-ink-faint">{RISK_LABEL[c.risk_level]}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-lg">
                  <TrendIcon trend={c.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-3 md:hidden">
        {companies.map((c) => (
          <button
            key={c.ticker}
            type="button"
            onClick={() => onSelect(c.ticker)}
            className="flex w-full items-center justify-between rounded-xl border border-line p-3 text-right dark:border-bg/10"
          >
            <div>
              <p className="font-bold text-ink dark:text-bg">{c.name_ar}</p>
              <p className="text-xs text-ink-faint">{c.sector}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendIcon trend={c.trend} />
              <span className="text-xl font-black" style={{ color: RISK_COLOR[c.risk_level] }}>
                {c.risk_score}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
