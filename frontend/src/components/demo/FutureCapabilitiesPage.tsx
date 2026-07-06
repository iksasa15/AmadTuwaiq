import { useState } from "react";
import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import Tabs from "../ui/Tabs";
import { getPageMeta } from "../../config/navigation";
import { FUTURE_SECTIONS, type FutureSectionId } from "../../data/strategicDemo";
import SentimentRadar from "../strategic/SentimentRadar";
import ForensicNetwork from "../strategic/ForensicNetwork";
import WhatIfSimulator from "../strategic/WhatIfSimulator";
import { GitBranch, Radar, SlidersHorizontal } from "../ui/icons";

const SECTION_ICONS = {
  sentiment: Radar,
  network: GitBranch,
  whatif: SlidersHorizontal,
} as const;

const TABS = FUTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.label,
  icon: SECTION_ICONS[s.id],
}));

type Props = { onSelect: (ticker: string) => void };

export default function FutureCapabilitiesPage({ onSelect }: Props) {
  const [section, setSection] = useState<FutureSectionId>("sentiment");
  const meta = getPageMeta("future");

  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />
      <Tabs tabs={TABS} active={section} onChange={setSection} className="mb-6" />
      {section === "sentiment" && <SentimentRadar onSelect={onSelect} />}
      {section === "network" && <ForensicNetwork onSelect={onSelect} />}
      {section === "whatif" && <WhatIfSimulator />}
    </>
  );
}
