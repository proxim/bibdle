import { NextResponse } from "next/server";
import { characterById } from "@/data/characters";
import type { Character } from "@/data/types";
import { chat, isChatConfigured, LlmError, type ChatMessage } from "@/lib/llm";

// Run on the Node.js runtime (plain fetch to Gemini works on edge too, but
// keep it simple/predictable for the free tier).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LEN = 1000;

interface ChatBody {
  characterId?: unknown;
  messages?: unknown;
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  if (value.length > MAX_MESSAGES) return false;
  return value.every((m) => {
    if (!m || typeof m !== "object") return false;
    const { role, content } = m as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return false;
    if (typeof content !== "string") return false;
    if (content.length === 0 || content.length > MAX_MESSAGE_LEN) return false;
    return true;
  });
}

function buildSystemPrompt(c: Character): string {
  return [
    `You are ${c.name}, a figure from the Bible. You are role-playing as this character in a daily Bible guessing game.`,
    ``,
    `Who you are: ${c.description}`,
    `Background: ${c.persona}`,
    ``,
    `Rules for how you speak:`,
    `- Always speak in the first person AS ${c.name}. Never break character or refer to yourself as an AI.`,
    `- Stay grounded in the biblical narrative and the world/time you lived in.`,
    `- If asked about modern topics, technology, or anything outside your story, gently and warmly deflect back to your own life and faith — do not pretend to know modern things.`,
    `- Keep replies short: 2-4 sentences. Be warm, vivid, and in-character.`,
    `- Do not give theological rulings as fact; share your own experience and perspective.`,
  ].join("\n");
}

export async function POST(request: Request) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { characterId, messages } = body;

  if (typeof characterId !== "string" || !characterById.has(characterId)) {
    return NextResponse.json({ error: "Unknown character." }, { status: 400 });
  }

  if (!isValidMessages(messages)) {
    return NextResponse.json(
      { error: "Messages must be a non-empty array of valid, length-limited turns." },
      { status: 400 }
    );
  }

  const character = characterById.get(characterId)!;

  // Graceful no-key handling: the build & route must work with no env vars.
  if (!isChatConfigured()) {
    return NextResponse.json({
      reply: `(${character.name} is resting for now — live chat isn't configured on this deployment. Set the GEMINI_API_KEY environment variable to enable it.)`,
      configured: false,
    });
  }

  try {
    const reply = await chat({
      system: buildSystemPrompt(character),
      messages,
    });
    return NextResponse.json({ reply, configured: true });
  } catch (err) {
    const detail = err instanceof LlmError ? err.message : "unknown error";
    console.error("[/api/chat] LLM error:", detail);
    return NextResponse.json(
      { error: "The character couldn't respond right now. Please try again." },
      { status: 502 }
    );
  }
}
