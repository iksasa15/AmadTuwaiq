import type { CompanySummary } from "../../api/client";
import { RISK_COLOR, RISK_LABEL } from "../../utils/risk";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, ChevronUp } from "../ui/icons";

function TrendIcon({ trend }: { trend: CompanySummary["trend"] }) {
  if (trend === "up") return <ArrowUp className="h-4 w-4 text-accent" strokeWidth={2.5} aria-label="ارتفاع" />;
  if (trend === "down") return <ArrowDown className="h-4 w-4 text-status-green" strokeWidth={2.5} aria-label="انخفاض" />;
  return <ArrowLeft className="h-4 w-4 text-ink-faint" strokeWidth={2} aria-label="مستقر" />;
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
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
        >
          {sortDesc ? (
            <>
              الأعلى خطراً أولاً
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
            </>
          ) : (
            <>
              الأقل خطراً أولاً
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>

      {/* Laptop / desktop table */}
      <div className="hidden lg:block">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-line text-ink-faint dark:border-bg/10">
              <th className="px-5 py-3.5 font-semibold">الشركة</th>
              <th className="px-5 py-3.5 font-semibold">القطاع</th>
              <th className="px-5 py-3.5 font-semibold w-[40%]">الدرجة</th>
              <th className="px-5 py-3.5 font-semibold w-16">الاتجاه</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr
                key={c.ticker}
                onClick={() => onSelect(c.ticker)}
                className="cursor-pointer border-b border-line/60 transition hover:bg-bg-deep/40 dark:border-bg/5 dark:hover:bg-ink/50"
              >
                <td className="px-5 py-3.5">
                  <p className="font-bold text-ink dark:text-bg">{c.name_ar}</p>
                  <p className="text-xs text-ink-faint">{c.ticker}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft dark:text-bg/70">{c.sector}</td>
                <td className="px-5 py-3.5">
                  {c.risk_score != null && c.risk_level ? (
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
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
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
      <div className="space-y-2 p-3 lg:hidden">
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
              {c.risk_score != null && c.risk_level ? (
                <span className="text-xl font-black" style={{ color: RISK_COLOR[c.risk_level] }}>
                  {c.risk_score}
                </span>
              ) : (
                <span className="text-sm text-ink-faint">—</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
