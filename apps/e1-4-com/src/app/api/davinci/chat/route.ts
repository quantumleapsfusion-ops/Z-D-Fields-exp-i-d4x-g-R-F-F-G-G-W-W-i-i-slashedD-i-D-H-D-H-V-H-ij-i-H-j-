import { getDaVinci } from "@/lib/davinci/client";
import {
  TALK_SYSTEM_PROMPT,
  buildTalkPrompt,
  fallbackReply,
  toSpoken,
  type Turn,
} from "@/lib/davinci/talk";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  said: z.string().min(1).max(4000),
  history: z.array(z.object({ role: z.enum(["you", "davinci"]), text: z.string() })).default([]),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { said, history } = requestSchema.parse(body);

    const davinci = getDaVinci();
    let reply: string;

    if (davinci) {
      try {
        const prompt = buildTalkPrompt(said, history as Turn[]);
        const completion = await davinci.complete("everyday", {
          system: TALK_SYSTEM_PROMPT,
          prompt,
        });
        reply = toSpoken(completion.text);
      } catch (error) {
        console.error("Da Vinci error:", error);
        reply = fallbackReply(said);
      }
    } else {
      // No Da Vinci configured, use fallback
      reply = fallbackReply(said);
    }

    return Response.json({ reply, source: davinci ? "llm" : "stub" });
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 400 },
    );
  }
}
