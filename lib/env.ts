/**
 * Server-side environment access. Every paid API / infra dependency is optional so the app
 * degrades gracefully: missing keys disable a capability instead of crashing the process.
 */
function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

export const env = {
  databaseUrl: read('DATABASE_URL'),

  nextAuthSecret: read('NEXTAUTH_SECRET'),
  devLogin: read('AUTH_DEV_LOGIN') === 'true' && process.env.NODE_ENV !== 'production',
  google: { id: read('GOOGLE_CLIENT_ID'), secret: read('GOOGLE_CLIENT_SECRET') },
  facebook: { id: read('FACEBOOK_CLIENT_ID'), secret: read('FACEBOOK_CLIENT_SECRET') },
  microsoft: {
    id: read('AZURE_AD_CLIENT_ID'),
    secret: read('AZURE_AD_CLIENT_SECRET'),
    tenantId: read('AZURE_AD_TENANT_ID') ?? 'common',
  },

  storage: {
    driver: (read('STORAGE_DRIVER') ?? 'local') as 'local' | 's3',
    localDir: read('STORAGE_LOCAL_DIR') ?? '.data/storage',
    endpoint: read('S3_ENDPOINT'),
    region: read('S3_REGION') ?? 'auto',
    bucket: read('S3_BUCKET'),
    accessKeyId: read('S3_ACCESS_KEY_ID'),
    secretAccessKey: read('S3_SECRET_ACCESS_KEY'),
    forcePathStyle: read('S3_FORCE_PATH_STYLE') === 'true',
  },

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
