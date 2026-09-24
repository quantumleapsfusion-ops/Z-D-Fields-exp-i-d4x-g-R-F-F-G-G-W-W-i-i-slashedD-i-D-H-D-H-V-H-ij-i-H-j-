# Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-

Monorepo for **e1-4.com**: the public marketing website and the companion
application.

## Structure

| Path                  | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `web/`                | Marketing website (Next.js 16, TypeScript, Tailwind CSS v4)      |
| `app/`                | Companion web application (Next.js 16, TypeScript, Tailwind v4)  |
| `.github/workflows/`  | CI: Prettier check, ESLint and production builds for both apps   |

Each project has its own `package.json` and lockfile and is installed
independently; the root `package.json` only holds Prettier and convenience
scripts.

## Requirements

- Node.js 20+ (CI uses 22)
- npm 10+

## Install

```bash
npm install          # root tooling (Prettier)
npm run install:all  # installs web/ and app/ from their lockfiles
```

Or install a single project:

```bash
npm ci --prefix web
npm ci --prefix app
```

## Run locally

```bash
npm run dev:web   # marketing site  -> http://localhost:3000
npm run dev:app   # application     -> http://localhost:3001
```

Both can run at the same time (different ports). Equivalent direct commands:

```bash
cd web && npm run dev
cd app && npm run dev -- --port 3001
```

## Build

```bash
npm run build      # both projects
npm run build:web
npm run build:app
```

Serve a production build with `npm run start --prefix web` (or `app`).

## Lint and format

```bash
npm run lint          # ESLint in web/ and app/
npm run format        # Prettier write
npm run format:check  # Prettier check (what CI runs)
```

## Website (`web/`)

Single landing page composed of `Hero`, `About`, `Features` (services) and
`Contact` sections in `web/src/components/`, plus branding placeholders:
site title and meta/Open Graph tags in `web/src/app/layout.tsx` and a
placeholder favicon at `web/src/app/icon.svg`. The contact form is not wired to
a backend yet.

## App (`app/`)

- `/login` — authentication placeholder; any credentials continue to the
  dashboard. Session helpers live in `app/src/lib/auth.ts` and should be
  replaced with a real provider (Auth.js, Clerk, Supabase, custom JWT, ...).
- `/dashboard` — home screen with placeholder metric cards.
- `app/src/components/` — shared components (`AppShell`, `Card`, `Button`).

`/` redirects to `/dashboard`.
