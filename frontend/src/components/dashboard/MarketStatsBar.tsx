import { DEMO_MARKET_STATS } from "../../data/demoExtras";
import { AlertCircle, Building2, Flag, RefreshCw } from "../ui/icons";
import StatCard from "../ui/StatCard";

export default function MarketStatsBar() {
  const items = [
    { icon: Building2, label: "شركات مرصودة", value: String(DEMO_MARKET_STATS.companies_scored) },
    { icon: Flag, label: "إشارات نشطة", value: String(DEMO_MARKET_STATS.flags_active) },
    { icon: AlertCircle, label: "بنوك مستبعدة", value: String(DEMO_MARKET_STATS.banks_excluded) },
    { icon: RefreshCw, label: "آخر تحديث", value: DEMO_MARKET_STATS.last_refresh },
  ];

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} />
      ))}
    </section>
  );
}
