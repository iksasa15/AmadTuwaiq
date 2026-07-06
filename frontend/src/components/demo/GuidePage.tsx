import type { TabId } from "../../config/navigation";
import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { ArrowLeft, History, LayoutDashboard, MessageSquare, Radar, Upload } from "../ui/icons";

type Props = {
  onNavigate: (tab: TabId) => void;
};

const WORK_PATH: { step: number; label: string; tab: TabId; icon: typeof LayoutDashboard }[] = [
  { step: 1, label: "لوحة التحكم — اختاري شركة عالية الخطر", tab: "home", icon: LayoutDashboard },
  { step: 2, label: "الإشارات — راجعي الإشارات الحرجة", tab: "alerts", icon: LayoutDashboard },
  { step: 3, label: "ملف الشركة — افتحي الشركة من الجدول", tab: "home", icon: LayoutDashboard },
  { step: 4, label: "أسئلة المدقق — جهّزي أسئلة المقابلة", tab: "prompts", icon: MessageSquare },
];

const DEMO_PATH: { step: number; label: string; tab: TabId; icon: typeof History }[] = [
  { step: 1, label: "إثبات النموذج — موبايلي قبل الكشف", tab: "backtest", icon: History },
  { step: 2, label: "درع الإنماء — افحصي محفظة البنك", tab: "portfolio", icon: Upload },
  { step: 3, label: "قدرات مستقبلية — اعرضي الرؤية", tab: "future", icon: Radar },
];

export default function GuidePage({ onNavigate }: Props) {
  const meta = getPageMeta("guide");

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="section-title mb-1">مسار العمل اليومي</h2>
          <p className="mb-4 text-xs text-ink-faint">~3 دقائق · لموظفة الائتمان والرقابة</p>
          <ol className="space-y-3">
            {WORK_PATH.map((item) => (
              <li key={item.step} className="flex items-start gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                  {item.step}
                </span>
                <div className="flex-1">
                  <p className="text-ink-soft dark:text-bg/75">{item.label}</p>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate(item.tab)} className="mt-1 px-0 text-primary">
                    انتقال
                    <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="section-title mb-1">مسار العرض</h2>
          <p className="mb-4 text-xs text-ink-faint">~5 دقائق · للحكام ومصرف الإنماء</p>
          <ol className="space-y-3">
            {DEMO_PATH.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.step} className="flex items-start gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-xs font-black text-secondary">
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-ink-soft dark:text-bg/75">
                      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      {item.label}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate(item.tab)} className="mt-1 px-0 text-primary">
                      انتقال
                      <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    </>
  );
}
