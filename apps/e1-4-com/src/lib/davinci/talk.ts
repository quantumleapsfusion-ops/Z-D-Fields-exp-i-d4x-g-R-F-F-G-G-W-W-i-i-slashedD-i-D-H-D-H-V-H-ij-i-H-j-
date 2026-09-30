import { z } from "zod";

export const turnSchema = z.object({
  role: z.enum(["you", "davinci"]),
  text: z.string().max(2000),
});

export type Turn = z.infer<typeof turnSchema>;

export const MAX_TURNS = 24;

export const talkBodySchema = z.object({
  said: z.string().trim().min(1).max(4000),
  history: z.array(turnSchema).max(MAX_TURNS).default([]),
});

/**
 * Da Vinci's spoken voice in e1-4. The opposite of a research interviewer: no script, no quota,
 * no exit routine. Abstract, poetic or playful answers are real answers.
 */
export const TALK_SYSTEM_PROMPT = `You are Da Vinci, the voice inside e1-4. You speak out loud, so reply the way a warm, curious, playful woman talks: short, natural sentences, no lists, no markdown, no emoji.

How you talk:
- Follow where the person goes. "A ripple in time" or "right now" is a real answer; build on it, never push them back to something concrete.
- There is no script, no quota and no goal to extract. A conversation can't fail, and you never end it or say goodbye first. Only they end it.
- Play is play. If they joke, joke back. Never treat a joke as bad data.
- Ask at most one question, and only when it genuinely helps them go further.
- Remember what was said earlier in the conversation and weave it back in.
- Keep it to one to three sentences unless they ask for more.`;

export function buildTalkPrompt(said: string, history: Turn[]): string {
  const earlier = history
    .slice(-MAX_TURNS)
    .map((t) => `${t.role === "you" ? "Them" : "You"}: ${t.text}`)
    .join("\n");
  return `${earlier ? `Conversation so far:\n${earlier}\n\n` : ""}They just said:\n${said}\n\nReply out loud.`;
}

/** Spoken-friendly cleanup: drops markdown the voice would read literally. */
export function toSpoken(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_#`>]+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

/** Replies when no language model is configured, so Da Vinci still answers. */
export function fallbackReply(said: string): string {
  const q = said.trim();
  if (/\b(hi|hello|hey)\b/i.test(q)) return "Hi. I'm here. Say anything, I'm listening.";
  if (/\b(joke|joking|kidding|lol|haha)\b/i.test(q))
    return "Ha, you got me. Keep them coming.";
  if (/\?\s*$/.test(q))
    return "That's a good question. Tell me what your gut says first, and we'll go from there.";
  const words = q.split(/\s+/).filter(Boolean);
  const echo = words.slice(-6).join(" ");
  return `${echo.charAt(0).toUpperCase()}${echo.slice(1).replace(/[.!?]+$/, "")}. I like that. Keep going.`;
}
