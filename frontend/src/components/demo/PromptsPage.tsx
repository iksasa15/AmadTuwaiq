import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import AuditorPrompts from "../strategic/AuditorPrompts";

export default function PromptsPage() {
  const meta = getPageMeta("prompts");
  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />
      <AuditorPrompts />
    </>
  );
}
