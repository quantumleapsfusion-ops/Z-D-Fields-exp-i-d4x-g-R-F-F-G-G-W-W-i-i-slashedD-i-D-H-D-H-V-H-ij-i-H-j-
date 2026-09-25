function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function readNumber(name: string, fallback: number): number {
  const raw = read(name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Safe for the browser. Inlined at build time by Next.js. */
export const publicEnv = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Server only. Never import from a client component. */
export function serverEnv() {
  return {
    supabaseServiceRoleKey: required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  };
}

/**
 * Optional server-side capabilities (paid APIs). Missing keys disable a
 * capability instead of crashing the process.
 */
export const env = {
  stt: {
    provider: read("STT_PROVIDER") as "whisper" | "deepgram" | "none" | undefined,
    openaiKey: read("OPENAI_API_KEY"),
    whisperModel: read("OPENAI_WHISPER_MODEL") ?? "whisper-1",
    deepgramKey: read("DEEPGRAM_API_KEY"),
    deepgramModel: read("DEEPGRAM_MODEL") ?? "nova-2",
  },

  llm: {
    provider: read("LLM_PROVIDER") as "anthropic" | "openai" | "none" | undefined,
    anthropicKey: read("ANTHROPIC_API_KEY"),
    /** Everyday Da Vinci work: summaries, labels, translation. */
    everydayModel: read("LLM_MODEL_EVERYDAY") ?? "claude-sonnet-5",
    /** Gravity Board superposition + heavy chalkboard breakdowns only. */
    heavyModel: read("LLM_MODEL_HEAVY") ?? "claude-fable-5-1",
    openaiKey: read("OPENAI_API_KEY"),
    openaiModel: read("OPENAI_MODEL") ?? "gpt-4o",
  },

  aiBudget: {
    /** Model calls a single user may make per rolling minute / day. */
    perUserPerMinute: readNumber("AI_RATE_LIMIT_PER_MINUTE", 10),
    perUserPerDay: readNumber("AI_RATE_LIMIT_PER_DAY", 200),
    /** Hard cap on estimated spend (USD) across all users per calendar month (UTC). */
    monthlyCapUsd: readNumber("AI_MONTHLY_SPEND_CAP_USD", 50),
    /** Where to send the 80 % / 100 % alerts: any webhook that accepts `{ text }` JSON. */
    alertWebhookUrl: read("AI_ALERT_WEBHOOK_URL"),
    /** Optional: Resend API key + recipient for e-mail alerts. */
    alertEmailTo: read("AI_ALERT_EMAIL_TO"),
    resendApiKey: read("RESEND_API_KEY"),
    alertEmailFrom: read("AI_ALERT_EMAIL_FROM") ?? "e1-4 <alerts@e1-4.com>",
  },
} as const;
