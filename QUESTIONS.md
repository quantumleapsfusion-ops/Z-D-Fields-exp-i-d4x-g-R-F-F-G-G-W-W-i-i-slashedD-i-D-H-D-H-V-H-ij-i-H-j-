# QUESTIONS.md

Open decisions for the owner, one section per PR. Each is written as options; the PR picks a
default and says which, so nothing waits on an answer.

PR #62 adds its own sections to this file (third-party speech-to-text in e1-4, liveness,
voice matching, the Playwright CI secrets, production migrations, and the monorepo layout).
Those are not repeated here; when both PRs merge, keep both sets of sections.

## PR #66: E1-4 Engine hosting

`services/engine` builds and tests, and has a Dockerfile, but nothing deploys it.

- A. Run it next to Da Vinci on the same GPU box with Docker Compose behind Caddy, as
  `apps/davinci/deploy` already does.
- B. A small container host (Fly.io, Render, Railway) on its own.
- C. Vercel Python functions next to the two sites.
  **Default: none chosen; nothing deployed.** A is cheapest if the box is already running.

## PR #70 and #71: how strict "verified" is

Every quote marked `verified: true` was matched to a named work, section and, for
translations, a translator. The wording was checked against well-known editions from memory,
not by opening a scan of each page during this session.

- A. Accept this standard and fix any reported error.
- B. Require a link to a scan or page number for every quote before it goes live.
- C. Hide every quote until you or an editor has checked each one.
  **Default: A.** Unverified sayings are kept in the data with `verified: false` so they are
  never re-added by mistake.

## PR #68 to #72: merge order

The earth1 PRs are stacked: #68 logo, then #69 home, #70 sections, #71 global citizenship,
#72 footer and metadata. #67 (CI) is stacked on #66 (engine).

- A. Merge in that order; each PR's base switches to `main` as the one below merges.
- B. Squash the stack into one PR.
  **Default: A.**

## earth1.co navigation length

With Chemistry and Biology added, the bottom nav row has eleven links.

- A. Keep one flat row (current).
- B. Group into "Library" (sciences, equations) and "Earth 1" (research, philanthropy,
  global citizenship, founder).
  **Default: A.**

## Leftovers from the Cloudflare Pages launch

`apps/e1-4-pages`, both `wrangler.toml` files and `DEPLOYMENT.md` describe a static Cloudflare
Pages setup, while both apps also have `vercel.json` and the brief says Vercel.

- A. Remove the Pages app and docs in a `chore/` PR once you confirm Vercel serves both domains.
- B. Keep them as a fallback.
  **Default: B until confirmed.** Nothing was deleted.
