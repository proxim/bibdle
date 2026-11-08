import ModePage from "@/components/ModePage";
import QuoteGame from "@/components/QuoteGame";

export default function QuotePage() {
  return (
    <ModePage modeId="quote" title="Quote" subtitle="Who said it?" showVersionToggle>
      <QuoteGame />
    </ModePage>
  );
}
