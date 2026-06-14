import ModePage from "@/components/ModePage";
import VerseGame from "@/components/VerseGame";

export default function VersePage() {
  return (
    <ModePage icon="📜" title="Verse" subtitle="Which book is this verse from?">
      <VerseGame />
    </ModePage>
  );
}
