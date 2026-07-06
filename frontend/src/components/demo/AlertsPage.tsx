import { DEMO_ALERTS } from "../../api/dataSource";
import FlagCard from "../company/FlagCard";
import Header from "../layout/Header";
import { RISK_COLOR } from "../../utils/risk";
import { Activity, AlertCircle, AlertTriangle, ArrowRight, Flag } from "../ui/icons";

type Props = {
  onSelect: (ticker: string) => void;
};

export default function AlertsPage({ onSelect }: Props) {
  const critical = DEMO_ALERTS.filter((a) => a.severity === "critical");
  const warning = DEMO_ALERTS.filter((a) => a.severity === "warning");

  return (
    <>
      <Header subtitle="مركز الإشارات الحمراء" />

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        {[
          { label: "إجمالي الإشارات", value: DEMO_ALERTS.length, color: "#F58E7C", icon: Flag },
          { label: "حرجة", value: critical.length, color: "#0C2341", icon: AlertCircle },
          { label: "تحذيرية", value: warning.length, color: "#C66E4E", icon: AlertTriangle },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 dark:border-bg/10 dark:bg-ink/30"
          >
            <s.icon className="h-8 w-8 opacity-40" style={{ color: s.color }} strokeWidth={1.5} />
            <div>
              <p className="text-xs text-ink-faint">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink dark:text-bg">
          <AlertCircle className="h-5 w-5 text-accent" strokeWidth={2} />
          إشارات حرجة
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {critical.map((a) => (
            <div key={`${a.ticker}-${a.flag_id}`} className="space-y-2">
              <button
                type="button"
                onClick={() => onSelect(a.ticker)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                {a.company_ar} · {a.year}
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              </button>
              <FlagCard flag={a} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink dark:text-bg">
          <AlertTriangle className="h-5 w-5 text-primary" strokeWidth={2} />
          إشارات تحذيرية
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {warning.map((a) => (
            <div key={`${a.ticker}-${a.flag_id}-w`} className="space-y-2">
              <button
                type="button"
                onClick={() => onSelect(a.ticker)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                {a.company_ar} · {a.year}
                <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
              </button>
              <FlagCard flag={a} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-line bg-white p-6 dark:border-bg/10 dark:bg-ink/30">
        <h2 className="mb-4 flex items-center gap-2 font-black text-ink dark:text-bg">
          <Activity className="h-5 w-5 text-secondary" strokeWidth={2} />
          آخر النشاط
        </h2>
        <ul className="space-y-3">
          {[
            { time: "منذ 2 د", text: "العثيم: ارتفعت الدرجة من 58 إلى 68", level: "high" as const },
            { time: "منذ 15 د", text: "موبايلي (backtest 2013): 4 إشارات حرجة", level: "high" as const },
            { time: "منذ 1 س", text: "تحديث تلقائي: 24 شركة مراقَبة", level: "low" as const },
            { time: "منذ 3 س", text: "6 بنوك مستبعدة — Beneish غير قابل للتطبيق", level: "low" as const },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 border-b border-line/60 pb-3 last:border-0 dark:border-bg/10"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: RISK_COLOR[item.level] }}
              />
              <span className="flex-1 text-sm text-ink-soft dark:text-bg/75">{item.text}</span>
              <span className="text-xs text-ink-faint">{item.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
