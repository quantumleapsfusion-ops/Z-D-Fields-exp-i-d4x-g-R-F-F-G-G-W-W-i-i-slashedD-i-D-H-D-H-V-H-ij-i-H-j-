import { vi } from "vitest";

const BASE_ENV: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  DATABASE_URL: "postgresql://test",
  DIRECT_URL: "postgresql://test",
};

const OPTIONAL_KEYS = [
  "STT_PROVIDER",
  "OPENAI_API_KEY",
  "OPENAI_WHISPER_MODEL",
  "DEEPGRAM_API_KEY",
  "DEEPGRAM_MODEL",
  "LLM_PROVIDER",
  "ANTHROPIC_API_KEY",
  "LLM_MODEL_EVERYDAY",
  "LLM_MODEL_HEAVY",
  "OPENAI_MODEL",
  "AI_RATE_LIMIT_PER_MINUTE",
  "AI_RATE_LIMIT_PER_DAY",
  "AI_MONTHLY_SPEND_CAP_USD",
  "AI_MODEL_PRICES_JSON",
  "AI_ALERT_WEBHOOK_URL",
  "AI_ALERT_EMAIL_TO",
  "RESEND_API_KEY",
  "AI_ALERT_EMAIL_FROM",
] as const;

/**
 * `src/lib/env.ts` snapshots `process.env` at import time, so every test that
 * varies configuration must stub the env *and* reset the module registry
 * before importing the module under test.
 */
export function stubEnv(overrides: Record<string, string | undefined> = {}) {
  for (const key of OPTIONAL_KEYS) vi.stubEnv(key, "");
  for (const [key, value] of Object.entries({ ...BASE_ENV, ...overrides })) {
    vi.stubEnv(key, value ?? "");
  }
  vi.resetModules();
}
