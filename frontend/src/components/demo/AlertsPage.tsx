import { DEMO_ALERTS } from "../../api/dataSource";
import { DEMO_ACTIVITY } from "../../data/demoExtras";
import FlagCard from "../company/FlagCard";
import Header from "../layout/Header";
import ActivityFeed from "../dashboard/ActivityFeed";
import { Activity, AlertCircle, AlertTriangle, ArrowRight, Flag } from "../ui/icons";

type Props = {
  onSelect: (ticker: string) => void;
};

export default function AlertsPage({ onSelect }: Props) {
  const critical = DEMO_ALERTS.filter((a) => a.severity === "critical");
  const warning = DEMO_ALERTS.filter((a) => a.severity === "warning");
  const info = DEMO_ALERTS.filter((a) => a.severity === "info");

  return (
    <>
      <Header subtitle="مركز الإشارات الحمراء" />

      <section className="mb-8 grid gap-4 lg:grid-cols-4">
        {[
          { label: "إجمالي الإشارات", value: DEMO_ALERTS.length, color: "#F58E7C", icon: Flag },
          { label: "حرجة", value: critical.length, color: "#0C2341", icon: AlertCircle },
          { label: "تحذيرية", value: warning.length, color: "#C66E4E", icon: AlertTriangle },
          { label: "معلوماتية", value: info.length, color: "#8B84D7", icon: AlertTriangle },
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

      {info.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink dark:text-bg">
            <Activity className="h-5 w-5 text-secondary" strokeWidth={2} />
            إشارات معلوماتية
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {info.map((a) => (
              <div key={`${a.ticker}-${a.flag_id}-i`} className="space-y-2">
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
      )}

      <ActivityFeed items={DEMO_ACTIVITY} onSelect={onSelect} className="mt-10" />
    </>
  );
}
