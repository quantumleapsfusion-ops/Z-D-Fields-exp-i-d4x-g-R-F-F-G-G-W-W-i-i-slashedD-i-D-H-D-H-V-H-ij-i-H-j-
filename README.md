# e1-4.com

Marketing landing page for **e1-4.com** ("earth life-forms"), the flagship product of **Earth One
Global Coalescent**. Its sibling philosophy site is [earth1.co](https://earth1.co).

Motto: _Think._ — four ways to speak.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3
- `next/font` — Fraunces (serif display) and Space Grotesk (sans UI/body)
- ESLint + Prettier, GitHub Actions for lint + build

## Requirements

- Node.js 20+ (verified on Node 20 in CI and Node 24 locally)
- npm 10+

## Setup and run

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:3000
npm run build        # production build
npm start            # serve the production build
```

Quality checks (the same commands CI runs):

```bash
npm run lint         # ESLint via next lint
npm run format:check # Prettier check (npm run format to fix)
npm run typecheck    # tsc --noEmit
npm run build
```

## Brand system

| Token        | Hex       | Use                |
| ------------ | --------- | ------------------ |
| `blackboard` | `#0e1a13` | background         |
| `chalk`      | `#f1ede1` | foreground / text  |
| `dust`       | `#93a294` | muted text, labels |
| `ochre`      | `#d3a34c` | accent / CTA       |

Colours are declared once in `app/globals.css` as space-separated RGB channels and mapped into the
Tailwind theme, so opacity modifiers such as `text-chalk/70` work.

The placeholder brand mark (`components/GlyphMark.tsx`) is a Ψ set over a π, divided by a hairline
rule, with `chalk` (chalk-on-chalkboard) and `outline` (white outline on black) variants. The
favicon lives at `public/icon.svg`; the Open Graph image is generated at `app/opengraph-image.tsx`.

## Structure

```
app/
  layout.tsx            fonts, metadata, OG/Twitter tags
  page.tsx              landing page composition
  opengraph-image.tsx   generated OG image
  globals.css           palette + base layer
components/             Nav, Hero, Features, FeatureBlock, CTA, Footer, GlyphMark, Waveform
lib/site.ts             site constants and landing-page copy
public/icon.svg         favicon / brand mark
```

Landing copy lives in `lib/site.ts` and is intentionally verbatim, including the parenthetical
codename sets — do not auto-correct the spellings.

## Scope

This pass is the marketing landing page only. Auth, database, Voice Stream recording, transcription
and the advanced canvas features are out of scope, but the app is structured (route-per-surface App
Router, content separated from components) so they can be added later.
