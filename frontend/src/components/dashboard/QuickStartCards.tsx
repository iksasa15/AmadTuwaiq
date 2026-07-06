import type { TabId } from "../../config/navigation";
import Card from "../ui/Card";
import { History, LayoutDashboard, Upload } from "../ui/icons";

type Props = {
  onNavigate: (tab: TabId) => void;
  onScrollToTable?: () => void;
};

const CARDS = [
  {
    title: "ابدئي المتابعة",
    desc: "جدول الشركات مرتب بالخطر",
    action: "work" as const,
    tab: "home" as TabId,
    icon: LayoutDashboard,
  },
  {
    title: "أثبتي النموذج",
    desc: "موبايلي — قبل الإعلان الرسمي",
    action: "navigate" as const,
    tab: "backtest" as TabId,
    icon: History,
  },
  {
    title: "افحصي محفظة",
    desc: "درع الإنماء — ملف Excel",
    action: "navigate" as const,
    tab: "portfolio" as TabId,
    icon: Upload,
  },
];

export default function QuickStartCards({ onNavigate, onScrollToTable }: Props) {
  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-3">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.title}
            type="button"
            onClick={() => {
              if (c.action === "work" && onScrollToTable) {
                onNavigate(c.tab);
                setTimeout(onScrollToTable, 100);
              } else {
                onNavigate(c.tab);
              }
            }}
            className="text-right"
          >
            <Card className="h-full transition hover:border-primary/40">
              <Icon className="mb-2 h-5 w-5 text-primary" strokeWidth={2} />
              <p className="font-bold text-ink dark:text-bg">{c.title}</p>
              <p className="mt-1 text-xs text-ink-faint">{c.desc}</p>
            </Card>
          </button>
        );
      })}
    </section>
  );
}
