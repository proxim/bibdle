import ModePage from "@/components/ModePage";
import VerseGame from "@/components/VerseGame";

export default function VersePage() {
  return (
    <ModePage modeId="verse" title="Verse" subtitle="Which book is this verse from?" showVersionToggle>
      <VerseGame />
    </ModePage>
  );
}
