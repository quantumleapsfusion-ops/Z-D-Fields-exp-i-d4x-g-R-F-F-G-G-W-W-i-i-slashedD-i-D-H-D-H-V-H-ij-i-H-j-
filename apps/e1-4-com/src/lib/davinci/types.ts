/**
 * Da Vinci conversation types. Mirrors @earth-one/da-vinci/Companion interface.
 */

/** One exchange out loud. */
export interface Turn {
  role: "you" | "davinci";
  text: string;
}

/** What Da Vinci does when spoken to: listens, remembers the conversation, speaks back. */
export interface Companion {
  reply(
    said: string,
    history: Turn[],
  ): Promise<{ reply: string; source: "llm" | "stub" }>;
}
