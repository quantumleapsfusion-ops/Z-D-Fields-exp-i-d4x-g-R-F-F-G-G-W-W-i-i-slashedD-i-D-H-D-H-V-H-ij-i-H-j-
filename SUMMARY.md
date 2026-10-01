# SUMMARY.md

Takeover session of 2026-10-01, run from the owner's master brief. Every change is a PR
against `main`; nothing was merged, pushed to `main`, deployed, or run against a database.

## Completed (this thread: P0 tasks 1–3, earth1 tasks 4, 5, 7, 8, 11)

| Brief task              | PR                                                                                                                                 | What it does                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-1 audit              | [#65](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/65) | `AUDIT.md`: stack, which app serves which domain, scripts, Prisma models, routes, auth, Devin branches, known breakages, §9 commands.                                                                       |
| P0-2 scaffold           | [#66](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/66) | `services/engine` FastAPI app (`/`, `/health`), CORS locked to localhost and the two domains, 4 tests, Dockerfile. No Python was in any `.tsx` and no placeholder hero existed, so nothing needed removing. |
| P0-3 CI                 | [#67](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/67) | Adds an engine job (ruff, mypy, pytest) to the existing workflow. Stacked on #66.                                                                                                                           |
| P1-4 logo               | [#68](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/68) | `Earth1Mark` SVG in `packages/ui` and `favicon.svg`, used in the earth1 header.                                                                                                                             |
| P1-5 home               | [#69](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/69) | Cicero's De Finibus I.32–33 as the hero, ringed by six KaTeX equations; KaTeX also on `/equations`. Stacked on #68.                                                                                         |
| P2-7 sections           | [#70](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/70) | `packages/content` with the brief's schema and a tested verified-quote rule; `/chemistry`, `/physics`, `/biology`, `/mathematics`; the rule also gates the quantum library's quotes. Stacked on #69.        |
| P2-8 global citizenship | [#71](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/71) | Augustine, Locke, Hume, Rousseau, Kant, Hegel, Foucault, plus Asimov and Douglas Adams. Stacked on #70.                                                                                                     |
| P3-11 nav and SEO       | [#72](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/72) | Footer, per-page Open Graph. Sitemap and robots already existed and now list 49 URLs. Stacked on #71.                                                                                                       |

## Other PRs in this takeover

| PR                                                                                                                                                                                                   | State  | Notes                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| [#61](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/61) earth1 quantum mechanics and computing library                    | Merged | 37 profiles, equations, double-slit and qubit demos.                                                              |
| [#62](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/62) e1-4 voice sign-in and saving                                     | Open   | Security fixes pushed; waits on production migrations and four GitHub secrets. Owned by the voice sign-in thread. |
| [#63](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/63) e2e test for the bead audio player                                | Merged |                                                                                                                   |
| [#64](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/64) unit tests for earth1-co and the spacetime signal                 | Open   | From another thread.                                                                                              |
| [#76](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/76) e2e for the voice front door, browser suite in CI without secrets | Open   | e1-4 thread. Merges first; #77 to #80 are stacked on it and retarget to `main` after.                             |
| [#77](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/77) e1-4 data deletion (task 9)                                       | Open   | One held press destroys everything; CI proves nothing remains. Edits `ci.yml`, as do #67 and #78.                 |
| [#78](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/78) e1-4 local storage for audio and avatars (task 6)                 | Open   | `STORAGE_PROVIDER=local` keeps files on disk in dev. Edits `ci.yml`.                                              |
| [#79](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/79) e1-4 profile and avatar (task 10)                                 | Open   | Avatars shrink on the device; the server checks type and bytes.                                                   |
| [#80](https://github.com/quantumleapsfusion-ops/Z-D-Fields-exp-i-d4x-g-R-F-F-G-G-W-W-i-i-slashedD-i-D-H-D-H-V-H-ij-i-H-j-/pull/80) e1-4 2D to 5D package scaffolds (task 12)                         | Open   | Typed contracts and a README per package, no implementation.                                                      |

The e1-4 thread owns tasks 6 (voice stream), 9 (data deletion), 10 (profile) and 12 (dimension
package scaffolds): PRs #76 to #80 above. Its three open decisions are in `QUESTIONS.md` under
"PR #76 to #80".

## Skipped or blocked

- **Playwright CI job** stays red on every PR until the four repository secrets exist (see #62's
  questions) or #76 lands, which runs the browser suite without them. The `check`, `davinci` and
  new `engine` jobs are the ones to watch.
- **App renames** to `apps/earth1` and `apps/e14` were not done: the current names build and
  deploy, and a rename would touch Vercel settings, which the brief rules out.
- **Search Console**: neither site is indexed yet; submitting `https://earth1.co/sitemap.xml` is
  a manual step for the owner.
- **Spend**: `/cost` is not available in this cloud session, so usage could not be measured
  here. Check it on the claude.ai usage page.

## Open questions (details in QUESTIONS.md)

1. Where to host the E1-4 Engine (default: not deployed).
2. Whether "verified" quotes need a scan link each (default: source + section is enough).
3. Merge order for the stacked PRs (default: bottom up).
4. Whether to group earth1's eleven nav links (default: keep flat).
5. Whether to delete the old Cloudflare Pages app and docs (default: keep until confirmed).
6. e1-4 stream beads: add an aria-only scrub and transcript reveal (default: yes, follow-up PR).
7. Deepgram, OpenAI and Anthropic fallbacks in e1-4: remove now or flag off until Da Vinci ships
   (default: remove now; decide under #62's Q1).
8. `/talk`, `/profile` and the 2D to 5D pages are text-heavy (default: drop from navigation,
   rebuild voice-only).

## Suggested next three tasks

1. Merge #65–#72 bottom up, and #76 then #77–#80 on the e1-4 side; then submit the earth1
   sitemap in Search Console.
2. Add the four test-project secrets so the Playwright job can go green, then land #62.
3. Give `/research` and `/philanthropy` real content through `packages/content`, the last two
   earth1 pages that are still a title and one line.
