import { useRef, useState } from "react";
import { api, type PortfolioReport } from "../../api/client";
import { DEMO_ALINMA_PORTFOLIO } from "../../data/strategicDemo";
import { useDemoMode } from "../../hooks/useDemoMode";
import { RISK_COLOR, RISK_LABEL } from "../../utils/risk";
import CredibilityGauge from "./CredibilityGauge";
import { Download, Loader2, Upload } from "../ui/icons";

type Props = { onSelect?: (ticker: string) => void };

function demoToReport(): PortfolioReport {
  const p = DEMO_ALINMA_PORTFOLIO;
  return {
    total_companies: p.summary.total,
    matched_companies: p.rows.length,
    unmatched_tickers: [],
    safe_count: p.summary.low,
    watch_count: p.summary.medium,
    danger_count: p.summary.high + p.summary.critical,
    portfolio_safety_pct: p.summary.safe_pct,
    rows: p.rows.map((r) => ({
      ticker: r.ticker,
      name_ar: r.name_ar,
      risk_score: r.risk_score,
      risk_level: r.risk_level,
      top_flag_ar: r.flags > 0 ? `${r.flags} إشارات` : null,
    })),
  };
}

export default function PortfolioScanner({ onSelect }: Props) {
  const { demoMode } = useDemoMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<PortfolioReport | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setScanning(true);
    setError("");
    setReport(null);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 1200));
        setReport(demoToReport());
      } else {
        const data = await api.scanPortfolio(file);
        setReport(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الفحص");
    } finally {
      setScanning(false);
    }
  };

  const exportCsv = () => {
    if (!report) return;
    const header = "ticker,name_ar,risk_score,risk_level,top_flag\n";
    const rows = report.rows
      .map((r) => `${r.ticker},${r.name_ar},${r.risk_score},${r.risk_level},${r.top_flag_ar ?? ""}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raqeeb_portfolio_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sorted = report ? [...report.rows].sort((a, b) => b.risk_score - a.risk_score) : [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink/20 bg-ink/5 p-4 dark:bg-ink/30">
        <p className="text-sm font-bold text-ink dark:text-bg">درع الإنماء — ماسح المحفظة الائتمانية</p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          ارفع ملف CSV أو Excel برموز شركات المحفظة — فرز الانكشاف وتحديد أعلى المخاطر في ثوانٍ.
        </p>
      </div>

      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-line bg-white p-10 text-center transition hover:border-primary dark:border-bg/20 dark:bg-ink/30"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-primary opacity-60" strokeWidth={1.5} />
        <p className="text-sm font-bold text-ink dark:text-bg">اسحب الملف هنا أو انقر للرفع</p>
        <p className="mt-1 text-xs text-ink-faint">CSV · XLSX — عمود ticker أو الرمز</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {scanning && (
        <p className="flex items-center justify-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارٍ فحص المحفظة...
        </p>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {report && (
        <>
          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
              <CredibilityGauge value={report.portfolio_safety_pct} label="نسبة أمان المحفظة" />
              <p className="mt-2 text-center text-xs text-ink-faint">
                {report.matched_companies} شركة مطابقة من {report.total_companies}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "آمنة", n: report.safe_count, c: RISK_COLOR.low },
                { label: "مراقبة", n: report.watch_count, c: RISK_COLOR.medium },
                { label: "خطر", n: report.danger_count, c: RISK_COLOR.high },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-white p-4 text-center dark:border-bg/10 dark:bg-ink/30">
                  <p className="text-2xl font-black" style={{ color: s.c }}>{s.n}</p>
                  <p className="text-xs text-ink-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {report.unmatched_tickers.length > 0 && (
            <p className="rounded-lg bg-accent/10 px-4 py-2 text-sm text-accent">
              رموز غير معروفة: {report.unmatched_tickers.join(" · ")}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
              تصدير التقرير (CSV)
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-white dark:border-bg/10 dark:bg-ink/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-faint dark:border-bg/10">
                  <th className="p-3 text-right">الشركة</th>
                  <th className="p-3 text-right">الدرجة</th>
                  <th className="p-3 text-right">المستوى</th>
                  <th className="p-3 text-right">أخطر إشارة</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.ticker} className="border-b border-line/60 hover:bg-bg-deep/30 dark:border-bg/10">
                    <td className="p-3">
                      <button type="button" onClick={() => onSelect?.(row.ticker)} className="font-bold text-primary hover:underline">
                        {row.name_ar}
                      </button>
                      <span className="mr-2 text-xs text-ink-faint">{row.ticker}</span>
                    </td>
                    <td className="p-3 font-black" style={{ color: RISK_COLOR[row.risk_level] }}>{row.risk_score}</td>
                    <td className="p-3 text-xs">{RISK_LABEL[row.risk_level]}</td>
                    <td className="p-3 text-xs">{row.top_flag_ar ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-ink-faint">مؤشر تحليلي يستدعي تدقيقًا إضافيًا، ليس اتهامًا.</p>
        </>
      )}
    </div>
  );
}
