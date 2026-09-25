/**
 * Environment access. Supabase + database are required; every paid API is optional so the app
 * degrades gracefully: missing keys disable a capability instead of crashing the process.
 */
function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

function required(name: string): string {
  const value = read(name);
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

/** Safe for the browser; inlined at build time by Next.js. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

/** Server only. */
export const env = {
  databaseUrl: read('DATABASE_URL'),
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),

  stt: {
    provider: read('STT_PROVIDER') as 'whisper' | 'deepgram' | 'none' | undefined,
    openaiKey: read('OPENAI_API_KEY'),
    whisperModel: read('OPENAI_WHISPER_MODEL') ?? 'whisper-1',
    deepgramKey: read('DEEPGRAM_API_KEY'),
    deepgramModel: read('DEEPGRAM_MODEL') ?? 'nova-2',
  },

  llm: {
    provider: read('LLM_PROVIDER') as 'anthropic' | 'openai' | 'none' | undefined,
    anthropicKey: read('ANTHROPIC_API_KEY'),
    anthropicModel: read('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-latest',
    openaiKey: read('OPENAI_API_KEY'),
    openaiModel: read('OPENAI_MODEL') ?? 'gpt-4o',
  },
} as const;
