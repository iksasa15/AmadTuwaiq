import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import TimeMachine from "../strategic/TimeMachine";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { ArrowRight } from "../ui/icons";

type Props = {
  onSelectMobily: () => void;
};

export default function BacktestPage({ onSelectMobily }: Props) {
  const meta = getPageMeta("backtest");
  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />
      <TimeMachine onSelectMobily={onSelectMobily} />
      <Card variant="accent" padding="md" className="mt-6">
        <p className="text-sm font-bold text-ink dark:text-bg">دراسة حالة موبايلي الكاملة</p>
        <p className="mt-1 text-sm text-ink-soft dark:text-bg/75">
          اضغطي على موبايلي في الجدول أو من هنا لعرض التفاصيل الكاملة لـ 2013 قبل إعادة الإصدار.
        </p>
        <Button onClick={onSelectMobily} className="mt-4">
          فتح دراسة موبايلي
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Button>
      </Card>
    </>
  );
}
