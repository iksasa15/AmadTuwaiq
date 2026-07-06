import PageHeader from "../ui/PageHeader";
import PageIntro from "../ui/PageIntro";
import { getPageMeta } from "../../config/navigation";
import PortfolioScanner from "../strategic/PortfolioScanner";

type Props = { onSelect: (ticker: string) => void };

export default function PortfolioPage({ onSelect }: Props) {
  const meta = getPageMeta("portfolio");
  return (
    <>
      <PageHeader title={meta.title} description={meta.description} />
      <PageIntro benefit={meta.benefit} contains={meta.contains} audience={meta.audience} />
      <PortfolioScanner onSelect={onSelect} />
    </>
  );
}
