import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MOBILY_TIMELINE } from "../../api/dataSource";
import InteractiveTimeline from "../strategic/InteractiveTimeline";
import { RISK_COLOR } from "../../utils/risk";
import { ArrowRight, ClipboardList, Megaphone } from "../ui/icons";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Section from "../ui/Section";
import Button from "../ui/Button";
import Disclaimer from "../ui/Disclaimer";

type Props = {
  onBack: () => void;
  onSelectMobily: () => void;
};

const chartData = MOBILY_TIMELINE.filter((y) => y.year <= 2013).map((y) => ({
  year: String(y.year),
  score: y.risk_score,
  level: y.risk_level,
}));

const timelineSteps = MOBILY_TIMELINE.map((s) => ({
  ...s,
  is_alert: s.year === 2013,
  is_crisis: s.year === 2014,
}));

export default function MobilyCasePage({ onBack, onSelectMobily }: Props) {
  const [selectedYear, setSelectedYear] = useState(2013);
  return (
    <>
      <PageHeader
        title="دراسة حالة — Backtest"
        description="موبايلي 2014 — اختبار رجعي"
        breadcrumb={
          <Button variant="ghost" size="sm" onClick={onBack} className="px-0 text-primary">
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
            العودة للسوق
          </Button>
        }
      />

      <Card
        variant="accent"
        padding="lg"
        className="mb-8 overflow-hidden bg-gradient-to-bl from-accent/12 via-surface to-primary/8 dark:from-accent/15 dark:via-surface dark:to-primary/10"
      >
        <p className="text-sm font-bold text-primary">Case Study · Tadawul 2014</p>
        <h1 className="mt-2 page-title lg:text-4xl">موبايلي — قبل إعادة الإصدار</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft dark:text-bg/75">
          في <strong>نوفمبر 2014</strong> أعلنت اتحاد اتصالات (موبايلي) عن أخطاء محاسبية
          في إثبات الإيرادات وأعادت إصدار أرباح 2013 بخفض{" "}
          <strong className="text-accent">1.43 مليار ريال</strong>. نظام رقيب،
          عند إدخال القوائم <em>قبل</em> الاكتشاف، يعطي 2013 درجة{" "}
          <strong className="text-accent">57 — مرتفع</strong>.
        </p>
        <Button onClick={onSelectMobily} className="mt-6">
          عرض تفاصيل موبايلي 2013
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Button>
      </Card>

      <Section title="تطور درجة المخاطر (2011–2013)" className="mb-8">
        <Card variant="elevated" padding="lg">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v ?? 0}`, "الدرجة"]} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((e) => (
                  <Cell key={e.year} fill={RISK_COLOR[e.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <Section title="الخط الزمني التفاعلي" className="mb-8">
        <Card variant="elevated" padding="lg">
          <InteractiveTimeline
            steps={timelineSteps}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
          />
        </Card>
      </Section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="section-title">تفاصيل السنوات</h2>
          {MOBILY_TIMELINE.map((step, i) => (
            <Card key={step.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{
                    background:
                      step.year === 2014
                        ? RISK_COLOR.medium
                        : step.risk_score > 50
                          ? RISK_COLOR.high
                          : step.risk_score > 25
                            ? RISK_COLOR.medium
                            : RISK_COLOR.low,
                  }}
                >
                  {step.year === 2014 ? (
                    <Megaphone className="h-5 w-5" strokeWidth={2} />
                  ) : (
                    step.risk_score
                  )}
                </div>
                {i < MOBILY_TIMELINE.length - 1 && (
                  <div className="mt-2 min-h-4 w-0.5 flex-1 bg-line dark:bg-bg/20" />
                )}
              </div>
              <div>
                <p className="font-bold text-ink dark:text-bg">
                  {step.year}
                  {step.m_score != null && (
                    <span className="mr-2 text-sm font-normal text-ink-faint">
                      M-Score: {step.m_score.toFixed(2)}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-soft dark:text-bg/70">{step.note}</p>
                {step.flags > 0 && (
                  <p className="mt-2 text-xs font-bold text-accent">{step.flags} إشارات</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="section-title">المؤشرات الرئيسية (2013)</h2>
          {[
            { title: "DSRI", value: "1.41", desc: "الذمم نمت 56% · المبيعات 14%" },
            { title: "CFO/NI", value: "0.17", desc: "أرباح بلا تدفق نقدي" },
            { title: "TATA", value: "0.061", desc: "استحقاقات فوق العتبة" },
          ].map((m) => (
            <Card key={m.title} variant="accent" padding="sm" className="border-accent/25">
              <p className="text-xs font-bold text-accent">{m.title}</p>
              <p className="mt-1 text-3xl font-black text-ink dark:text-bg">{m.value}</p>
              <p className="mt-1 text-sm text-ink-soft">{m.desc}</p>
            </Card>
          ))}
          <Card padding="sm" className="bg-bg-deep/40 dark:bg-ink/40">
            <ClipboardList className="mb-2 h-5 w-5 text-primary" strokeWidth={2} />
            <p className="text-sm leading-relaxed text-ink-soft dark:text-bg/70">
              المصدر: إعلانات تداول 2014 + إعادة بناء القوائم من السرد العام (Reuters).
              الدرجة 57 تعني «يستحق مراجعة» — وليس اتهاماً بالاحتيال.
            </p>
            <Disclaimer className="mt-3" />
          </Card>
        </div>
      </section>
    </>
  );
}
