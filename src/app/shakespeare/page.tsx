import ModePage from "@/components/ModePage";
import ShakespeareGame from "@/components/ShakespeareGame";

export default function ShakespearePage() {
  return (
    <ModePage
      modeId="shakespeare"
      icon="🎭"
      title="Scripture or Shakespeare"
      subtitle="Bible verse, or the Bard? Call them all."
    >
      <ShakespeareGame />
    </ModePage>
  );
}
