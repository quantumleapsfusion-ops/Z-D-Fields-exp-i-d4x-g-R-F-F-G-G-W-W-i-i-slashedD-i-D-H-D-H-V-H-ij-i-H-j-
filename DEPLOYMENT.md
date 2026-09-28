# Cloudflare Pages launch

The existing repository contains a Next.js 16 server-backed application that uses
Prisma, Supabase and server actions. The first release instead publishes two independent
static exports. Cloudflare [supports multiple Pages projects connected to one monorepo](https://developers.cloudflare.com/pages/configuration/monorepos/).
Each project gets its own domain; no host middleware or Worker is required. Git
integration redeploys both on pushes to `main` and creates preview deployments for PRs.

## 1. Check the builds locally

Use Node 22 and npm 10:

```bash
npm install
npm run build:pages
```

Outputs: `apps/e1-4-pages/out` and `apps/earth1-co/out`, each containing `index.html`,
`icon.svg`, and `_next` assets. No environment variables are required.

## 2. Connect both Pages projects

Sign in to [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages),
select **Create application → Pages → Import an existing Git repository**, and authorize
this repository. Create **two** projects with these settings:

| Setting                  | e1-4.com                           | earth1.co                          |
| ------------------------ | ---------------------------------- | ---------------------------------- |
| Project name             | `e1-4-landing`                     | `earth1-landing`                   |
| Production branch        | `main`                             | `main`                             |
| Root directory           | repository root (leave blank)      | repository root (leave blank)      |
| Framework preset         | Next.js (Static HTML Export)       | Next.js (Static HTML Export)       |
| Build command (override) | `npm run build:pages:e1-4`         | `npm run build:pages:earth1`       |
| Build output directory   | `apps/e1-4-pages/out`              | `apps/earth1-co/out`               |
| Node version             | `22` (`NODE_VERSION=22` if needed) | `22` (`NODE_VERSION=22` if needed) |

Leave the install command at its default (`npm install`); installation must happen at
the repository root so npm workspaces resolve `@earth-one/ui`. Do not select the
full-stack Next.js preset, which targets the separate server app. The per-app
`wrangler.toml` files mirror the output directories for optional direct upload from
their workspace directories; the Git-connected Pages project settings above govern
normal automatic deployments. If Pages offers to use one of those configs as its
source of truth, check that its project name and output directory match this table.

Once connected, commits to `main` deploy both projects automatically. A PR branch
gets preview builds; check both `*.pages.dev` URLs before merging. Cloudflare
[documents the static export settings here](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/).

## 3. Attach the domains

In the `e1-4-landing` Pages project, open **Custom domains → Set up a domain**,
enter `e1-4.com` and activate. Repeat in `earth1-landing` for `earth1.co`.
If desired, add `www.e1-4.com` and `www.earth1.co` to the corresponding project, then
add redirects to the apex domains. Cloudflare automatically creates DNS records
when the zone is active **in the same account**; if the apex domain is not already
an active Cloudflare zone, first add it and point the registrar's nameservers to
Cloudflare. Check DNS propagation and the custom domain status before announcing
the sites live. Follow [Cloudflare's custom domain guide](https://developers.cloudflare.com/pages/configuration/custom-domains/)
if a domain remains pending.

In each zone's **SSL/TLS → Overview**, choose **Full (strict)** when its origin
certificate is valid; otherwise use **Full** as requested while resolving the origin
certificate. Cloudflare Pages provisions the edge certificate after the domain is
attached. Under **SSL/TLS → Edge Certificates**, enable **Always Use HTTPS**.

## 4. Environment variables and later app features

The two landing projects need **no secrets**. If you later deploy the server app to
a compatible runtime, add variables from `apps/e1-4-com/.env.production.example` under
that project's **Settings → Environment variables**, separating Production and
Preview values. Keep `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, and
STT/LLM API keys server-only. Configure Supabase OAuth redirects and migrations as
described in `docs/DEPLOY.md` before enabling interactive features. Never enter
server-only secrets in the static Pages projects.

## 5. Verify production

Visit `https://e1-4.com` and `https://earth1.co`: confirm the correct title, brand
mark, favicon, and links to the other domain in header, content and footer. Check
`https://e1-4.com/icon.svg` and `https://earth1.co/icon.svg`. If either host does
not resolve, verify the zone nameservers, Pages custom domain status and DNS record
in its Cloudflare dashboard before changing application code.
