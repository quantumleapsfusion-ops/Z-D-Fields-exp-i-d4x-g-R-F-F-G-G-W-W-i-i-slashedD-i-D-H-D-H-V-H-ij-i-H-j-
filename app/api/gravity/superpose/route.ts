import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserId } from '@/lib/auth';
import { flags } from '@/lib/flags';
import {
  SUPERPOSE_SYSTEM_PROMPT,
  resolve,
  stubSuperpose,
  superpositionSchema,
  type Superposition,
} from '@/lib/gravity/superposition';
import { extractJson, getLanguageModel } from '@/lib/llm';

export const runtime = 'nodejs';

const bodySchema = z.object({ text: z.string().min(1).max(12000) });

/** EXPERIMENTAL: sample several interpretations of a dense idea (the "superposition"). */
export async function POST(request: Request) {
  if (!flags.gravityBoard) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await getUserId()))
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { text } = parsed.data;

  const model = getLanguageModel();
  if (!model) return NextResponse.json(stubSuperpose(text));

  try {
    const reply = await model.complete({
      system: SUPERPOSE_SYSTEM_PROMPT,
      prompt: text,
      temperature: 1,
    });
    const { candidates } = superpositionSchema.parse(extractJson(reply));
    return NextResponse.json({
      candidates,
      source: 'llm',
      resolvedIndex: resolve(text, candidates),
    } satisfies Superposition);
  } catch (error) {
    console.error('[gravity] LLM superposition failed, using stub', error);
    return NextResponse.json(stubSuperpose(text));
  }
}
