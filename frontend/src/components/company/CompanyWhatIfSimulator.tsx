import { useDeferredValue, useEffect, useState } from "react";
import { api, type SimulationResult } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";
import ScoreRing from "./ScoreRing";
import { RefreshCw, SlidersHorizontal } from "../ui/icons";

const SLIDERS = [
  { key: "revenue_delta_pct" as const, label: "التغير في الإيرادات", min: -50, max: 50 },
  { key: "receivables_delta_pct" as const, label: "التغير في الذمم المدينة", min: -50, max: 100 },
  { key: "cogs_delta_pct" as const, label: "التغير في تكلفة المبيعات", min: -50, max: 50 },
  { key: "cfo_delta_pct" as const, label: "التغير في التدفق النقدي التشغيلي", min: -50, max: 50 },
  { key: "depreciation_delta_pct" as const, label: "التغير في الإهلاك", min: -50, max: 50 },
];

type Props = { ticker: string };

const DEFAULTS = {
  revenue_delta_pct: 0,
  receivables_delta_pct: 0,
  cogs_delta_pct: 0,
  cfo_delta_pct: 0,
  depreciation_delta_pct: 0,
};

export default function CompanyWhatIfSimulator({ ticker }: Props) {
  const [values, setValues] = useState(DEFAULTS);
  const deferred = useDeferredValue(values);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      api
        .simulate({ ticker, ...deferred })
        .then((r) => {
          if (!cancelled) setResult(r);
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ticker, deferred]);

  const reset = () => setValues(DEFAULTS);

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm font-bold text-ink dark:text-bg">
        <SlidersHorizontal className="h-4 w-4 text-primary" strokeWidth={2} />
        محاكاة ماذا لو؟
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-ink-soft">{s.label}</span>
                <span className="font-bold text-primary">
                  {values[s.key] > 0 ? "+" : ""}{values[s.key]}%
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={values[s.key]}
                onChange={(e) => setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            إعادة تعيين
          </button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
          {error && <p className="mb-4 text-sm text-accent">{error}</p>}
          {result && (
            <>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-ink-faint">الأصلية</p>
                  <ScoreRing score={result.original_score} level={result.original_level} size="sm" />
                </div>
                <p className="text-2xl font-black text-ink-faint">←</p>
                <div className="text-center">
                  <p className="text-xs text-ink-faint">بعد المحاكاة</p>
                  <ScoreRing score={result.simulated_score} level={result.simulated_level} size="sm" />
                </div>
              </div>
              {result.score_delta !== 0 && (
                <p className="mt-3 text-sm font-bold" style={{ color: RISK_COLOR[result.simulated_level] }}>
                  {result.score_delta > 0 ? "+" : ""}{result.score_delta} نقطة
                </p>
              )}
              {loading && <p className="mt-2 text-xs text-ink-faint">جارٍ الحساب...</p>}
            </>
          )}
        </div>
      </div>

      {result && (result.triggered_flags.length > 0 || result.removed_flags.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.triggered_flags.length > 0 && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="mb-2 text-xs font-bold text-accent">إشارات جديدة</p>
              <ul className="space-y-1 text-sm text-ink-soft">
                {result.triggered_flags.map((f) => (
                  <li key={f}>+ {f}</li>
                ))}
              </ul>
            </div>
          )}
          {result.removed_flags.length > 0 && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="mb-2 text-xs font-bold text-green-600">إشارات اختفت (تحسّن)</p>
              <ul className="space-y-1 text-sm text-ink-soft">
                {result.removed_flags.map((f) => (
                  <li key={f}>− {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-ink-faint">
        هذه محاكاة افتراضية لأغراض توضيحية، لا تمثل بيانات فعلية. مؤشر تحليلي يستدعي تدقيقًا إضافيًا، ليس اتهامًا.
      </p>
    </div>
  );
}
