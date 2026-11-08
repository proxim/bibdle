import ModePage from "@/components/ModePage";
import ClassicGame from "@/components/ClassicGame";

export default function ClassicPage() {
  return (
    <ModePage
      modeId="classic"
      title="Classic"
      subtitle="Guess today's Bible character"
      wide
    >
      <ClassicGame />
    </ModePage>
  );
}
