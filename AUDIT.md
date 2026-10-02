# AUDIT.md — takeover audit (2026-10-01)

State of the monorepo as handed over from Devin, written before any takeover change.
Companion files: `QUESTIONS.md` (open decisions) and `SUMMARY.md` (what was shipped).

## 1. Stack

| Layer           | What is used                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo        | npm workspaces (`apps/*`, `packages/*`) + Turborepo 2.11 (`turbo.json`). Node 22 (`.nvmrc`), npm 10.                                              |
| Web apps        | Next.js 16.3 (App Router, TypeScript, React 19.2), Tailwind CSS 4, framer-motion 13.                                                              |
| Database        | Postgres on Supabase via Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`). Supabase Storage for audio and avatars.                      |
| Tests           | Vitest 4 (unit), Playwright 1.63 (e2e, e1-4 only), pytest (Python).                                                                               |
| Lint / format   | ESLint 9 (`eslint-config-next`), Prettier 3 with the Tailwind plugin, ruff + mypy for Python.                                                     |
| Python services | `apps/davinci` — FastAPI gateway for self-hosted models (Da Vinci). Not deployed to Vercel.                                                       |
| Hosting         | Vercel (`vercel.json` per app, Turborepo filters). Cloudflare Pages `wrangler.toml` files remain from an earlier static launch (`DEPLOYMENT.md`). |

There is no `.devin/` directory and no Devin-specific config in the repo. The only
agent instructions are `apps/e1-4-com/AGENTS.md` / `CLAUDE.md` (Next.js "agent rules"
blocks written by `next dev`).

## 2. Workspaces and which directory serves which domain

| Workspace               | Package name              | Domain / role                                                                                                                                     | Port |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `apps/earth1-co`        | `earth1-co`               | **earth1.co**. Static-friendly Next.js site: Cicero home, quantum library, pillar pages, founder, equations.                                      | 3001 |
| `apps/e1-4-com`         | `e1-4-com`                | **e1-4.com**. The product: voice stream, talk, Da Vinci, chalkboard, gravity, horizon, voice-only identity.                                       | 3000 |
| `apps/e1-4-pages`       | `e1-4-pages`              | Older static landing for e1-4.com (Cloudflare Pages era). Imports `features` from `e1-4-com/src/lib/site`. Likely superseded; see `QUESTIONS.md`. | 3002 |
| `apps/davinci`          | (Python, `davinci`)       | Da Vinci AI gateway: `/v1/complete`, `/v1/transcribe`, `/v1/embed`, `/healthz`, `/readyz`. Docker Compose on a GPU box.                           | 8000 |
| `packages/ui`           | `@earth-one/ui`           | Shared tokens (`tokens.css`), `brand.ts`, `Logo` (PNG `<img>`), `CosmicMark`, `CosmicBackdrop`.                                                   | —    |
| `packages/spacetime`    | `@earth-one/spacetime`    | WebGL spacetime-grid background used by both sites.                                                                                               | —    |
| `packages/liquid-metal` | `@earth-one/liquid-metal` | Three.js bead field (damped wave equation), e1-4 logo material.                                                                                   | —    |
| `quantum/`              | —                         | Loose Qiskit scripts (`circuits/bell.py`); `requirements.txt` and `run.py` are git-ignored.                                                       | —    |

Mapping onto the brief's target layout (§5 of `CLAUDE.md`): `apps/earth1-co` = `apps/earth1`,
`apps/e1-4-com` = `apps/e14`, `packages/ui` already exists. There is no `packages/content`
(earth1 content lives in `apps/earth1-co/src/lib`), no `services/engine`, and the e1-4
dimension packages (`voice-stream`, `chalkboard`, `gravity-board`, `event-horizon`, `da-vinci`)
live as feature folders inside `apps/e1-4-com/src/features` rather than packages. Renaming
the apps is not worth the churn; the roles are mapped, not moved.

## 3. Scripts

Root `package.json`:

| Script                          | Does                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| `dev`, `dev:earth1`, `dev:e1-4` | `turbo run dev` or the single workspace dev server.                        |
| `build`                         | `turbo run build` for every workspace (e1-4 runs `prisma generate` first). |
| `build:pages`, `build:pages:*`  | Old Cloudflare Pages static builds.                                        |
| `lint`, `typecheck`, `test`     | Turbo fan-out. `typecheck` = `next typegen && tsc --noEmit` per app.       |
| `test:e2e`                      | Playwright smoke suite for e1-4 (needs a real Supabase test project).      |
| `format`, `format:check`        | Prettier over the whole repo.                                              |
| `check`                         | lint + typecheck + test + build + format check (what CI runs).             |

`apps/e1-4-com` additionally has `prisma:generate|migrate|deploy|studio`, `test:live`
(a suite that talks to real backends) and a `postinstall` that runs `prisma generate`.

## 4. Prisma models (`apps/e1-4-com/prisma/schema.prisma`)

`User` (voice identity profile: handle, avatarPath), `VoiceStream` (one per user),
`VoiceSegment` (index, audioPath, mimeType, durationMs, transcription + status,
speakerVerified), `Share` (unlisted links), `Conversation`, `ConversationMember`,
`VoiceNote` (Talk), `Board` (chalkboard/gravity), `AiUsageEvent` + `AiBudgetAlert`
(Da Vinci spend tracking), `Contact`, `Session`, `Voiceprint`, `LoginEvent`.
Enums: `TranscriptionStatus`, `AiTier`.

Seven migrations exist, from `0_init` to `20261001090000_segment_speaker_verified`.
`20260930094211_voice_only_identity` removed the email/OAuth path. RLS policies live in
`apps/e1-4-com/supabase/migrations`.

The brief's `VoiceStream { id, userId, createdAt }` / `VoiceSegment { id, streamId,
startedAt, durationMs, storageKey, transcript? }` are already present under slightly
different column names (`audioPath`, `transcription`); no new migration is needed for P1-6.

## 5. Routes

### earth1.co (`apps/earth1-co/src/app`)

`/` (Cicero hero + De Finibus passage + featured equations), `/quantum-mechanics`,
`/quantum-computing`, `/people/[slug]` (37 profiles), `/equations`, `/founder`,
`/[pillar]` for `mathematics`, `physics`, `research`, `philanthropy`,
`global-citizenship` (title + one line only, except research), `sitemap.xml`, `robots.txt`,
`opengraph-image.png`. Nav is a bottom link row (`components/Nav.tsx`); there is no footer.

### e1-4.com (`apps/e1-4-com/src/app`)

Pages: `/`, `/login`, `/profile`, `/stream`, `/talk`, `/talk/[id]`, `/talk/contacts`,
`/talk/join/[token]`, `/davinci`, `/chalkboard`, `/gravity`, `/horizon`, `/journey`,
`/superposition`, `/privacy`, `/s/[token]` (public share), `/u/[handle]` (`/@handle` rewrite).
API: `/api/voice-id`, `/api/stream/segments[...]`, `/api/share/...`, `/api/talk/...`,
`/api/davinci/{draw,talk,translate}`, `/api/gravity/superpose`, `/api/stt/live`,
`/api/account/export`.

## 6. e1-4 auth today

Voice-only, in-house. `/api/voice-id` + `src/lib/voiceprint` compute a spectral voiceprint
on the device, match it server-side against stored prints and self-enrol unknown voices.
Sessions are app-owned rows (`Session` model), not Supabase Auth. Supabase is used for
Postgres and Storage only. `docs/VOICE_AUTH.md` lists the known limits (no liveness,
one-to-many matching, no recovery path). PR #62 is hardening this.

## 7. Open PRs and branches from Devin

Open PRs at takeover: none from Devin. Open today: #62 (voice sign-in, Claude), #64
(earth1 unit tests, Claude). Merged recently: #54, #59, #60, #61, #63.

Forty `devin/*` branches remain on the remote (all merged or superseded); per the brief
none were deleted. Highest-numbered: `devin/1790763416-solar-beads-logo` (PR #60).
Older Claude branches: `claude/e1-4-1-auth-and-saving` (#62), `claude/project-thread-*`.

## 8. Known breakages and risks

- **CI Playwright job is red on every PR**: `.github/workflows/ci.yml` `e2e` job fails its
  "Check e2e secrets are configured" step because `NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` are not repository secrets.
  The `check` and `davinci` jobs are green.
- **Third-party AI keys in e1-4 product code**: `src/lib/llm/{anthropic,openai}.ts`,
  `src/lib/stt/deepgram.ts` and `.env.example` still carry OpenAI / Anthropic / Deepgram
  fallbacks. The brief says Da Vinci only. Owned by the e1-4 thread; logged in `QUESTIONS.md`.
- **Two deployment stories**: `DEPLOYMENT.md` and `wrangler.toml` describe Cloudflare Pages
  static exports; `vercel.json` in both apps describes Vercel. The brief says Vercel.
- **Logo is a PNG**: `packages/ui/src/Logo.tsx` renders `/brand/*.png` from each app's
  `public/`; there is no SVG mark. The brief's earth1 cross-in-rings mark (P1-4) replaces it.
- **Quotes have no `verified` flag**: `apps/earth1-co/src/lib/library/types.ts` `Quote` has
  `text`, `source`, `caveat`; unsourced sayings go to `notes`. The brief's `verified`
  gate is added in P2-7.
- **Equations are plain Unicode strings**, not KaTeX; `katex` is a dependency of e1-4 only.
- **`apps/e1-4-pages` reaches into `apps/e1-4-com/src`** with a relative import; it
  builds, but it is dead weight if Vercel serves `e1-4-com`.
- No `services/engine` and no `python` job for it in CI (the `davinci` job covers only
  `apps/davinci`).

## 9. Commands

| Task               | Command                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install            | `npm ci` (root; Node 22). Engine: `cd services/engine && pip install -e ".[dev]"`.                                                                                     |
| Dev earth1         | `npm run dev:earth1` → http://localhost:3001                                                                                                                           |
| Dev e14            | `npm run dev:e1-4` → http://localhost:3000 (needs `apps/e1-4-com/.env.local`)                                                                                          |
| Dev engine         | `cd services/engine && uvicorn main:app --reload` → http://localhost:8000                                                                                              |
| Build              | `npm run build` (all) · `npx turbo run build --filter=earth1-co` (one app)                                                                                             |
| Lint               | `npm run lint` · Python: `ruff check .` in `services/engine` or `apps/davinci`                                                                                         |
| Typecheck          | `npm run typecheck` · Python: `mypy .`                                                                                                                                 |
| Test JS            | `npm run test` (Vitest) · `npm run test:e2e` (Playwright, e1-4, needs Supabase test project)                                                                           |
| Test Python        | `cd services/engine && pytest -q` · `cd apps/davinci && pytest -q`                                                                                                     |
| Format             | `npm run format:check` / `npm run format`                                                                                                                              |
| Prisma             | `npm run prisma:generate -w e1-4-com` · `npm run prisma:migrate -w e1-4-com` (local DB only) · `npm run prisma:deploy -w e1-4-com` (never against prod from a session) |
| Everything CI runs | `npm run check`                                                                                                                                                        |
