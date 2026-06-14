import ModePage from "@/components/ModePage";
import ClassicGame from "@/components/ClassicGame";

export default function ClassicPage() {
  return (
    <ModePage
      icon="📖"
      title="Classic"
      subtitle="Guess today's Bible character"
    >
      <ClassicGame />
    </ModePage>
  );
}
