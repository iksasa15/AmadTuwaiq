import { useMemo, useState } from "react";
import { DEMO_WHATIF_BASE } from "../../data/strategicDemo";
import { computeWhatIfScore } from "../../utils/whatIfScore";
import { RISK_COLOR, RISK_LABEL } from "../../utils/risk";
import { SlidersHorizontal } from "../ui/icons";
import Card from "../ui/Card";
import Button from "../ui/Button";

const TICKERS = Object.keys(DEMO_WHATIF_BASE);

export default function WhatIfSimulator() {
  const [ticker, setTicker] = useState("4001.SR");
  const [cash, setCash] = useState(0);
  const [receivables, setReceivables] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [cfo, setCfo] = useState(0);

  const base = DEMO_WHATIF_BASE[ticker];

  const result = useMemo(
    () =>
      computeWhatIfScore(base.base_score, base.breakdown, {
        cash_change_pct: cash,
        receivables_change_pct: receivables,
        revenue_change_pct: revenue,
        cfo_change_pct: cfo,
      }),
    [base, cash, receivables, revenue, cfo],
  );

  const sliders = [
    { key: "cash", label: "تغيّر الكاش (%)", value: cash, set: setCash, min: -30, max: 10 },
    { key: "recv", label: "تأخر تحصيل الذمم (%)", value: receivables, set: setReceivables, min: 0, max: 40 },
    { key: "rev", label: "تغيّر الإيرادات (%)", value: revenue, set: setRevenue, min: -20, max: 10 },
    { key: "cfo", label: "تغيّر CFO (%)", value: cfo, set: setCfo, min: -30, max: 10 },
  ];

  return (
    <div className="space-y-6">
      <Card variant="accent" padding="sm">
        <p className="flex items-center gap-2 text-sm font-bold text-accent">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
          غير موجود على واجهات البنك — اختبار ضغط تفاعلي
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          اضبط افتراضيات الربع القادم وشاهد إعادة حساب درجة التلاعب فوراً.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {TICKERS.map((t) => (
          <Button
            key={t}
            variant={ticker === t ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setTicker(t);
              setCash(0);
              setReceivables(0);
              setRevenue(0);
              setCfo(0);
            }}
            className="rounded-full"
          >
            {DEMO_WHATIF_BASE[t].company_ar}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          {sliders.map((s) => (
            <div key={s.key} className="mb-5 last:mb-0">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-ink-soft">{s.label}</span>
                <span className="font-bold text-primary">{s.value > 0 ? "+" : ""}{s.value}%</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCash(-15);
              setReceivables(20);
              setRevenue(0);
              setCfo(-10);
            }}
            className="text-primary"
          >
            سيناريو العثيم: كاش -15% + ذمم +20%
          </Button>
        </Card>

        <Card className="flex flex-col items-center justify-center" padding="lg">
          <p className="label-caps">الدرجة الأساسية</p>
          <p className="text-4xl font-black text-ink-faint line-through">{base.base_score}</p>
          <p className="mt-4 label-caps">بعد السيناريو</p>
          <p className="text-6xl font-black" style={{ color: RISK_COLOR[result.level] }}>
            {result.score}
          </p>
          <p className="mt-2 text-sm font-bold" style={{ color: RISK_COLOR[result.level] }}>
            {RISK_LABEL[result.level]}
            {result.delta !== 0 && (
              <span className="mr-2 text-accent">
                ({result.delta > 0 ? "+" : ""}{result.delta})
              </span>
            )}
          </p>
          <div className="mt-6 grid w-full grid-cols-2 gap-2 text-xs">
            {[
              { l: "M-Score", v: result.breakdown.m },
              { l: "IF", v: result.breakdown.if_ },
              { l: "XGB", v: result.breakdown.xgb },
              { l: "Rules", v: result.breakdown.rules },
            ].map((b) => (
              <div key={b.l} className="rounded-[var(--radius-control)] bg-bg-deep/50 p-2 text-center dark:bg-ink/40">
                <p className="text-ink-faint">{b.l}</p>
                <p className="font-bold">{b.v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
