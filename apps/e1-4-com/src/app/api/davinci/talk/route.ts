import { NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";
import { AiBudgetError, completeForUser } from "@/lib/ai/budget";
import { getUserId } from "@/lib/auth/user";
import {
  TALK_SYSTEM_PROMPT,
  buildTalkPrompt,
  fallbackReply,
  talkBodySchema,
  toSpoken,
} from "@/lib/davinci/talk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One spoken turn with Da Vinci: what was said in, what she says back out. */
async function handlePOST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = talkBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { said, history } = parsed.data;

  try {
    const completion = await completeForUser({
      userId,
      feature: "davinci.talk",
      tier: "everyday",
      request: {
        system: TALK_SYSTEM_PROMPT,
        prompt: buildTalkPrompt(said, history),
        temperature: 0.9,
        maxTokens: 300,
      },
    });
    const reply = completion ? toSpoken(completion.text) : "";
    return NextResponse.json({
      reply: reply || fallbackReply(said),
      source: reply ? "llm" : "fallback",
    });
  } catch (error) {
    if (error instanceof AiBudgetError) {
      return NextResponse.json(
        {
          reply: "Let's breathe for a second. Talk to me again in a moment.",
          source: "limit",
        },
        { status: error.status },
      );
    }
    console.error("[davinci] talk failed, using fallback", error);
    return NextResponse.json({ reply: fallbackReply(said), source: "fallback" });
  }
}

export const POST = withRuntimeEnv(handlePOST);
