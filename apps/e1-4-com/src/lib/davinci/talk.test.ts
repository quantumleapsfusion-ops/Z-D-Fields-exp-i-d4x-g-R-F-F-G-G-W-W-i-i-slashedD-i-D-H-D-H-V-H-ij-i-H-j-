import { describe, expect, it } from "vitest";

import {
  MAX_TURNS,
  TALK_SYSTEM_PROMPT,
  buildTalkPrompt,
  fallbackReply,
  talkBodySchema,
  toSpoken,
} from "./talk";

describe("Da Vinci talk", () => {
  it("never scripts an exit", () => {
    expect(TALK_SYSTEM_PROMPT).toMatch(/never end it/);
    expect(TALK_SYSTEM_PROMPT).toMatch(/joke back/);
  });

  it("carries the conversation into the prompt", () => {
    const prompt = buildTalkPrompt("right now", [
      { role: "you", text: "it's a ripple in time" },
      { role: "davinci", text: "a ripple from where?" },
    ]);
    expect(prompt).toContain("Them: it's a ripple in time");
    expect(prompt).toContain("You: a ripple from where?");
    expect(prompt).toContain("They just said:\nright now");
  });

  it("strips markdown so the voice doesn't read symbols", () => {
    expect(toSpoken("**Hello** there\n- one\n# two")).toBe("Hello there one two");
  });

  it("answers without a model and plays along with jokes", () => {
    expect(fallbackReply("I was joking")).toMatch(/got me/);
    expect(fallbackReply("a ripple in time")).toMatch(/^A ripple in time\./);
  });

  it("validates the body and caps history", () => {
    expect(talkBodySchema.safeParse({ said: "  " }).success).toBe(false);
    const history = Array.from({ length: MAX_TURNS + 1 }, () => ({
      role: "you",
      text: "x",
    }));
    expect(talkBodySchema.safeParse({ said: "hi", history }).success).toBe(false);
    expect(talkBodySchema.parse({ said: "hi" }).history).toEqual([]);
  });
});
