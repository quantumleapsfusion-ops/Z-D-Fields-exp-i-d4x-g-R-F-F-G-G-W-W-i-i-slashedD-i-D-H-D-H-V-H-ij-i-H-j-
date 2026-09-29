# e1-4 — earth life-forms

Flagship of **Earth One Global Coalescent** (sibling: [earth1.co](https://earth1.co)).

> A social network with no typing. You speak; everything else follows.

This repo is the Next.js + Supabase **app shell** that the four features plug into:
Voice Stream, Da Vinci, Infinity Chalkboard, Gravity Board (feature-flagged).

## Stack

| Layer     | Choice                                                                                      |
| --------- | ------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, TypeScript), Tailwind CSS v4                        |
| Auth      | Voice only: Picovoice Eagle voiceprint + spoken one-time phrase, sessions via Supabase Auth |
| Database  | Supabase Postgres, schema + migrations via Prisma 7 (`pg` adapter)                          |
| Storage   | Supabase Storage — `avatars` (public) and `voice` (private) buckets                         |
| Tooling   | ESLint, Prettier, GitHub Actions (lint + typecheck + build)                                 |

Brand: chalkboard palette (`#0e1a13` board, `#f1ede1` chalk, `#93a294` dust, `#d3a34c` ochre),
Fraunces (display) + Space Grotesk (body) via `next/font`, rainbow Ψπ `Logo` (`public/brand/e1-4.png`; earth1.co uses the cross-in-circle `brand="earth1"`).

## Project layout

```
prisma/schema.prisma             User, VoiceStream, VoiceSegment, Share
prisma/migrations/               Prisma-managed table migrations
prisma.config.ts                 Prisma CLI config (uses DIRECT_URL)
supabase/migrations/*.sql        RLS policies, auth->profile trigger, storage buckets + policies
src/proxy.ts                     Next 16 middleware: refreshes the Supabase session, guards /profile
src/lib/env.ts                   Typed env access (public vs server-only)
src/lib/supabase/client.ts       Browser client (Client Components)
src/lib/supabase/server.ts       Cookie-backed server client (RSC, Server Actions, Route Handlers)
src/lib/supabase/admin.ts        Service-role client (server only, bypasses RLS)
src/lib/db.ts                    Prisma client over the pooled DATABASE_URL
src/lib/storage/                 StorageProvider interface + Supabase implementation
src/lib/auth/                    Session user helpers + sign-out Server Action
src/lib/voice-id/                Speaker engine, challenge phrases, voiceprint sealing, session minting
src/lib/voice-nav/               Spoken navigation command parser
src/lib/account/                 Profile actions (avatar upload) + hard-delete routine
src/app/api/voice-id/            challenge / enroll / verify routes
src/app/{page,login,profile}     Home, sign-in, profile
src/components/                  Logo, SiteHeader, AvatarForm
```

## Local setup

Requires Node 22+ (`.nvmrc`).

### 1. Create the Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Save the DB password.
2. **Project Settings → API**: copy the Project URL, `anon` key and `service_role` key.
3. **Project Settings → Database → Connection string**: copy
   - the **Transaction** pooler URI (port `6543`) → `DATABASE_URL` (append `?pgbouncer=true`)
   - the **Session** pooler or **Direct** URI (port `5432`) → `DIRECT_URL`

### 2. Voice identity (no email, no password)

People sign in by voice only. `/login` ("Speak to enter") offers two things:

- **New here:** read three short lines aloud. Picovoice Eagle builds a voiceprint from them,
  the server creates a voice-only Supabase Auth user and signs you straight in.
- **Sign in:** say a random four-word phrase shown on screen. Access is granted only if
  server-side speech-to-text hears that phrase (so an old recording can't be replayed) **and**
  the voice matches exactly one enrolled voiceprint (`VOICE_ID_THRESHOLD`, with a margin over
  the runner-up).

| Variable                              | Purpose                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PICOVOICE_ACCESS_KEY`                | Eagle speaker recognition ([console.picovoice.ai](https://console.picovoice.ai/)). Unset = voice sign-in off.                    |
| `VOICE_PROFILE_KEY`                   | 32 random bytes, base64 (`openssl rand -base64 32`). Seals voiceprints at rest (AES-256-GCM).                                    |
| `DEEPGRAM_API_KEY` / `OPENAI_API_KEY` | Hears the one-time phrase. Required unless `VOICE_ID_REQUIRE_PHRASE_CHECK=false` (not recommended: voiceprint only, replayable). |
| `VOICE_ID_THRESHOLD`                  | Minimum Eagle similarity (0–1) for a match. Default `0.75`; tune on real users.                                                  |

Supabase still issues the session: after the server verifies a voice it mints a one-time
magic-link token with the service role (nothing is emailed) and redeems it on the cookie client,
so RLS and `src/proxy.ts` work unchanged. Voice-only users get an internal
`<uuid>@voice.e1-4.com` address that is never shown or stored on `users`. Voiceprints live in
`voice_profiles` (server-only, RLS on with no policies) and cascade with the account on hard
delete; users can delete or re-record theirs on `/profile`.

Early-stage limits: every sign-in compares against all voiceprints (fine for thousands, not
millions); there is no per-IP rate limit yet; a live voice clone reading the phrase is not
detected. The Eagle native binary runs in the Node runtime (`serverExternalPackages`).

**Voice navigation.** The mic button in the nav rail / tab bar / header (or Alt+V) listens for
one command: "open chalkboard", "take me to Da Vinci", "voice stream", "profile", "home",
"go back", "sign out", "help". It uses the same live transcription as Da Vinci (browser Web
Speech, or Deepgram when signed in and keyed) and only opens the mic when asked.

### 3. Environment

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, DIRECT_URL
```

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS: it is only read in `src/lib/supabase/admin.ts`
(server-only). Never prefix it with `NEXT_PUBLIC_`.

### 4. Install, migrate, run

```bash
npm install                 # also runs `prisma generate`
npm run prisma:deploy       # applies prisma/migrations to DIRECT_URL (creates the tables)
npm run dev                 # http://localhost:3000
```

### 5. Apply RLS + storage buckets

`supabase/migrations/20260924000000_rls_and_storage.sql` enables Row Level Security on every
table, adds a trigger that creates a `users` row when someone signs up, and creates the
`avatars` (public-read) and `voice` (private, signed URLs) buckets with their object policies.

Apply it **after** step 4, either:

- **SQL editor**: paste the file's contents and run it, or
- **Supabase CLI**: `supabase link --project-ref <ref>` then `supabase db push`.

Bucket access model:

- `avatars/<uid>/avatar.<ext>` — anyone can read, only the owner can write. Served via public URL.
- `voice/<uid>/<streamId>/<n>.<ext>` — owner can read/write; recipients of a `USER` share can read;
  `LINK` shares are served by the server with signed URLs (`storage.getSignedUrl`).

## Scripts

| Command                  | What it does                                          |
| ------------------------ | ----------------------------------------------------- |
| `npm run dev`            | Dev server on http://localhost:3000                   |
| `npm run build`          | `prisma generate` + production build                  |
| `npm start`              | Serve the production build                            |
| `npm run lint`           | ESLint                                                |
| `npm run typecheck`      | `next typegen` + `tsc --noEmit`                       |
| `npm run format`         | Prettier (write) / `format:check` to verify           |
| `npm run prisma:migrate` | Create + apply a new migration in dev (`migrate dev`) |
| `npm run prisma:deploy`  | Apply pending migrations (`migrate deploy`)           |
| `npm run prisma:studio`  | Browse the database                                   |

## Data model & deletion

`User.id` equals the Supabase Auth user id. `VoiceStream` → `VoiceSegment` (audio blob path +
transcript) and `Share` (scope `PRIVATE | LINK | USER`) all cascade-delete from the user.

`hardDeleteUser(userId)` in `src/lib/account/delete.ts` removes, in order: every object under
`<uid>/` in the `voice` and `avatars` buckets, the Postgres rows, then the Supabase Auth user.
It is exposed to the signed-in user as **Delete account** on `/profile`.

## Later: Da Vinci keys

`.env.example` reserves `OPENAI_API_KEY`, `DEEPGRAM_API_KEY` and `ANTHROPIC_API_KEY` for the
speech-to-text and LLM steps. They are unused by the shell.
