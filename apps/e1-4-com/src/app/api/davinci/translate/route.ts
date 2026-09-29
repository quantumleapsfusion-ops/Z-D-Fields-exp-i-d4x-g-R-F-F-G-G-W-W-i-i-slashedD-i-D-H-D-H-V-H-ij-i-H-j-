import { NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";
import { z } from "zod";

import { AiBudgetError, completeForUser } from "@/lib/ai/budget";
import { getUserId } from "@/lib/auth/user";
import { DaVinciUnavailableError } from "@/lib/davinci/client";
import { getLanguageModel } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  text: z.string().min(1).max(8000),
  target: z.string().min(2).max(40),
});

/** Optional translate step behind the shared LLM interface. */
async function handlePOST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (!getLanguageModel("everyday")) {
    return NextResponse.json(
      {
        error: "Translation needs Da Vinci (DAVINCI_URL + DAVINCI_SECRET) or an LLM key.",
      },
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
    if (error instanceof DaVinciUnavailableError) throw error;
    console.error("[davinci] translate failed", error);
    return NextResponse.json({ error: "Translation failed." }, { status: 502 });
  }
}

export const POST = withRuntimeEnv(handlePOST);
