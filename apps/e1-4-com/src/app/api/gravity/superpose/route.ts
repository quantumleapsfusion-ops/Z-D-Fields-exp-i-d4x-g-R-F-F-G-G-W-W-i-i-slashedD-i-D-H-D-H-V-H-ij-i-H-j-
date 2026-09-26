import { NextResponse } from "next/server";
import { z } from "zod";

import { AiBudgetError, completeForUser } from "@/lib/ai/budget";
import { getUserId } from "@/lib/auth/user";
import { flags } from "@/lib/flags";
import {
  SUPERPOSE_SYSTEM_PROMPT,
  resolve,
  stubSuperpose,
  superpositionSchema,
  type Superposition,
} from "@/lib/gravity/superposition";
import { extractJson, getLanguageModel } from "@/lib/llm";

export const runtime = "nodejs";

const bodySchema = z.object({ text: z.string().min(1).max(12000) });

/** EXPERIMENTAL: sample several interpretations of a dense idea (the "superposition"). */
export async function POST(request: Request) {
  if (!flags.gravityBoard)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { text } = parsed.data;

  // Heavy tier (claude-fable-5-1): Gravity Board is the one place that earns it.
  if (!getLanguageModel("heavy")) return NextResponse.json(stubSuperpose(text));

  try {
    const completion = await completeForUser({
      userId,
      feature: "gravity.superpose",
      tier: "heavy",
      request: { system: SUPERPOSE_SYSTEM_PROMPT, prompt: text, temperature: 1 },
    });
    if (!completion) return NextResponse.json(stubSuperpose(text));
    const { candidates } = superpositionSchema.parse(extractJson(completion.text));
    return NextResponse.json({
      candidates,
      source: "llm",
      resolvedIndex: resolve(text, candidates),
    } satisfies Superposition);
  } catch (error) {
    if (error instanceof AiBudgetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[gravity] LLM superposition failed, using stub", error);
    return NextResponse.json(stubSuperpose(text));
  }
}
