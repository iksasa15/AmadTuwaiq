import { DEMO_MARKET_STATS } from "../../data/demoExtras";
import { AlertCircle, Building2, Flag, RefreshCw } from "../ui/icons";

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
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 dark:border-bg/10 dark:bg-ink/30"
        >
          <item.icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
          <div>
            <p className="text-[10px] text-ink-faint">{item.label}</p>
            <p className="text-lg font-black text-ink dark:text-bg">{item.value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
