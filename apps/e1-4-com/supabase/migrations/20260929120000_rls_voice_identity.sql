-- Follows prisma/migrations/20260929120000_voice_identity. Run after `npm run prisma:deploy`.
-- Voiceprints and sign-in challenges are server-only (service role / Prisma bypass RLS):
-- RLS on with no policies keeps them out of reach of the anon and authenticated keys.
alter table public.voice_profiles   enable row level security;
alter table public.voice_challenges enable row level security;
