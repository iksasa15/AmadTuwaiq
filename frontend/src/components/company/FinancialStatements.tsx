import { useState } from "react";
import type { FinancialStatements } from "../../utils/financials";
import { fmtMln, yoyChange, type StatementLine } from "../../utils/financials";
import { BarChart3, Building2, Wallet } from "../ui/icons";

type StmtTab = "income" | "balance" | "cashflow";

const TABS: { id: StmtTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "income", label: "قائمة الدخل", icon: BarChart3 },
  { id: "balance", label: "الميزانية", icon: Building2 },
  { id: "cashflow", label: "التدفقات النقدية", icon: Wallet },
];

function StatementTable({
  years,
  rows,
  unitLabel,
}: {
  years: number[];
  rows: StatementLine[];
  unitLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line dark:border-bg/10">
      <table className="w-full min-w-[520px] text-right text-sm">
        <thead>
          <tr className="border-b border-line bg-bg-deep/40 dark:border-bg/10 dark:bg-ink/50">
            <th className="sticky right-0 min-w-[180px] bg-bg-deep/40 px-4 py-3 text-xs font-bold text-ink-faint dark:bg-ink/50">
              البند
            </th>
            {years.map((y) => (
              <th key={y} className="px-4 py-3 text-xs font-bold text-ink dark:text-bg">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label_ar}
              className={`border-b border-line/50 last:border-0 dark:border-bg/5 ${
                row.highlight ? "bg-accent/5 dark:bg-accent/8" : ""
              }`}
            >
              <td
                className={`sticky right-0 bg-white px-4 py-2.5 dark:bg-ink/30 ${
                  row.bold ? "font-bold text-ink dark:text-bg" : "text-ink-soft dark:text-bg/80"
                } ${row.highlight ? "bg-accent/5 dark:bg-accent/8" : ""}`}
              >
                {row.label_ar}
              </td>
              {row.values.map((val, i) => {
                const prev = i > 0 ? row.values[i - 1] : null;
                const change = row.highlight ? yoyChange(val, prev) : null;
                return (
                  <td key={i} className="px-4 py-2.5 tabular-nums">
                    <span className={row.bold ? "font-bold text-ink dark:text-bg" : ""}>
                      {fmtMln(val)}
                    </span>
                    {change && (
                      <span
                        className={`mr-1 block text-[10px] font-semibold ${
                          change.startsWith("+") ? "text-accent" : "text-status-green"
                        }`}
                      >
                        {change}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-2 text-[10px] text-ink-faint dark:border-bg/10">
        {unitLabel}
      </p>
    </div>
  );
}

export default function FinancialStatementsPanel({ data }: { data: FinancialStatements }) {
  const [tab, setTab] = useState<StmtTab>("income");

  const rows =
    tab === "income" ? data.income : tab === "balance" ? data.balance : data.cashflow;

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1 dark:border-bg/10 dark:bg-ink/30">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-ink text-bg dark:bg-primary"
                  : "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>
      <StatementTable years={data.years} rows={rows} unitLabel={data.unit_label_ar} />
    </section>
  );
}
