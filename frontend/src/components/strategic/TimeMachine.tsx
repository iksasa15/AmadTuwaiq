import { useState } from "react";
import { MOBILY_TIMELINE } from "../../api/dataSource";
import { ALMAJIL_TIMELINE } from "../../data/strategicDemo";
import { RISK_COLOR } from "../../utils/risk";
import InteractiveTimeline from "./InteractiveTimeline";
import { History } from "../ui/icons";

type Props = {
  onSelectMobily?: () => void;
};

export default function TimeMachine({ onSelectMobily }: Props) {
  const [caseId, setCaseId] = useState<"mobily" | "almajil">("mobily");
  const mobilySteps = MOBILY_TIMELINE.map((s) => ({
    ...s,
    is_alert: s.year === 2013,
    is_crisis: s.year === 2014,
  }));

  const steps = caseId === "mobily" ? mobilySteps : ALMAJIL_TIMELINE.timeline;
  const defaultYear = caseId === "mobily" ? 2013 : 2015;
  const [year, setYear] = useState(defaultYear);

  const switchCase = (id: "mobily" | "almajil") => {
    setCaseId(id);
    setYear(id === "mobily" ? 2013 : 2015);
  };

  const meta = caseId === "mobily"
    ? { company: "موبايلي", ticker: "7020.SR", months: 11, peak: 57, crisis: "نوفمبر 2014 — خفض 1.43B" }
    : { company: ALMAJIL_TIMELINE.company_ar, ticker: ALMAJIL_TIMELINE.ticker, months: ALMAJIL_TIMELINE.months_before, peak: ALMAJIL_TIMELINE.peak_score, crisis: ALMAJIL_TIMELINE.write_down_ar ?? "2016" };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-secondary">
          <History className="h-4 w-4" strokeWidth={2} />
          إثبات النموذج — آلة الزمن الرقابية
        </p>
        <p className="mt-2 text-sm text-ink-soft dark:text-bg/75">
          أزمات حقيقية سعودية — رقيب كان سيعطي إنذاراً قبل الكشف الرسمي.
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { id: "mobily" as const, label: "موبايلي 2014" },
          { id: "almajil" as const, label: "المعجل 2016" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => switchCase(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              caseId === c.id ? "bg-ink text-bg dark:bg-primary" : "border border-line bg-white dark:bg-ink/30"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "درجة الذروة", value: meta.peak, color: RISK_COLOR.high },
          { label: "أشهر قبل الكشف", value: meta.months, color: "#8B84D7" },
          { label: "الكشف الرسمي", value: meta.crisis, color: "#C66E4E", small: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-white p-4 text-center dark:border-bg/10 dark:bg-ink/30">
            <p className="text-xs text-ink-faint">{s.label}</p>
            <p className={`font-black ${s.small ? "text-sm" : "text-3xl"}`} style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <InteractiveTimeline steps={steps} selectedYear={year} onSelectYear={setYear} />

      {caseId === "mobily" && onSelectMobily && (
        <button
          type="button"
          onClick={onSelectMobily}
          className="text-sm font-bold text-primary hover:underline"
        >
          عرض تفاصيل موبايلي 2013 ←
        </button>
      )}
    </div>
  );
}
