# Deploying to Vercel

Two Vercel projects, one repo. Each project has **Root Directory** set to its app folder; the
`vercel.json` there installs from the monorepo root and builds only that workspace via Turbo.

| Vercel project | Root Directory   | Production domain | Notes                                 |
| -------------- | ---------------- | ----------------- | ------------------------------------- |
| `e1-4-com`     | `apps/e1-4-com`  | `e1-4.com`        | Needs Supabase + Postgres env (below) |
| `earth1-co`    | `apps/earth1-co` | `earth1.co`       | Static corporate shell, no env needed |

Node version: 22 (Project Settings -> General -> Node.js Version). Framework preset: Next.js.

## 1. Create the projects

1. Vercel -> Add New -> Project -> import this repository.
2. Set **Root Directory** to `apps/e1-4-com`. Leave build/install commands as "Override: off" — they
   come from `vercel.json`.
3. Repeat for `apps/earth1-co`.
4. Add domains: `e1-4.com` + `www.e1-4.com` (redirect www -> apex) on `e1-4-com`; `earth1.co` +
   `www.earth1.co` on `earth1-co`.

## 2. Environment variables (`e1-4-com` only)

Paste `apps/e1-4-com/.env.production.example` into **Settings -> Environment Variables** for the
**Production** environment and fill in the Supabase values. Mark `SUPABASE_SERVICE_ROLE_KEY`,
`DATABASE_URL`, `DIRECT_URL` and any API keys as **Sensitive**.

`NEXT_PUBLIC_SITE_URL` is the only variable that differs per environment:

| Environment | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| Production  | `https://e1-4.com`                                         |
| Preview     | leave **unset** — the app falls back to the deployment URL |
| Development | `http://localhost:3000` (from `.env.local`)                |

## 3. Supabase Storage

Create the `avatars` bucket as public and the `voice` bucket as private. The app uses the
service-role key only from server-side Storage code.

## 4. Database

Migrations are not run by the Vercel build (the build only does `prisma generate`). Apply them
once per Supabase project from a trusted machine with `DIRECT_URL` set:

```bash
cd apps/e1-4-com
npm run prisma:deploy
```

The SQL files in `supabase/migrations/` are retained. Create Storage buckets in the dashboard;
do not apply legacy Auth-trigger setup for voice identity.

## 5. Voice authentication setup

Voice sign-in uses liveness (challenge-response with random digits) and voiceprints (spectral
comparison stored server-side). After merging PR #62 and running migrations:

- **Device binding** (Q7 in QUESTIONS.md): One account per device. Signing in on a new device
  requires re-authorization via voice. This prevents cross-device account takeover if a session
  token leaks. Implement by binding session tokens to a device fingerprint (UA, stored cookie, or
  display specs) and requiring fresh voice liveness on new devices.
- **Voiceprint consent** (Q9 in QUESTIONS.md): Voiceprints are special-category personal data under
  UK GDPR and subject to Illinois BIPA (biometric consent). Before enrollment, show a consent
  screen: "Your voice will be encrypted and stored. It cannot be used to identify you in public. It
  will be deleted if you remove your account or don't use e1-4 for 3 years." Block users under 13.
  Implement BIPA notice for IL users or exclude Illinois (pending legal review).
- **Anti-spoofing** (Q8 in QUESTIONS.md): Evaluate and integrate SpeechBrain ECAPA-TDNN + AASIST.
  Until integrated, liveness (current challenge-response) serves as interim anti-spoofing against
  replayed recordings.

Set `VOICE_LIVENESS=required` in production to enforce liveness. Without it, sign-in works but
liveness is logged and skipped. Check `/api/health` to verify voiceprint and passkey RLS are
enabled on the database.

## 6. Smoke check after the first deploy

```bash
E2E_BASE_URL=https://e1-4.com npm run test:e2e
npm run test:live
```

`test:live` requires `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. It creates disposable Prisma users and deletes their test data.
Set `LIVE_APP_URL=http://localhost:3000` with an app running to include the public share-page test.
