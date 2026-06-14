import ModePage from "@/components/ModePage";
import QuoteGame from "@/components/QuoteGame";

export default function QuotePage() {
  return (
    <ModePage icon="💬" title="Quote" subtitle="Who said it?">
      <QuoteGame />
    </ModePage>
  );
}
