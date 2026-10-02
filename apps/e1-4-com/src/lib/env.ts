/** Thrown when a required variable is read at runtime and is blank. Routes map it to 503. */
export class MissingEnvError extends Error {
  readonly variable: string;

  constructor(variable: string) {
    super(`Missing required environment variable ${variable}`);
    this.name = "MissingEnvError";
    this.variable = variable;
  }
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") throw new MissingEnvError(name);
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

/**
 * Explicit `NEXT_PUBLIC_SITE_URL` wins; on Vercel, fall back to the production
 * domain or per-deployment URL.
 */
function resolveSiteUrl(): string {
  const explicit = read("NEXT_PUBLIC_SITE_URL");
  if (explicit) return explicit;
  const vercel =
    process.env.VERCEL_ENV === "production"
      ? read("VERCEL_PROJECT_PRODUCTION_URL")
      : (read("VERCEL_BRANCH_URL") ?? read("VERCEL_URL"));
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

/**
 * Safe for the browser. Inlined at build time by Next.js. Getters defer the
 * "missing variable" check to first use so importing this module never throws
 * (e.g. while `next build` collects page data with blank secrets).
 */
export const publicEnv = {
  get supabaseUrl(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get siteUrl(): string {
    return resolveSiteUrl();
  },
};

/**
 * Server only. Never import from a client component. Each value is checked when it is read, so
 * code that needs only the database does not demand the Supabase key (the local storage
 * provider runs with none).
 */
export function serverEnv() {
  return {
    get supabaseServiceRoleKey(): string {
      return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
    },
    get databaseUrl(): string {
      return required("DATABASE_URL", process.env.DATABASE_URL);
    },
  };
}

/**
 * Optional server-side capabilities (paid APIs). Missing keys disable a
 * capability instead of crashing the process.
 */
export const env = {
  /**
   * Where uploaded audio and avatars live. `supabase` (the default) needs the Supabase variables
   * above; `local` keeps them as files under `LOCAL_STORAGE_DIR` for working offline.
   */
  storage: {
    provider: (read("STORAGE_PROVIDER") ?? "supabase") as "supabase" | "local",
    localDir: read("LOCAL_STORAGE_DIR") ?? ".e14-storage",
  },

  /** Self-hosted Da Vinci gateway. When both are set it is preferred over every third-party key. */
  davinci: {
    url: read("DAVINCI_URL"),
    secret: read("DAVINCI_SECRET"),
  },

  /**
   * Liveness for voice sign-in (the person must speak back digits the device just said).
   * `required` fails sign-in when it cannot be checked; `off` skips it; unset checks it whenever a
   * speech-to-text service is configured and skips it (with a log line) otherwise.
   */
  voiceLiveness: read("VOICE_LIVENESS") as "required" | "off" | undefined,

  stt: {
    provider: read("STT_PROVIDER") as
      "davinci" | "whisper" | "deepgram" | "none" | undefined,
    openaiKey: read("OPENAI_API_KEY"),
    whisperModel: read("OPENAI_WHISPER_MODEL") ?? "whisper-1",
    deepgramKey: read("DEEPGRAM_API_KEY"),
    deepgramModel: read("DEEPGRAM_MODEL") ?? "nova-2",
  },

  llm: {
    provider: read("LLM_PROVIDER") as
      "davinci" | "anthropic" | "openai" | "none" | undefined,
    anthropicKey: read("ANTHROPIC_API_KEY"),
    /**
     * Vercel AI Gateway key; when set, Anthropic calls go through the gateway. On Vercel the
     * deployment's OIDC token authenticates the gateway without a key.
     */
    gatewayKey: read("AI_GATEWAY_API_KEY") ?? read("VERCEL_OIDC_TOKEN"),
    gatewayUrl: read("AI_GATEWAY_BASE_URL"),
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
