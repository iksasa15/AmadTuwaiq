import { useState } from "react";
import PageHeader from "../ui/PageHeader";
import { STRATEGIC_SECTIONS, type StrategicSectionId } from "../../data/strategicDemo";
import SentimentRadar from "./SentimentRadar";
import ForensicNetwork from "./ForensicNetwork";
import WhatIfSimulator from "./WhatIfSimulator";
import TimeMachine from "./TimeMachine";
import AuditorPrompts from "./AuditorPrompts";
import PortfolioScanner from "./PortfolioScanner";
import Tabs from "../ui/Tabs";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import {
  GitBranch,
  History,
  MessageSquare,
  Radar,
  SlidersHorizontal,
  Upload,
} from "../ui/icons";

const SECTION_ICONS = {
  sentiment: Radar,
  network: GitBranch,
  whatif: SlidersHorizontal,
  timemachine: History,
  prompts: MessageSquare,
  portfolio: Upload,
} as const;

const TABS = STRATEGIC_SECTIONS.map((s) => ({
  id: s.id,
  label: s.label,
  icon: SECTION_ICONS[s.id],
}));

type Props = {
  onSelectCompany: (ticker: string) => void;
};

export default function StrategicHub({ onSelectCompany }: Props) {
  const [section, setSection] = useState<StrategicSectionId>("sentiment");
  const current = STRATEGIC_SECTIONS.find((s) => s.id === section)!;

  return (
    <>
      <PageHeader
        title="قدرات استراتيجية"
        description="مصرف الإنماء — عرض تفاعلي لإثبات القيمة"
      />

      <Card
        variant="accent"
        padding="lg"
        className="mb-6 bg-gradient-to-bl from-ink/5 via-surface to-primary/5 dark:from-ink/40 dark:via-surface dark:to-primary/10"
      >
        <h1 className="section-title text-2xl">مصفوفة القوة الاستراتيجية</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft dark:text-bg/75">
          ست قدرات لا توفرها أنظمة البنك التقليدية — عرض تفاعلي ببيانات ديمو لإثبات القيمة أمام الحكام.
        </p>
      </Card>

      <Tabs tabs={TABS} active={section} onChange={setSection} compact className="mb-6" />

      <div className="mb-4 flex items-center gap-2">
        <Badge>{current.badge}</Badge>
        <h2 className="section-title">{current.label}</h2>
      </div>

      {section === "sentiment" && <SentimentRadar onSelect={onSelectCompany} />}
      {section === "network" && <ForensicNetwork onSelect={onSelectCompany} />}
      {section === "whatif" && <WhatIfSimulator />}
      {section === "timemachine" && (
        <TimeMachine onSelectMobily={() => onSelectCompany("7020.SR")} />
      )}
      {section === "prompts" && <AuditorPrompts />}
      {section === "portfolio" && <PortfolioScanner onSelect={onSelectCompany} />}
    </>
  );
}
