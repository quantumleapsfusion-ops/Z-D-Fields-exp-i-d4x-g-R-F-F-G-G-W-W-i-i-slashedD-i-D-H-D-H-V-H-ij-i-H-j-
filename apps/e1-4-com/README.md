# e1-4.com

Next.js application with a voice-only identity, a Voice Stream, five connected dimensions and
voice conversations.

## Stack

| Layer     | Choice                                                               |
| --------- | -------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, TypeScript), Tailwind CSS v4 |
| Identity  | Prisma-backed voiceprints and opaque sessions                        |
| Database  | Postgres, schema + migrations via Prisma 7 (`pg` adapter)            |
| Storage   | Supabase Storage (`avatars` and `voice` buckets)                     |
| Tooling   | ESLint, Prettier, GitHub Actions (lint + typecheck + build)          |

Palette: black (`#000`), chalk (`#f1ede1`), dust (`#93a294`) and ochre (`#d3a34c`).
Fraunces and Space Grotesk are loaded with `next/font`. Brand marks live in `public/brand/` (`e1-4.png`; earth1.co uses `brand="earth1"`).

## Project layout

```
prisma/schema.prisma             User, VoiceStream, VoiceSegment, Share, Conversation, VoiceNote
prisma/migrations/               Prisma-managed table migrations
prisma.config.ts                 Prisma CLI config (uses DIRECT_URL)
supabase/migrations/*.sql        Existing Supabase SQL migrations
src/proxy.ts                     Checks session cookie and request origin
src/lib/env.ts                   Typed env access (public vs server-only)
src/lib/db.ts                    Prisma client over the pooled DATABASE_URL
src/lib/storage/                 StorageProvider interface + Supabase Storage implementation
src/lib/auth/                    Voice sessions and sign-out action
src/lib/privacy/                 Data export and hard-delete routines
src/app/                         Home, login, profile and dimension routes
src/components/                  Navigation, page shell, audio dock and Da Vinci drawer
```

## Dimensions

| Dimension | Surface             | Route            |
| --------- | ------------------- | ---------------- |
| 1D        | Voice Stream        | `/stream`        |
| 2D        | Infinity Chalkboard | `/chalkboard`    |
| 3D        | Gravity Chalkboard  | `/gravity`       |
| 4D        | Event Horizon       | `/horizon`       |
| 5D        | Superposition       | `/superposition` |

Every Voice Stream entry, including the one spoken to sign in, is appended to the speaker's
single stream and checked against their voiceprint (`voice_segments.speaker_verified`).
Voice Stream supplies transcript text to the other surfaces. The 3D, 4D and 5D routes
can be disabled with `NEXT_PUBLIC_FEATURE_GRAVITY_CHALKBOARD`,
`NEXT_PUBLIC_FEATURE_EVENT_HORIZON` and `NEXT_PUBLIC_FEATURE_SUPERPOSITION`. All default
to `true`.

## Local setup

Requires Node 22+ (`.nvmrc`).

### 1. Create the Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Save the DB password.
2. **Project Settings → API**: copy the Project URL and `service_role` key.
3. **Project Settings → Database → Connection string**: copy
   - the **Transaction** pooler URI (port `6543`) → `DATABASE_URL` (append `?pgbouncer=true`)
   - the **Session** pooler or **Direct** URI (port `5432`) → `DIRECT_URL`

### 2. Environment

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
# DATABASE_URL and DIRECT_URL
```

`SUPABASE_SERVICE_ROLE_KEY` is used by the server-side Storage adapter. Never expose it to the
browser or prefix it with `NEXT_PUBLIC_`.

### 3. Install, migrate, run

```bash
npm install                 # also runs `prisma generate`
npm run prisma:deploy       # applies prisma/migrations to DIRECT_URL (creates the tables)
npm run dev                 # http://localhost:3000
```

Create the `avatars` bucket as public and the `voice` bucket as private in Supabase Storage.
Existing SQL migrations remain in `supabase/migrations/`.

Bucket access model:

- `avatars/<uid>/avatar.<ext>` — anyone can read, only the owner can write. Served via public URL.
- `voice/<uid>/<streamId>/<n>.<ext>` — owner can read/write; recipients of a `USER` share can read;
  `LINK` shares are served by the server with signed URLs (`storage.getSignedUrl`).
- `voice/<uid>/talk/<conversationId>/<noteId>.<ext>` — a Talk voice note, stored under the
  sender's uid. Other members never read Storage directly: `/api/talk/notes/[id]/audio` checks
  conversation membership and proxies the bytes.

## Talk (async voice conversations)

- Start a conversation on `/talk`, then share its invite link (`/talk/join/<token>`) any way you
  like. Signed-in people who open it join; "Make a new link" rotates the token.
- **Voice note**: record → Send. Transcribed in the background with the configured STT provider
  (`SKIPPED` when none is set).
- **Go live**: the recorder cuts a playable clip every 4 s (`LIVE_PART_MS`) and uploads each one
  with a shared `liveId`; the member row carries a heartbeat (`liveAt`, stale after 15 s). Anyone
  with the thread open sees "is live now" and can **Listen live**, which follows the clips as they
  land. Anyone who wasn't around finds the stream as one item in the thread.
- The whole thread is a single chronological AudioDock playlist. Unread counts come from
  `conversation_members.last_read_at`.
- Unsend deletes your own notes for everyone. Leaving keeps your notes for the others; the last
  member out deletes the conversation and all its audio. Deleting your account removes every note
  you sent.
- **No text on screen**: the note being heard climbs the 1D→5D spacetime field (line, board,
  gravity, horizon, superposition, observed) above the thread; notes show as avatars and
  waveforms, and transcripts are kept for search, export and screen readers only. See
  [`docs/architecture.md`](docs/architecture.md) and the
  [phone-number replacement plan](docs/replace-phone-numbers.md).
- Not a phone line: it needs data/Wi-Fi, can't reach phone numbers or emergency services, and
  there are no push notifications yet (the thread polls while open).

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

## Testing

- **Unit (Vitest):** `src/**/*.test.ts`, pure logic only (LLM JSON extraction, Da Vinci ops,
  Gravity superposition heuristics, duration formatting). No network, no database.
- **E2E (Playwright):** `e2e/*.spec.ts` on desktop + mobile Chrome. Runs against a production
  build (`npm run build` first; the config starts `next start` on port 3100). It creates
  disposable users and sessions and removes their database rows and Storage objects. Chromium is
  launched with a fake microphone, so speaking at the front door and to Da Vinci is exercised
  for real. Point `NEXT_PUBLIC_SUPABASE_URL` at `http://127.0.0.1:54321` when you build, and the
  suite runs its own small Storage fake (`e2e/helpers/fake-storage.ts`) instead of a Supabase
  project; any Postgres works for `DATABASE_URL`. That is how CI runs it, with no secrets.

Live database and Storage checks run with `npm run test:live`; see `docs/live-e2e.md`. CI runs the
deletion proof from that set on every push (`live/delete-all.live.test.ts`): after
`DELETE /api/account`, or the hold gesture on the profile page that calls it, not one row or stored
file of that person remains.

## Deploying to Vercel

1. Import the repo in Vercel (framework preset: Next.js; Node 22 is picked up from `engines`).
   `vercel.json` pins the region to `iad1` — change it to match your Supabase region.
2. Add every variable from `.env.example` under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (pooler, port 6543, `?pgbouncer=true`) and `DIRECT_URL` (port 5432)
   - `NEXT_PUBLIC_SITE_URL=https://e1-4.com` (and the preview URL on the Preview environment)
   - `ANTHROPIC_API_KEY`, `DEEPGRAM_API_KEY` or `OPENAI_API_KEY`, and the `AI_*` budget knobs
   - Keep `NEXT_PUBLIC_FEATURE_GRAVITY_BOARD=false` in Production.
3. The build runs `prisma generate && next build` (`postinstall` also generates the client).
   Migrations are **not** run on deploy — apply them from a trusted machine with
   `npm run prisma:deploy` (uses `DIRECT_URL`).
4. Route handlers that call the LLM/STT providers declare `runtime = "nodejs"`; `vercel.json`
   raises their `maxDuration` so a slow model reply is not cut off at the default 10 s.

## Data model & deletion

`User.id` is generated by Prisma. Voiceprints identify users; sessions store only a hash of the
session token. User-owned rows cascade from the user.

`hardDeleteUser(userId)` removes objects under `<uid>/` from `voice` and `avatars`, then deletes
the Postgres user row and its related data. It is exposed on `/profile`.

## AI keys

`DEEPGRAM_API_KEY` / `OPENAI_API_KEY` drive speech-to-text. The LLM tiers (`LLM_MODEL_EVERYDAY`,
`LLM_MODEL_HEAVY`) go through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) when
`AI_GATEWAY_API_KEY` is set (models are sent as `anthropic/<id>`, e.g. `anthropic/claude-fable-5.1`;
the gateway needs paid credits for Claude models), otherwise straight to Anthropic via
`ANTHROPIC_API_KEY`. Without either key each feature falls back to a
clearly-labelled stub (`source: "stub"` / `transcriptionStatus: "SKIPPED"`) instead of failing.
