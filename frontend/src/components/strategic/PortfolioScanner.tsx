import { useState } from "react";
import { DEMO_ALINMA_PORTFOLIO } from "../../data/strategicDemo";
import { RISK_COLOR, RISK_LABEL } from "../../utils/risk";
import CredibilityGauge from "./CredibilityGauge";
import { Loader2, Upload } from "../ui/icons";

type Props = { onSelect?: (ticker: string) => void };

export default function PortfolioScanner({ onSelect }: Props) {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = () => {
    setScanning(true);
    setDone(false);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
    }, 1500);
  };

  const p = DEMO_ALINMA_PORTFOLIO;
  const sorted = [...p.rows].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink/20 bg-ink/5 p-4 dark:bg-ink/30">
        <p className="text-sm font-bold text-ink dark:text-bg">درع الإنماء — ماسح المحفظة الائتمانية</p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          ارفع ملف Excel برموز شركات المحفظة — فرز الانكشاف وتحديد أعلى المخاطر في ثوانٍ.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-bg disabled:opacity-60 dark:bg-primary"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Upload className="h-4 w-4" strokeWidth={2} />
          )}
          رفع ملف (ديمو)
        </button>
        <span className="text-xs text-ink-faint">{p.file_name}</span>
      </div>

      {scanning && (
        <div className="h-2 overflow-hidden rounded-full bg-bg-deep dark:bg-ink/50">
          <div className="h-full w-full animate-pulse rounded-full bg-primary" />
        </div>
      )}

      {done && (
        <>
          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
              <CredibilityGauge value={p.summary.safe_pct} label="نسبة أمان المحفظة" />
              <p className="mt-2 text-center text-xs text-ink-faint">
                {p.summary.total} شركة · {p.summary.total_exposure_ar}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "منخفض", n: p.summary.low, c: RISK_COLOR.low },
                { label: "متوسط", n: p.summary.medium, c: RISK_COLOR.medium },
                { label: "مرتفع", n: p.summary.high, c: RISK_COLOR.high },
                { label: "حرج", n: p.summary.critical, c: RISK_COLOR.critical },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-white p-4 text-center dark:border-bg/10 dark:bg-ink/30">
                  <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                  <p className="text-xs text-ink-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-white dark:border-bg/10 dark:bg-ink/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-faint dark:border-bg/10">
                  <th className="p-3 text-right">الشركة</th>
                  <th className="p-3 text-right">الانكشاف</th>
                  <th className="p-3 text-right">الدرجة</th>
                  <th className="p-3 text-right">المستوى</th>
                  <th className="p-3 text-right">إشارات</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.ticker}
                    className="border-b border-line/60 hover:bg-bg-deep/30 dark:border-bg/10"
                  >
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onSelect?.(row.ticker)}
                        className="font-bold text-primary hover:underline"
                      >
                        {row.name_ar}
                      </button>
                      <span className="mr-2 text-xs text-ink-faint">{row.ticker}</span>
                    </td>
                    <td className="p-3">{row.exposure_ar}</td>
                    <td className="p-3 font-black" style={{ color: RISK_COLOR[row.risk_level] }}>
                      {row.risk_score}
                    </td>
                    <td className="p-3 text-xs">{RISK_LABEL[row.risk_level]}</td>
                    <td className="p-3">{row.flags || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-faint">آخر فحص: {p.scanned_at}</p>
        </>
      )}
    </div>
  );
}
