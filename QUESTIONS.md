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
  **Default: A.** On the e1-4 side, #76 merges first and #77 to #80 then retarget to `main`.
  #67, #77 and #78 all edit `.github/workflows/ci.yml`, so whichever merges second and third
  will need a base merge before it can land; expect that, not a redesign.

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

## PR #76 to #80: e1-4 stream, deletion, storage, avatars, scaffolds

Opened by the e1-4 thread. Three decisions came out of that work.

### Q1. Stream beads have no visible text: scrub and transcript

The brief asks for a timeline with scrub, play and an animated transcript reveal synced to
playback, with zero visible text. The beads currently play but cannot be scrubbed, and no
transcript shows.

- A. Add a scrub control and a transcript reveal that is aria-only: screen readers get the words,
  sighted users get motion and sound.
- B. Add scrub and an on-screen transcript reveal, which breaks the zero-visible-text rule.
- C. Leave the beads as they are.
  **Default: A**, in a follow-up PR; it keeps the rule and still delivers the brief's timeline.

### Q2. Deepgram, OpenAI and Anthropic fallbacks still in `apps/e1-4-com`

This is #62's Q1 (`src/lib/stt` and `src/lib/llm`), not repeated here. The e1-4 thread adds a
timing choice to it:

- A. Remove them now in a `chore/` PR, so only the Da Vinci gateway remains and e1-4 has no
  transcripts until Da Vinci ships.
- B. Keep them behind `STT_PROVIDER` and `LLM_PROVIDER` flags, off by default, until Da Vinci
  is ready, then remove.
  **Default: A**, since the brief rules out third-party AI in e1-4 product code and the
  transcriber is an interface the dev adapter already satisfies. Answer under #62's Q1 and both
  threads will follow it.

### Q3. `/talk`, `/profile` and the 2D to 5D pages are text-heavy

They predate the zero-visible-text rule and show headings and paragraphs.

- A. Rebuild each as voice-only (icons, motion, sound, aria labels), one PR per page.
- B. Keep their text as the one documented exception.
- C. Remove them from navigation now and rebuild them under A as budget allows.
  **Default: C.** It is a small, reversible change that stops the rule being broken in production
  while the voice-only versions are built.
