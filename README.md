# e1-4 — earth life-forms

Flagship of **Earth One Global Coalescent** (sibling: [earth1.co](https://earth1.co)).

> A social network with no typing. You speak; everything else follows.

This repo is the Next.js + Supabase **app shell** that the four features plug into:
Voice Stream, Da Vinci, Infinity Chalkboard, Gravity Board (feature-flagged).

## Stack

| Layer     | Choice                                                               |
| --------- | -------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Actions, TypeScript), Tailwind CSS v4 |
| Auth      | Supabase Auth — Google, Facebook (Meta), Microsoft (Azure) OAuth     |
| Database  | Supabase Postgres, schema + migrations via Prisma 7 (`pg` adapter)   |
| Storage   | Supabase Storage — `avatars` (public) and `voice` (private) buckets  |
| Tooling   | ESLint, Prettier, GitHub Actions (lint + typecheck + build)          |

Brand: chalkboard palette (`#0e1a13` board, `#f1ede1` chalk, `#93a294` dust, `#d3a34c` ochre),
Fraunces (display) + Space Grotesk (body) via `next/font`, Ψ-over-π rainbow `Logo`.

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
src/lib/auth/                    OAuth provider list + sign-in/sign-out Server Actions
src/lib/account/                 Profile actions (avatar upload) + hard-delete routine
src/app/auth/callback/route.ts   OAuth code -> session exchange
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

### 2. Configure OAuth providers (in the Supabase dashboard, not in code)

**Authentication → Providers**, enable and paste the client ID/secret for each:

| Provider  | Where to create the app                                                 | Redirect URI to register                             |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| Google    | Google Cloud Console → APIs & Services → Credentials → OAuth client ID  | `https://<project-ref>.supabase.co/auth/v1/callback` |
| Facebook  | Meta for Developers → Create app → Facebook Login                       | same                                                 |
| Microsoft | Azure Portal → App registrations → New (Web platform); Supabase "Azure" | same                                                 |

Then under **Authentication → URL Configuration** set the Site URL (e.g. `http://localhost:3000`)
and add `http://localhost:3000/auth/callback` (and your production URL) to **Redirect URLs**.

Provider secrets never live in this repo — the app only calls `supabase.auth.signInWithOAuth`.

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
| `npm test`               | Vitest unit tests (`test:watch` for watch mode)       |
| `npm run test:e2e`       | Playwright smoke tests against `next start`           |
| `npm run prisma:migrate` | Create + apply a new migration in dev (`migrate dev`) |
| `npm run prisma:deploy`  | Apply pending migrations (`migrate deploy`)           |
| `npm run prisma:studio`  | Browse the database                                   |

## Testing

- **Unit (Vitest):** `src/**/*.test.ts`, pure logic only (LLM JSON extraction, Da Vinci ops,
  Gravity superposition heuristics, duration formatting). No network, no database.
- **E2E (Playwright):** `e2e/*.spec.ts` on desktop + mobile Chrome. Runs against a production
  build (`npm run build` first; the config starts `next start` on port 3100) and only needs the
  placeholder env from CI — it covers the public pages, the anonymous redirects, `/auth/callback`
  error handling and the 401/404 guards on the API routes. Set `PLAYWRIGHT_BASE_URL` to run the
  same suite against a deployed URL (e.g. a Vercel preview).

Anything that needs a real session (OAuth, uploads, transcription, sharing, deletion) is exercised
manually against the live Supabase project — see `docs/live-e2e.md`.

## Deploying to Vercel

1. Import the repo in Vercel (framework preset: Next.js; Node 22 is picked up from `engines`).
   `vercel.json` pins the region to `iad1` — change it to match your Supabase region.
2. Add every variable from `.env.example` under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (pooler, port 6543, `?pgbouncer=true`) and `DIRECT_URL` (port 5432)
   - `NEXT_PUBLIC_SITE_URL=https://e1-4.com` (and the preview URL on the Preview environment)
   - `ANTHROPIC_API_KEY`, `DEEPGRAM_API_KEY` or `OPENAI_API_KEY`, and the `AI_*` budget knobs
   - Keep `NEXT_PUBLIC_FEATURE_GRAVITY_BOARD=false` in Production.
3. The build runs `prisma generate && next build` (`postinstall` also generates the client).
   Migrations are **not** run on deploy — apply them from a trusted machine with
   `npm run prisma:deploy` (uses `DIRECT_URL`).
4. In Supabase → **Authentication → URL Configuration**, set the Site URL to the production
   domain and add `https://<your-domain>/auth/callback` plus
   `https://*-<team>.vercel.app/auth/callback` to the redirect allow-list so previews can sign in.
5. Route handlers that call the LLM/STT providers declare `runtime = "nodejs"`; `vercel.json`
   raises their `maxDuration` so a slow model reply is not cut off at the default 10 s.

## Data model & deletion

`User.id` equals the Supabase Auth user id. `VoiceStream` → `VoiceSegment` (audio blob path +
transcript) and `Share` (scope `PRIVATE | LINK | USER`) all cascade-delete from the user.

`hardDeleteUser(userId)` in `src/lib/privacy/hard-delete.ts` removes, in order: every object under
`<uid>/` in the `voice` and `avatars` buckets, the Postgres rows, then the Supabase Auth user.
It is exposed to the signed-in user as **Delete account** on `/profile`.

## AI keys

`DEEPGRAM_API_KEY` / `OPENAI_API_KEY` drive speech-to-text and `ANTHROPIC_API_KEY` drives the
LLM tiers (`LLM_MODEL_EVERYDAY`, `LLM_MODEL_HEAVY`). Without a key each feature falls back to a
clearly-labelled stub (`source: "stub"` / `transcriptionStatus: "SKIPPED"`) instead of failing.
