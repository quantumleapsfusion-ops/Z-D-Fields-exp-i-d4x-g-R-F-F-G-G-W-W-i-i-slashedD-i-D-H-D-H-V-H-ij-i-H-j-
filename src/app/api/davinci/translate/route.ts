import { NextResponse } from "next/server";
import { z } from "zod";

import { AiBudgetError, completeForUser } from "@/lib/ai/budget";
import { getUserId } from "@/lib/auth/user";
import { getLanguageModel } from "@/lib/llm";

export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().min(1).max(8000),
  target: z.string().min(2).max(40),
});

/** Optional translate step behind the shared LLM interface. */
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (!getLanguageModel("everyday")) {
    return NextResponse.json(
      { error: "Translation needs an LLM key (ANTHROPIC_API_KEY or OPENAI_API_KEY)." },
      { status: 503 },
    );
  }
  try {
    const completion = await completeForUser({
      userId,
      feature: "davinci.translate",
      tier: "everyday",
      request: {
        system:
          "Translate the user text faithfully. Keep line breaks. Reply with the translation only.",
        prompt: `Target language: ${parsed.data.target}\n\n${parsed.data.text}`,
        temperature: 0.2,
      },
    });
    if (!completion)
      return NextResponse.json({ error: "Translation unavailable." }, { status: 503 });
    return NextResponse.json({ text: completion.text.trim() });
  } catch (error) {
    if (error instanceof AiBudgetError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[davinci] translate failed", error);
    return NextResponse.json({ error: "Translation failed." }, { status: 502 });
  }
}
