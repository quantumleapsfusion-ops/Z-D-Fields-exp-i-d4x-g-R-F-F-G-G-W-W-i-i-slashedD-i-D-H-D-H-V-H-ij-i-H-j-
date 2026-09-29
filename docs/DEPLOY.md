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

> The app derives the OAuth callback as `${NEXT_PUBLIC_SITE_URL}/auth/callback`
> (`apps/e1-4-com/src/lib/auth/actions.ts`). Supabase rejects callbacks that are not on its
> Redirect URL allow-list, so the two lists below must stay in sync.

## 3. OAuth redirect URLs

### Supabase -> Authentication -> URL Configuration

- **Site URL**: `https://e1-4.com`
- **Redirect URLs** (add every one):
  - `https://e1-4.com/auth/callback`
  - `https://www.e1-4.com/auth/callback`
  - `https://*-<vercel-team-slug>.vercel.app/auth/callback` (wildcard for Preview deployments)
  - `http://localhost:3000/auth/callback`

### Providers (Google / Facebook / Microsoft consoles)

The redirect URI registered with each identity provider is Supabase's, not ours, and does **not**
change between environments:

```
https://<prod-project-ref>.supabase.co/auth/v1/callback
```

If you use a separate Supabase project for staging, register that project's callback too.

## 4. Database

Migrations are not run by the Vercel build (the build only does `prisma generate`). Apply them
once per Supabase project from a trusted machine with `DIRECT_URL` set:

```bash
cd apps/e1-4-com
npm run prisma:deploy                          # prisma/migrations (v1 then v2, in order)
supabase link --project-ref <ref> && supabase db push   # supabase/migrations (RLS + buckets)
```

## 5. Smoke check after the first deploy

```bash
E2E_BASE_URL=https://e1-4.com npm run test:e2e   # public surfaces; add E2E_STORAGE_STATE for the signed-in flow
npm run test:live                                # real Supabase: auth trigger, RLS, buckets, share, hardDeleteUser
```

`test:live` needs the Supabase env vars (service role included) and creates/destroys throwaway
`devin-e2e-*@example.com` users. Set `LIVE_BASE_URL=http://localhost:3000` with a dev server running
to also cover the logged-out share page. Note: deleting an auth user any other way (dashboard,
`auth.admin.deleteUser`) leaves its `public.users` row behind — there is no FK to `auth.users`; only
`hardDeleteUser` removes everything.

Then by hand: sign in with each provider, upload an avatar, record a Voice Stream segment, create a
share link and open it in a private window.
