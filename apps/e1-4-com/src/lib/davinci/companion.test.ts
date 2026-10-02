import { describe, expect, it, vi } from "vitest";

import { CompanionClient } from "./companion";
import type { Turn } from "./types";

describe("CompanionClient", () => {
  const client = new CompanionClient();

  it("sends message to API and returns reply", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "Hello there!",
        source: "llm" as const,
      }),
    });

    const result = await client.reply("Hi", []);

    expect(result).toEqual({
      reply: "Hello there!",
      source: "llm",
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/davinci/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ said: "Hi", history: [] }),
    });
  });

  it("includes conversation history in request", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: "That sounds great!",
        source: "stub" as const,
      }),
    });

    const history: Turn[] = [
      { role: "you", text: "I love music" },
      { role: "davinci", text: "Music is wonderful." },
    ];

    await client.reply("Tell me more", history);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/davinci/chat",
      expect.objectContaining({
        body: JSON.stringify({
          said: "Tell me more",
          history,
        }),
      }),
    );
  });

  it("throws on API error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    await expect(client.reply("Hi", [])).rejects.toThrow("API error");
  });

  it("throws on network error", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network failed"));

    await expect(client.reply("Hi", [])).rejects.toThrow();
  });
});
