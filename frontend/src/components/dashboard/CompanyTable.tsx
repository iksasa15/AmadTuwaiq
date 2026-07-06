import type { CompanySummary } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, ChevronUp } from "../ui/icons";
import DataTable, { DataTableHead, DataTableRow, DataTableTd, DataTableTh } from "../ui/DataTable";
import RiskBar from "../ui/RiskBar";
import Card from "../ui/Card";
import Button from "../ui/Button";

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
  if (companies.length === 0) return null;

  return (
    <>
      <DataTable
        title="الشركات المراقبة"
        action={
          <Button variant="ghost" size="sm" onClick={onToggleSort} className="text-primary">
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
          </Button>
        }
        className="hidden lg:block"
      >
        <table className="w-full text-right text-sm">
          <DataTableHead>
            <DataTableTh>الشركة</DataTableTh>
            <DataTableTh>القطاع</DataTableTh>
            <DataTableTh className="w-[40%]">الدرجة</DataTableTh>
            <DataTableTh className="w-16">الاتجاه</DataTableTh>
          </DataTableHead>
          <tbody>
            {companies.map((c) => (
              <DataTableRow key={c.ticker} onClick={() => onSelect(c.ticker)}>
                <DataTableTd>
                  <p className="font-bold text-ink dark:text-bg">{c.name_ar}</p>
                  <p className="text-xs text-ink-faint">{c.ticker}</p>
                </DataTableTd>
                <DataTableTd className="text-ink-soft dark:text-bg/70">{c.sector}</DataTableTd>
                <DataTableTd>
                  {c.risk_score != null && c.risk_level ? (
                    <RiskBar score={c.risk_score} level={c.risk_level} />
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </DataTableTd>
                <DataTableTd>
                  <TrendIcon trend={c.trend} />
                </DataTableTd>
              </DataTableRow>
            ))}
          </tbody>
        </table>
      </DataTable>

      <div className="space-y-2 lg:hidden">
        {companies.map((c) => (
          <Card
            key={c.ticker}
            as="button"
            padding="sm"
            className="flex w-full items-center justify-between text-right transition hover:border-primary/30"
            onClick={() => onSelect(c.ticker)}
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
          </Card>
        ))}
      </div>
    </>
  );
}
