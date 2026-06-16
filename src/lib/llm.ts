/**
 * Provider-abstracted chat completion.
 *
 * Default provider: Google Gemini Flash, called via plain `fetch` against the
 * REST API (no SDK / npm dependency). Adding another provider (Claude,
 * OpenAI, ...) is a small, localised change: implement a `ChatProvider` and
 * register it in `PROVIDERS`, then point `getProvider()` at it.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  system: string;
  messages: ChatMessage[];
}

/** Thrown when a provider is selected/configured but the upstream call fails. */
export class LlmError extends Error {}

/** Returned when no provider is configured (e.g. missing API key). */
export class LlmNotConfiguredError extends Error {}

interface ChatProvider {
  /** Whether this provider has the env config it needs to run. */
  isConfigured(): boolean;
  /** Perform the chat completion. Throws LlmError on upstream failure. */
  chat(req: ChatRequest): Promise<string>;
}

/* ─────────────────────────── Google Gemini ─────────────────────────── */

const geminiProvider: ChatProvider = {
  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async chat({ system, messages }: ChatRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new LlmNotConfiguredError("GEMINI_API_KEY is not set");
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    // Gemini uses role "model" for the assistant; system text goes in
    // systemInstruction (supported by the v1beta generateContent endpoint).
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      });
    } catch (err) {
      throw new LlmError(
        `Failed to reach Gemini: ${err instanceof Error ? err.message : "network error"}`
      );
    }

    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
      throw new LlmError(`Gemini returned ${res.status}: ${detail.slice(0, 300)}`);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new LlmError("Gemini returned a non-JSON response");
    }

    const text = extractGeminiText(data);
    if (!text) throw new LlmError("Gemini returned an empty response");
    return text;
  },
};

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

function extractGeminiText(data: unknown): string {
  const parts = (data as GeminiResponse)?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => p?.text ?? "")
    .join("")
    .trim();
}

/* ─────────────────────────── Provider registry ─────────────────────────── */

const PROVIDERS = {
  gemini: geminiProvider,
  // claude: claudeProvider,  // <- add here later (also implement ChatProvider)
} as const;

type ProviderId = keyof typeof PROVIDERS;

/** Active provider. Swap the default here (or read process.env.LLM_PROVIDER). */
function getProvider(): ChatProvider {
  const id = (process.env.LLM_PROVIDER as ProviderId) || "gemini";
  return PROVIDERS[id] ?? geminiProvider;
}

/** True if the active provider is configured to make real calls. */
export function isChatConfigured(): boolean {
  return getProvider().isConfigured();
}

/** Provider-agnostic chat entry point used by the API route. */
export async function chat(req: ChatRequest): Promise<string> {
  return getProvider().chat(req);
}
