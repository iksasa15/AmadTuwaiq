import { useDeferredValue, useEffect, useState } from "react";
import { api, type SimulationResult } from "../../api/client";
import { RISK_COLOR } from "../../utils/risk";
import ScoreRing from "./ScoreRing";
import { RefreshCw, SlidersHorizontal } from "../ui/icons";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Disclaimer from "../ui/Disclaimer";

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
      <h2 className="section-title flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-primary" strokeWidth={2} />
        محاكاة ماذا لو؟
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          {SLIDERS.map((s) => (
            <div key={s.key} className="mb-4 last:mb-0">
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
          <Button variant="ghost" size="sm" onClick={reset} className="mt-2 text-primary">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            إعادة تعيين
          </Button>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          {error && <p className="mb-4 text-sm text-accent">{error}</p>}
          {result && (
            <>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="label-caps">الأصلية</p>
                  <ScoreRing score={result.original_score} level={result.original_level} size="sm" />
                </div>
                <p className="text-2xl font-black text-ink-faint">←</p>
                <div className="text-center">
                  <p className="label-caps">بعد المحاكاة</p>
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
        </Card>
      </div>

      {result && (result.triggered_flags.length > 0 || result.removed_flags.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.triggered_flags.length > 0 && (
            <Card variant="accent" padding="sm" className="border-accent/30">
              <p className="mb-2 text-xs font-bold text-accent">إشارات جديدة</p>
              <ul className="space-y-1 text-sm text-ink-soft">
                {result.triggered_flags.map((f) => (
                  <li key={f}>+ {f}</li>
                ))}
              </ul>
            </Card>
          )}
          {result.removed_flags.length > 0 && (
            <Card padding="sm" className="border border-green-500/30 bg-green-500/5">
              <p className="mb-2 text-xs font-bold text-green-600">إشارات اختفت (تحسّن)</p>
              <ul className="space-y-1 text-sm text-ink-soft">
                {result.removed_flags.map((f) => (
                  <li key={f}>− {f}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Disclaimer>
        هذه محاكاة افتراضية لأغراض توضيحية، لا تمثل بيانات فعلية. مؤشر تحليلي يستدعي تدقيقًا إضافيًا، ليس اتهامًا.
      </Disclaimer>
    </div>
  );
}
