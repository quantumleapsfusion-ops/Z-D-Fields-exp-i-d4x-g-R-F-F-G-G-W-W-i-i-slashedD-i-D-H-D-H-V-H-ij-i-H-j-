# Sign-in, sessions and saving

## One session system

`main` has exactly one: sign-in creates a random 32-byte token, the browser holds it in the
`e14_session` cookie (HTTP-only, `SameSite=Lax`, secure in production, 30 days, renewed daily),
and the database holds only its SHA-256 in `sessions`. Code: `src/lib/auth/session.ts`.

History, so nobody goes looking for the others: 142dd64 added a signed cookie (`token.ts`),
8610f82 removed it for Supabase Auth, and #57 replaced Supabase Auth with the sessions above.
Neither the signed-cookie code nor `src/lib/supabase/` exists any more, and #60 did not bring them
back. The old `auth.uid()` row-level-security policies are dead letters (nothing sets a Supabase
JWT); they stay deny-by-default for the anon and authenticated keys.

## Signing in

1. Tap. The phone says four digits out loud (`POST /api/voice-id/challenge`, spoken with the
   device's own voice; nothing is shown).
2. The microphone opens only after the prompt ends and the person says the digits back. The device
   measures a voiceprint from the live microphone samples (no decoding of a recorded file, which
   fails on some iPhones) and sends it with the audio and the challenge to `POST /api/voice-id`.
3. The server checks the digits against a transcript of the audio (single-use challenge, two
   minutes), then matches the voiceprint: a known voice signs in, an unheard voice gets a new
   stream. Liveness stops replayed recordings. It does not stop a live voice clone; that needs a
   stronger model than this one.
4. Refusals are `voice`, `liveness`, `busy` (rate limit) and `setup`; each has its own shake, glyph
   and vibration. After two misses a key glyph appears: the phone's passkey signs in instead.
   A signed-in person with no passkey sees a key-plus glyph to add one.

## Saving

Every span is uploaded with retries. A span that still fails is kept in the device's IndexedDB and
re-sent on the next visit or when the network returns; a retry glyph shows while any are waiting.

## Checking a deployment

`GET /api/health` lists what is missing by name (tables, env variables, speech-to-text for
liveness). Migrations are **not** run by the Vercel build: after merging, run
`npx prisma migrate deploy` against the production database and apply
`supabase/migrations/*` for row-level security.
