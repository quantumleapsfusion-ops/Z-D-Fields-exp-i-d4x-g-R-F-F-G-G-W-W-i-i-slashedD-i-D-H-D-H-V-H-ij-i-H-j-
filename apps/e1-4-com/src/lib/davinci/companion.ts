import type { Companion, Turn } from "da-vinci";

/**
 * Client-side Companion that calls the /api/davinci/chat endpoint.
 * Implements the Companion interface for voice conversations with Da Vinci.
 */
export class CompanionClient implements Companion {
  async reply(said: string, history: Turn[]): Promise<{ reply: string; source: "llm" | "stub" }> {
    try {
      const response = await fetch("/api/davinci/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ said, history }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Companion error:", error);
      throw error;
    }
  }
}
