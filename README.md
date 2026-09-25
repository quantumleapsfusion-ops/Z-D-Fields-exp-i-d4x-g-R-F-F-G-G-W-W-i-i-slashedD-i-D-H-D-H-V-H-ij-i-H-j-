# e1-4.com

**e1-4** — _earth life-forms_ — is a voice-only social network: you speak, and transcription,
translation and visuals follow. Every person gets an audio diary through Voice Stream. e1-4 is a
product of [Earth One Global Coalescent](https://earth1.co).

Build plan and owner questions: [`PLAN.md`](./PLAN.md). Spell the name exactly `e1-4`; the only
tagline is `earth life-forms`.

## What ships, and how mature it is

| Surface             | Route         | Status                     | Notes                                                                                    |
| ------------------- | ------------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| Voice Stream        | `/stream`     | **Production-ready**       | One continuous stream per user; record/pause/resume/stop; timeline; sharing; hard delete |
| Infinity Chalkboard | `/chalkboard` | **Production-ready (2D)**  | Infinite pan/zoom Konva canvas, drawing primitives, voice placement, autosave            |
| Infinity 3D / 4D    | `/chalkboard` | Experimental / future      | 3D is a read-only Three.js view behind a flag; 4D is a documented placeholder            |
| Da Vinci            | `/davinci`    | Early access               | Live animated transcription works everywhere; LLM visuals need a key (stub otherwise)    |
| Gravity Board       | `/gravity`    | Experimental, **flag OFF** | Superposition of LLM/random interpretations + 2D→3D collapse mock-up; no 4D walk-in      |

Codenames are kept verbatim in `lib/site.ts` (including their spellings — do not auto-correct):
`Inteligence // ARI // Stochastic I // Schroodinger`, `Speech to Text // Binary // Sparks // Big-Bang`,
`Topologoical Black Hole // Event Horizon // Superposition // Quantum`.

## Stack

- Next.js 15 (App Router, Server Actions) + TypeScript + Tailwind CSS 3
- `next/font/local` — TeX Gyre Adventor (display, self-hosted from `brand/fonts`); system UI stack for body
- Installable PWA — `app/manifest.ts`, `public/sw.js` (shell cache + `/offline` fallback), Apple touch icon
- NextAuth.js v4 — Google, Facebook, Microsoft (Entra ID) OAuth, all env-driven; optional dev login
- Prisma 6 + PostgreSQL
- Object storage behind `lib/storage` — local filesystem (dev) or S3-compatible (AWS S3 / Cloudflare R2)
- Speech-to-text behind `lib/stt` — Deepgram or OpenAI Whisper (batch), Deepgram live or browser Web Speech (live)
- LLM behind `lib/llm` — Anthropic Claude or OpenAI GPT-4o
- Konva (`react-konva`) for 2D canvases, Three.js for 3D experiments

## Requirements

- Node.js 20+ and npm 10+
- PostgreSQL 14+ (or Docker)

## Local setup (exact commands)

```bash
# 1. Database (skip if you already have Postgres)
docker run -d --name e14-pg -e POSTGRES_USER=e14 -e POSTGRES_PASSWORD=e14 -e POSTGRES_DB=e14 \
  -p 5432:5432 postgres:16-alpine

# 2. Environment
cp .env.example .env
# set NEXTAUTH_SECRET, e.g.:  openssl rand -base64 32
# AUTH_DEV_LOGIN="true" lets you sign in locally with any email (no OAuth app needed)

# 3. Install (also runs `prisma generate`) and apply migrations
npm install
npm run db:deploy        # prisma migrate deploy  (use `npm run db:migrate` when changing the schema)

# 4. Run
npm run dev              # http://localhost:3000
# or, production mode (dev login is disabled here — configure at least one OAuth provider)
npm run build && npm start
```

Quality checks (the same commands CI runs in `.github/workflows/ci.yml`):

```bash
npm run lint             # ESLint via next lint
npm run format:check     # Prettier (npm run format to fix)
npm run typecheck        # tsc --noEmit
npm run build            # prisma generate && next build
```

## Environment variables

All keys are documented in `.env.example`. Only `DATABASE_URL` and `NEXTAUTH_SECRET` are required;
everything else degrades gracefully when absent.

| Variable                                                                                                   | Required | Purpose                                                        |
| ---------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `DATABASE_URL`                                                                                             | yes      | PostgreSQL connection string                                   |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL`                                                                          | yes      | NextAuth session signing / canonical URL                       |
| `AUTH_DEV_LOGIN`                                                                                           | no       | `true` enables email-only sign-in outside production           |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                                 | no       | Google OAuth (button hidden if unset)                          |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`                                                             | no       | Facebook OAuth                                                 |
| `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`                                       | no       | Microsoft OAuth                                                |
| `STORAGE_DRIVER`, `STORAGE_LOCAL_DIR`                                                                      | no       | `local` (default, dev) or `s3`                                 |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | for `s3` | AWS S3 or Cloudflare R2                                        |
| `STT_PROVIDER`, `DEEPGRAM_API_KEY`, `DEEPGRAM_MODEL`, `OPENAI_API_KEY`, `OPENAI_WHISPER_MODEL`             | no       | Segment transcription + Deepgram live streaming                |
| `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_MODEL`                                     | no       | Da Vinci visuals/translate, Gravity Board superposition        |
| `NEXT_PUBLIC_FEATURE_GRAVITY_BOARD`                                                                        | no       | `true` to enable the Gravity Board (default `false`)           |
| `NEXT_PUBLIC_FEATURE_CHALKBOARD_3D`, `NEXT_PUBLIC_FEATURE_CHALKBOARD_4D`                                   | no       | Enable the experimental 3D view / 4D placeholder (default off) |

`NEXT_PUBLIC_*` flags are inlined at build time — rebuild after changing them.

### Degradation without keys

- **No OAuth keys** → only providers with both ID and secret are shown; dev login covers local use.
- **No STT key** → Voice Stream still records, stores and plays; segments are marked "not transcribed"
  and can be retried later. Live surfaces fall back to the browser Web Speech API (Chrome/Edge/Safari),
  and every live surface also accepts typed input.
- **No LLM key** → Da Vinci draws with a small keyword sketcher (labelled "Stub sketcher"), translate is
  disabled; Gravity Board samples interpretations with a random stub.

## Features

### Voice Stream (production-ready)

- Model: one `VoiceStream` per user; ordered `VoiceSegment` rows (`index`, `audioKey`, `durationMs`,
  `startedAt`/`endedAt`, `transcription`, `transcriptionStatus`). Unique `(streamId, index)`.
- Recorder (`features/voice-stream/useRecorder.ts`): MediaRecorder with record / pause / resume / stop.
  Every pause or stop closes a span that is uploaded and appended to the same stream — never a post.
- Upload (`POST /api/stream/segments`): blob is written to storage first, then the row is committed;
  transcription runs after the response and the client polls until it lands.
- Timeline: vertical, grouped by day; one continuous player with a single scrubber across all segments.
- Sharing: `Share` rows with random tokens → `/s/<token>` (whole stream or one segment; audio and/or
  transcript; revocable).

### Infinity Chalkboard (2D production-ready; 3D/4D experimental)

- `features/chalkboard/Board2D.tsx`: infinite canvas — wheel/trackpad zoom around the pointer, Pan tool
  or hold Space, chalk pen, line, arrow, box, ellipse, text, eraser, select/move, undo/redo, 7 chalk colours.
- Voice: finalised phrases are placed at the ochre voice cursor; "draw a circle / box / arrow / line" and
  "undo" are recognised as commands.
- Boards are saved (debounced) as JSON documents on `Board` via Server Actions (`app/actions/boards.ts`).
- 3D (`NEXT_PUBLIC_FEATURE_CHALKBOARD_3D`): read-only Three.js projection with orbit controls, element
  creation time as depth, and a time slider. 4D (`NEXT_PUBLIC_FEATURE_CHALKBOARD_4D`): placeholder only.

### Da Vinci (early access)

- Live transcription rendered as typography: words ink in, questions lean, exclamations warm to ochre,
  numbers set in mono, older phrases recede.
- Visual loop: after each pause in speech, `POST /api/davinci/draw` asks the LLM for incremental,
  schema-validated drawing ops (`lib/davinci/ops.ts`) which animate onto a Konva canvas.
- Translate: `POST /api/davinci/translate` through the same LLM interface.

### Gravity Board (experimental, off by default)

- Density heuristic over the transcript; crossing the event horizon (0.7) triggers the stochastic step.
- `POST /api/gravity/superpose` samples four distinct interpretations at temperature 1.0 (or a random
  stub), shown simultaneously until the user picks one or asks the board to resolve (heuristic).
- Three.js particle mock-up: the flat transcript collapses through a black-hole core into the chosen
  topology (sphere, torus, knot, spiral, wave, lattice). **A walk-in 4D spacetime is future work.**

## Privacy (GDPR / CCPA scaffolding)

- `/privacy`, `/terms` and `/content-policy` are drafts pending counsel. `/settings` offers
  **Download my data** (JSON export), **Destroy all my voice data** (typed `DESTROY` confirmation;
  removes every segment's audio, transcript and share link, keeps the account) and **Delete my account**.
- `components/CookieConsent.tsx` — essential-only vs allow-all, stored in `localStorage` (`e1-4:consent`).
- Hard delete (`lib/privacy/hard-delete.ts`) removes every storage object (segment audio, avatar, and
  a sweep of the user's key prefix) and then the database rows (cascading streams, segments, shares,
  boards, sessions, accounts). Segment and whole-stream deletes use the same routine.
- Audio is never public unless the owner creates a share link; revoking deletes the link.

## Structure

```
app/
  page.tsx, layout.tsx, opengraph-image.tsx   landing + metadata
  signin/ profile/ privacy/                   app shell
  stream/ s/[token]/                          Voice Stream + public shares
  davinci/ chalkboard/ gravity/               feature surfaces
  actions/                                    Server Actions (profile, stream, boards)
  api/                                        auth, avatar, account export, stream, share, davinci, gravity, stt/live (Deepgram token)
brand/                                        supplied brand kit: logo/ (PNG lockups, mark, favicons, OG), fonts/ (Adventor), tokens.css
public/brand/                                 web-served copies of brand/logo
components/                                   Logo/Lockup/Tagline (supplied PNGs), Nav, Footer, PageShell, DemoStream, CookieConsent, LegalPage
features/                                     client feature code (live STT, voice-stream, davinci, chalkboard, gravity)
lib/                                          env, flags, auth, db, storage, stt, llm, privacy, voice, chalkboard, gravity, site copy
prisma/                                       schema + migrations
```

## Brand system

Assets live in `brand/` exactly as supplied — never redraw, recolour, stretch or shadow them.
Tokens are declared in `brand/tokens.css` (light + dark via `prefers-color-scheme`) and mapped into
Tailwind in `app/globals.css` / `tailwind.config.ts`:

| Tailwind     | Light               | Dark      | Use                                               |
| ------------ | ------------------- | --------- | ------------------------------------------------- |
| `blackboard` | `#FFFFFF`           | `#0B0E0D` | background                                        |
| `surface`    | `#F5F5F7`           | `#161A19` | cards, inputs                                     |
| `chalk`      | `#202124`           | `#F5F5F7` | text, hairlines                                   |
| `dust`       | `#5F6368`           | `#AAAEB4` | secondary text                                    |
| `spec-*`     | red…violet spectrum | same      | accents only: mark, recording, progress, Da Vinci |

The UI is monochrome; the spectrum never colours chrome. Display type is Adventor with `tracking-display`
(0.01em). Lockup ≥160px wide, mark ≥24px tall. Favicon: `app/favicon.ico`; OG image:
`public/brand/og-image_1200x630.png`.
