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

### Q5. Playwright CI needs four repository secrets
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL` are empty in
GitHub Actions, so the smoke job is red on every PR and on `main`.
- A. Add the secrets pointing at a throwaway test project.
- B. Make the job skip (not fail) when the secrets are missing.
- C. Remove the job until a test database exists.

### Q6. Migrations for #62 on production
`20261001090000_segment_speaker_verified` and `20261001100000_passkeys_and_liveness` must be
applied by you (`DEPLOYMENT.md` §5); nothing here runs them. Confirm after merging by opening
`/api/health` on production.

## Monorepo layout
The brief's target layout (`apps/earth1`, `apps/e14`, `services/engine`, `packages/*`) differs
from the current one (`apps/earth1-co`, `apps/e1-4-com`, `apps/davinci`, `packages/ui`). The
current layout builds and deploys; a rename would touch Vercel root directories.
- A. Keep current names and map the roles onto them.
- B. Rename in one `chore/` PR and update Vercel root directories afterwards (owner action).
**Default: A.** Packages inside the monorepo rather than one repo per feature: please confirm.
