# QUESTIONS.md

Open decisions for the owner, one section per PR. Each is written as options; the PR picks a
default and says which, so nothing waits on an answer.

## PR #62: voice sign-in and saving

### Q1. Speech-to-text for liveness uses whatever is configured, including third-party STT

`src/lib/stt/index.ts` (on `main` before #62) picks Da Vinci first, then Deepgram, then Whisper
(OpenAI) if their keys are set. #62 only calls `getTranscriber()`. The brief says no third-party AI
in e1-4 product code.

- A. Keep as is: Da Vinci wins whenever `DAVINCI_URL` is set; the others are dormant fallbacks.
- B. Remove the Deepgram and Whisper transcribers (and `src/lib/llm/openai.ts`, `anthropic.ts`)
  in a separate `chore/` PR, so only Da Vinci remains. **Default assumed: A for #62; B as a
  follow-up PR if you confirm.**
- C. Keep the code but make `STT_PROVIDER=davinci` the only accepted value in production.

### Q2. Liveness when no speech-to-text is configured

- A. Fail open (current default): sign-in works, liveness is skipped and logged.
- B. Fail closed: `VOICE_LIVENESS=required` refuses every sign-in until STT exists.
  **Recommended for production**, set as an env var, not in code.

### Q3. Matching a voice against every stored print (1:N)

Signed out, the closest stored print within `MATCH_DISTANCE = 8.4` wins. False accepts grow with
the user count and the threshold was never measured on real voices.

- A. Keep 1:N and measure false-accept / false-reject on real recordings before launch.
- B. Switch to 1:1: the device remembers which stream it belongs to (a cookie or passkey) and the
  voice only confirms that one user.
- C. 1:N but only update the stored print after a liveness-checked match, with a cap on drift.
  **Default in #62: A, with C's "liveness-checked" part already in place because every signed-out
  match now passes liveness first.**

### Q4. An unknown voice while signed out

#62 now refuses it and shows a key (passkey) and a plus; the plus opens a new stream on purpose.

- A. Keep: explicit enrol tap.
- B. Enrol silently as before (a known person in a noisy room lands in an empty stream).
- C. Enrol silently but offer a merge when the voice later matches an older stream.

### Q5. Playwright CI secrets (resolved)

#76 runs the browser suite against a Postgres service container and an in-process storage fake,
so the e2e job no longer needs the four repository secrets and runs on this PR as on `main`.

### Q6. Migrations for #62 on production

`20261001090000_segment_speaker_verified` and `20261001100000_passkeys_and_liveness` must be
applied by you (`DEPLOYMENT.md` §5); nothing here runs them. Confirm after merging by opening
`/api/health` on production.

### Q7. Device binding: one account per device, voice-auth only on new phone

From Z (2026-10-01 18:35): "new device = voice only (strong anti-spoofing)." Signed-in on device A,
moving to device B requires re-authorization via voice. No code, no fallback step; voice
authentication is the sole guard against cross-device takeover.

- A. Implement: bind account to device fingerprint (UA, IP hash, display specs, or browser storage);
  sign-in on new device requires fresh voice liveness + anti-spoofing check (no second-step code).
- B. Defer to a later PR; for now, multi-device sign-in works after any successful voice sign-in.
  **Decided (Z, 2026-10-01 18:35): A. Voice-auth only, no fallback code. Escalates Q8 (SpeechBrain
  anti-spoofing) to critical-path blocker.**
- **GATE: Blocked on anti-spoofing evaluation (Q8) and legal compliance (Q9).**

### Q8. Voice authentication: choose between self-hosted (SpeechBrain) and third-party SaaS

Z's brief: "no third-party AI SDKs in e1-4 product code" (OpenAI, Anthropic, Gemini). Voiceprints
require strong anti-spoofing. **CRITICAL:** Q7 (device binding) is now voice-auth-only with no
fallback code. Anti-spoofing is the sole guard against cloned voices and cross-device takeover.

- A. Evaluate and integrate SpeechBrain ECAPA-TDNN (speaker verification) + AASIST (anti-spoofing).
  Self-hosted, no vendor API calls, no licensing cost. Requires model files and library setup.
  Report FAR/FRR on real user voices before production launch.
- B. Use das-Peak (Veridas) or IDVoice (ID R&D) managed service (documented in `docs/VOICE_AUTH.md`).
  Vendor handles FAR/FRR validation; requires credentials and vendor integration.
- C. Keep the in-house voiceprint as-is; rely on liveness (challenge-response) as interim anti-spoofing.
  **Decided (Z, 2026-10-02): A, evaluate SpeechBrain + AASIST. CRITICAL-PATH: must measure FAR/FRR
  on real voices before production, since voice auth is the only device-binding protection.**

### Q8a. Residual risk: device binding with voice-auth-only and no fallback code

Z decided (2026-10-01 18:35) that new devices authenticate via voice only, with no second-step code
or fallback. This shifts the entire account-takeover risk to anti-spoofing accuracy. If a cloned
voice passes the liveness + anti-spoofing check, the attacker signs in on a new device and owns the
account (no recovery without Z's manual intervention).

Risk factors:

- FAR (false-accept rate) on speaker verification must be very low (&lt;0.1% is typical vendor target)
- Liveness + anti-spoofing must reject realistic clones (AI voice synthesis, deepfakes, high-quality
  recordings under different acoustic conditions)
- SpeechBrain evaluation on real e1-4 user voices is critical before launch
- If anti-spoofing fails, users can lose accounts permanently

- A. Accept the risk. Implement device binding as voice-auth-only; measure FAR/FRR; improve based on
  real user data after launch. Document the residual risk in the privacy policy and account
  recovery terms.
- B. Add a fallback: voice-auth primary, but rate-limited passkey as secondary (user could sign in
  via passkey if they fear their voice has been cloned).
- C. Defer device binding until after SpeechBrain FAR/FRR is validated on a real user cohort.
  **Decided (Z, 2026-10-01 18:35): A. Voice-auth-only; log the risk; measure and iterate on real
  user data. Update privacy policy and account-recovery terms to document the single point of failure.**

### Q9. Voiceprint consent: UK GDPR special category, Illinois BIPA

Voiceprints are special-category personal data under UK GDPR (biometric). Illinois BIPA requires
explicit written notice and opt-in before collection. Z's hand-off (2026-10-01 18:32): "Play the
spoken consent script before enrolment; store the consent audio, time, policy version and device;
no voiceprint without it; withdraw consent destroys the voiceprint."

- A. Add pre-enrollment consent screen + spoken consent audio capture. Play script, record audio
  (with consent, time, version, device). Gate enrollment until consent is given. Detect IL users
  and either show written BIPA notice with sign-off, or exclude them. Block under-13s.
- B. Add privacy/terms pages (already required per Z's brief) and link them at sign-in; no separate
  consent flow.
- C. Consent is implicit in account creation; no explicit flow.
  **Default (Z, 2026-10-01 18:35 + 18:32 hand-off): A. Spoken consent script stored, written BIPA
  notice for IL (method TBD: notice + sign-off vs. exclude IL). Block under-13s. Voiceprints
  destroyed on deletion, withdrawal, or 3 years unused.**
- **GATE: Blocked. CRITICAL: Do NOT merge #62 until (1) privacy/terms published on earth1.co, (2) Z
  decides BIPA approach (notice vs. exclude), (3) consent flow is live. Currently e1-4.com landing
  page stores voice before consent/policies exist — a legal violation per Z's own requirement.**

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

## Monorepo layout

The brief's target layout (`apps/earth1`, `apps/e14`, `services/engine`, `packages/*`) differs
from the current one (`apps/earth1-co`, `apps/e1-4-com`, `apps/davinci`, `packages/ui`). The
current layout builds and deploys; a rename would touch Vercel root directories.

- A. Keep current names and map the roles onto them.
- B. Rename in one `chore/` PR and update Vercel root directories afterwards (owner action).
  **Default: A.** Packages inside the monorepo rather than one repo per feature: please confirm.
