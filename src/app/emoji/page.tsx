import ModePage from "@/components/ModePage";
import EmojiGame from "@/components/EmojiGame";

export default function EmojiPage() {
  return (
    <ModePage modeId="emoji" icon="🐳" title="Emoji" subtitle="Decode the emoji story">
      <EmojiGame />
    </ModePage>
  );
}
