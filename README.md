# Earth One / e1-4

An npm workspace with two launch-ready static Next.js sites and a separate server-backed
e1-4 application for the later Supabase launch. Requires Node 22 (`.nvmrc`) and npm 10.

| Site                           | Workspace         | Local port | Cloudflare Pages output              |
| ------------------------------ | ----------------- | ---------- | ------------------------------------ |
| [e1-4.com](https://e1-4.com)   | `apps/e1-4-pages` | 3002       | `apps/e1-4-pages/out`                |
| [earth1.co](https://earth1.co) | `apps/earth1-co`  | 3001       | `apps/earth1-co/out`                 |
| Future interactive app         | `apps/e1-4-com`   | 3000       | Not part of the static Pages release |

The two public sites link to each other in navigation, their main content and footers.
They use the shared chalkboard tokens and Ψ-over-π mark from `packages/ui`. Each site has
its own metadata and icon. The launch is intentionally static: there is no authentication,
recording or database operation on the Pages sites.

## Local development

```bash
npm install
npm run dev:pages:e1-4  # http://localhost:3002
npm run dev:earth1      # http://localhost:3001 (in another terminal)
npm run build:pages     # build both Pages exports without env vars
npm run build           # build all workspaces, including the future app
npm run lint
npm run typecheck
npm run test
npm run format:check
```

The optional future app uses `apps/e1-4-com/.env.example`. Copy it to
`apps/e1-4-com/.env.local` and fill in the Supabase credentials before enabling its
server-backed features. The root `.env.example` lists those keys for reference.
**Neither Pages landing build needs any Supabase, STT or LLM keys.**

## Publish today

See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact Cloudflare Pages setup, domain
attachment, SSL, and verification steps. Two Pages projects connected to this same
GitHub repository rebuild automatically on pushes to `main`. The root `npm run
build:pages:e1-4` and `npm run build:pages:earth1` commands produce their respective
static output directories.

The full application uses Next.js server actions and Prisma. It cannot be served by
these static exports; deploy it separately when the Supabase features are ready.
