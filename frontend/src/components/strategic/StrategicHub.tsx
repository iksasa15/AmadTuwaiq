import { useState } from "react";
import Header from "../layout/Header";
import { STRATEGIC_SECTIONS, type StrategicSectionId } from "../../data/strategicDemo";
import SentimentRadar from "./SentimentRadar";
import ForensicNetwork from "./ForensicNetwork";
import WhatIfSimulator from "./WhatIfSimulator";
import TimeMachine from "./TimeMachine";
import AuditorPrompts from "./AuditorPrompts";
import PortfolioScanner from "./PortfolioScanner";
import {
  GitBranch,
  History,
  MessageSquare,
  Radar,
  SlidersHorizontal,
  Upload,
} from "../ui/icons";

const SECTION_ICONS: Record<StrategicSectionId, typeof Radar> = {
  sentiment: Radar,
  network: GitBranch,
  whatif: SlidersHorizontal,
  timemachine: History,
  prompts: MessageSquare,
  portfolio: Upload,
};

type Props = {
  onSelectCompany: (ticker: string) => void;
};

export default function StrategicHub({ onSelectCompany }: Props) {
  const [section, setSection] = useState<StrategicSectionId>("sentiment");
  const current = STRATEGIC_SECTIONS.find((s) => s.id === section)!;

  return (
    <>
      <Header subtitle="قدرات استراتيجية — مصرف الإنماء" />

      <section className="mb-6 rounded-xl border border-line bg-gradient-to-bl from-ink/5 via-white to-primary/5 p-6 dark:border-bg/10 dark:from-ink/40 dark:via-ink/30 dark:to-primary/10">
        <h1 className="text-2xl font-black text-ink dark:text-bg">مصفوفة القوة الاستراتيجية</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft dark:text-bg/75">
          ست قدرات لا توفرها أنظمة البنك التقليدية — عرض تفاعلي ببيانات ديمو لإثبات القيمة أمام الحكام.
        </p>
      </section>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1 dark:border-bg/10 dark:bg-ink/30">
        {STRATEGIC_SECTIONS.map((s) => {
          const Icon = SECTION_ICONS[s.id];
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-bold transition lg:px-3 ${
                active ? "bg-ink text-bg dark:bg-primary" : "text-ink-soft hover:bg-bg-deep/50 dark:text-bg/70"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent">
          {current.badge}
        </span>
        <h2 className="font-black text-ink dark:text-bg">{current.label}</h2>
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
