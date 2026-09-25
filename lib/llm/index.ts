import { env } from '@/lib/env';

import { AnthropicModel } from './anthropic';
import { OpenAIModel } from './openai';
import type { LanguageModel } from './types';

export type { CompletionRequest, LanguageModel } from './types';

/**
 * Picks the LLM. `LLM_PROVIDER` forces a choice; otherwise Anthropic (Claude) then OpenAI (GPT-4o).
 * Returns `null` when no key is configured — callers must render a stub instead of failing.
 */
export function getLanguageModel(): LanguageModel | null {
  const { provider, anthropicKey, anthropicModel, openaiKey, openaiModel } = env.llm;
  if (provider === 'none') return null;
  if ((provider === 'anthropic' || !provider) && anthropicKey) {
    return new AnthropicModel(anthropicKey, anthropicModel);
  }
  if ((provider === 'openai' || !provider) && openaiKey) {
    return new OpenAIModel(openaiKey, openaiModel);
  }
  return null;
}

/** Extracts the first JSON object/array from a model reply (tolerates prose or code fences). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error('No JSON found in model reply');
  const open = candidate[start];
  const close = open === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(close);
  return JSON.parse(candidate.slice(start, end + 1));
}
