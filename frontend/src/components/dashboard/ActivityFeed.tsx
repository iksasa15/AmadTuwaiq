import type { ActivityItem } from "../../data/demoExtras";
import { RISK_COLOR } from "../../utils/risk";
import { Activity } from "../ui/icons";
import Card from "../ui/Card";
import Section from "../ui/Section";

type Props = {
  items: ActivityItem[];
  onSelect?: (ticker: string) => void;
  className?: string;
};

export default function ActivityFeed({ items, onSelect, className = "" }: Props) {
  return (
    <Section
      title="آخر النشاط"
      icon={<Activity className="h-4 w-4 text-secondary" strokeWidth={2} />}
      className={className}
    >
      <Card padding="md">
        <ul className="space-y-2">
          {items.slice(0, 6).map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 border-b border-line/60 pb-2.5 last:border-0 dark:border-bg/10"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: RISK_COLOR[item.level] }}
              />
              {item.ticker && onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item.ticker!)}
                  className="flex-1 text-right text-sm text-ink-soft transition hover:text-primary dark:text-bg/75"
                >
                  {item.text}
                </button>
              ) : (
                <span className="flex-1 text-sm text-ink-soft dark:text-bg/75">{item.text}</span>
              )}
              <span className="shrink-0 text-xs text-ink-faint">{item.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
}
