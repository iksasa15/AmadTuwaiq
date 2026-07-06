export type StatementLine = {
  label_ar: string;
  values: (number | null)[];
  bold?: boolean;
  highlight?: boolean;
};

export type FinancialStatements = {
  years: number[];
  unit_label_ar: string;
  income: StatementLine[];
  balance: StatementLine[];
  cashflow: StatementLine[];
};

/** عرض بالمليون ريال */
export function fmtMln(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const mln = value / 1_000_000;
  if (Math.abs(mln) >= 1000) {
    return `${(mln / 1000).toFixed(2)} مليار`;
  }
  return `${mln.toLocaleString("ar-SA", { maximumFractionDigits: 0 })}`;
}

export function yoyChange(cur: number | null, prev: number | null): string | null {
  if (cur == null || prev == null || prev === 0) return null;
  const pct = ((cur - prev) / Math.abs(prev)) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

export function line(
  label_ar: string,
  values: (number | null)[],
  opts?: { bold?: boolean; highlight?: boolean },
): StatementLine {
  return { label_ar, values, ...opts };
}
