import { NextResponse } from "next/server";
import { z } from "zod";

import {
  DRAW_SYSTEM_PROMPT,
  drawOpSchema,
  drawResponseSchema,
  stubDraw,
  summarizeOps,
  type DrawResponse,
} from "@/lib/davinci/ops";
import { AiBudgetError, completeForUser } from "@/lib/ai/budget";
import { getUserId } from "@/lib/auth/user";
import { extractJson, getLanguageModel } from "@/lib/llm";

export const runtime = "nodejs";

const bodySchema = z.object({
  transcript: z.string().max(20000),
  newText: z.string().max(4000),
  existing: z.array(drawOpSchema).max(400).default([]),
});

/**
 * Generative visual loop (early access): turns the latest words into incremental drawing ops.
 * Falls back to a keyword stub when no LLM key is configured or the model reply is unusable.
 */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { transcript, newText, existing } = parsed.data;

  if (!getLanguageModel("everyday"))
    return NextResponse.json(stubDraw(newText, existing));

  try {
    const completion = await completeForUser({
      userId,
      feature: "davinci.draw",
      tier: "everyday",
      request: {
        system: DRAW_SYSTEM_PROMPT,
        temperature: 0.6,
        prompt: `Transcript so far:\n${transcript}\n\nNewest words:\n${newText}\n\nAlready on canvas: ${summarizeOps(existing)}`,
      },
    });
    if (!completion) return NextResponse.json(stubDraw(newText, existing));
    const result = drawResponseSchema.parse(extractJson(completion.text));
    return NextResponse.json({ ...result, source: "llm" } satisfies DrawResponse);
  } catch (error) {
    if (error instanceof AiBudgetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[davinci] LLM draw failed, using stub", error);
    return NextResponse.json(stubDraw(newText, existing));
  }
}
