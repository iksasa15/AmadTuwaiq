import { DEMO_ALERTS } from "../../api/dataSource";
import { DEMO_ACTIVITY } from "../../data/demoExtras";
import FlagCard from "../company/FlagCard";
import PageHeader from "../ui/PageHeader";
import ActivityFeed from "../dashboard/ActivityFeed";
import Section from "../ui/Section";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { Activity, AlertCircle, AlertTriangle, ArrowRight, Flag } from "../ui/icons";

type Props = {
  onSelect: (ticker: string) => void;
};

export default function AlertsPage({ onSelect }: Props) {
  const critical = DEMO_ALERTS.filter((a) => a.severity === "critical");
  const warning = DEMO_ALERTS.filter((a) => a.severity === "warning");
  const info = DEMO_ALERTS.filter((a) => a.severity === "info");

  const stats = [
    { label: "إجمالي الإشارات", value: DEMO_ALERTS.length, color: "#F58E7C", icon: Flag },
    { label: "حرجة", value: critical.length, color: "#0C2341", icon: AlertCircle },
    { label: "تحذيرية", value: warning.length, color: "#C66E4E", icon: AlertTriangle },
    { label: "معلوماتية", value: info.length, color: "#8B84D7", icon: AlertTriangle },
  ];

  const renderGroup = (items: typeof DEMO_ALERTS) => (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((a) => (
        <div key={`${a.ticker}-${a.flag_id}`} className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => onSelect(a.ticker)} className="text-primary">
            {a.company_ar} · {a.year}
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Button>
          <FlagCard flag={a} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="مركز الإشارات الحمراء"
        description="إشارات رقيب النشطة — مرتبة حسب الخطورة"
      />

      <section className="mb-8 grid gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </section>

      <Section
        title="إشارات حرجة"
        icon={<AlertCircle className="h-5 w-5 text-accent" strokeWidth={2} />}
        className="mb-10"
      >
        {renderGroup(critical)}
      </Section>

      <Section
        title="إشارات تحذيرية"
        icon={<AlertTriangle className="h-5 w-5 text-primary" strokeWidth={2} />}
        className="mb-10"
      >
        {renderGroup(warning)}
      </Section>

      {info.length > 0 && (
        <Section
          title="إشارات معلوماتية"
          icon={<Activity className="h-5 w-5 text-secondary" strokeWidth={2} />}
          className="mb-10"
        >
          {renderGroup(info)}
        </Section>
      )}

      <ActivityFeed items={DEMO_ACTIVITY} onSelect={onSelect} className="mt-10" />
    </>
  );
}
