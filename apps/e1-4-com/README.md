# e1-4 — earth life-forms

Flagship of **Earth One Global Coalescent** (sibling: [earth1.co](https://earth1.co)).

> A social network with no typing. You speak; everything else follows.

This repo is the Next.js + Supabase **app shell** that the four features plug into:
Voice Stream, Da Vinci, Infinity Chalkboard, Gravity Board (feature-flagged).

## Stack

| Layer     | Choice                                                               |
| --------- | -------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, TypeScript), Tailwind CSS v4 |
| Auth      | Voice identity (spoken name + voice print); Supabase Auth as session |
| Database  | Supabase Postgres, schema + migrations via Prisma 7 (`pg` adapter)   |
| Storage   | Supabase Storage — `avatars` (public) and `voice` (private) buckets  |
| Tooling   | ESLint, Prettier, GitHub Actions (lint + typecheck + build)          |

Brand: chalkboard palette (`#0e1a13` board, `#f1ede1` chalk, `#93a294` dust, `#d3a34c` ochre),
Fraunces (display) + Space Grotesk (body) via `next/font`, rainbow Ψπ `Logo` (`public/brand/e1-4.png`; earth1.co uses the cross-in-circle `brand="earth1"`).

## Project layout

```
prisma/schema.prisma             User, VoicePrint, VoiceStream, VoiceSegment, Share
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
src/lib/auth/voice.ts            Voice enrol/verify: phrase hash + voice-print match -> Supabase session
src/lib/voice/voiceprint.ts      Spectral voice-print features + cosine matcher (unit-tested)
src/lib/voice/capture.ts         Browser Web Audio capture -> voice print
src/lib/voice/commands.ts        Spoken navigation grammar ("open chalkboard", "go back", ...)
src/features/voice-gate/         The /login voice gate UI (enrol + verify)
src/components/VoiceNav.tsx      Global "Speak" button: voice is the site navigation
src/lib/account/                 Profile actions (avatar upload) + hard-delete routine
src/app/{page,login,profile}     Home, voice gate, profile
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

### 2. Identity is voice — nothing to configure in the dashboard

There are no OAuth providers, emails or passwords. At `/login` (the _voice gate_) a person says a
voice name of two or more words. The browser recognises the words (Web Speech / Deepgram) and,
in parallel, builds a small spectral voice print from the microphone (`src/lib/voice/capture.ts`).
The server (`src/lib/auth/voice.ts`) hashes the phrase, finds prints with that hash, and compares
voice prints; a match opens a Supabase session via an admin-generated magic link consumed
server-side. Unknown names are offered enrolment (three takes of the same name).

Supabase Auth is kept purely as the session cookie layer: each voice identity owns an auth user
with an opaque placeholder address under `voice.e1-4.com` that is never shown or mailed. Leave
**Authentication → Providers → Email** enabled (it is the default) so `generateLink` works, and
turn off "Confirm email" — nothing is ever sent. `voice_prints` is service-role only (RLS, no
client grants).

The voice print is a lightweight spectral signature, deliberately small and replaceable: swap
`matchVoicePrint` for a real speaker-verification provider when one is chosen. It is not a
high-assurance biometric and has no replay protection yet.

Voice is also the navigation: the pinned **Speak** button (or the `V` key) on every page listens
for "stream", "open Da Vinci", "take me to the chalkboard", "gravity", "profile", "home", "back",
"sign out" or "help" (`src/lib/voice/commands.ts`).

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
