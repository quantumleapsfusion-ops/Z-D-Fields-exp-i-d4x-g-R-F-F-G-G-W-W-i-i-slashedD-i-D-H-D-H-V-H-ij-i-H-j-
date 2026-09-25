# e1-4.com — build plan

_Deliverable §20 of the owner brief. Status: **awaiting owner approval**. Nothing below Milestone 0
ships until this document is approved._

## 0. Where we are

Four PRs exist; none is merged. PR #4 (NextAuth + Prisma app: Voice Stream, Chalkboard, Da Vinci,
Gravity Board prototype) is the most complete and is the base for this plan. This branch layers the
supplied `/brand` kit, the brief's copy rules, PWA scaffolding, legal drafts and the
"Destroy all my voice data" control on top of it (Milestone 0 below). Everything else is proposed.

## 1. Stack

| Layer          | Choice                                              | Why                                                                                    |
| -------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| App            | Next.js 15 (App Router), React 19, TypeScript       | One codebase for site + app; server actions; `next/font/local` for Adventor; PWA-able  |
| Styling        | Tailwind 3 + `brand/tokens.css` CSS variables       | Light/dark via `prefers-color-scheme`; spectrum reserved for accents                   |
| Auth           | NextAuth v4 — Google, Facebook, Microsoft (Entra)   | Already wired in PR #4; providers switch on when env keys exist                        |
| Database       | PostgreSQL + Prisma 6                               | Relational fits users/follows/segments/shares; easy hosted (Neon, Supabase, RDS)       |
| Object storage | S3-compatible (Cloudflare R2 recommended) or local  | Cheap egress for audio; signed URLs; prefix-scoped per user for provable deletion      |
| Speech-to-text | Deepgram Nova-2 (batch + live); Whisper fallback    | Best latency for live captions; both behind `lib/stt` interface                        |
| LLM            | Anthropic Claude (default) or OpenAI via `lib/llm`  | Da Vinci translate / summarise / visual prompts                                        |
| Canvas         | Konva (Chalkboard 2D), Three.js (3D, flag-gated)    | Already in PR #4                                                                       |
| Hosting        | Vercel (app) + R2 (audio) + Neon (Postgres)         | Preview deployment per PR as the brief requires. **Recurring cost — owner to approve** |
| Quality        | ESLint, Prettier, `tsc`, GitHub Actions, Lighthouse | Present in repo; Lighthouse CI to be added                                             |

### Architecture — audio pipeline

```
 browser (iOS Safari / Android Chrome / desktop)
 ┌──────────────────────────────────────────────────────────────────┐
 │ MediaRecorder  ──►  chunked Blob (webm/opus | mp4/aac on iOS)     │
 │       │                                                            │
 │       └─ offline? ─► IndexedDB queue ─► sync when online (SW)      │
 └───────────────┬────────────────────────────────────────────────────┘
                 │ POST /api/stream/segments  (multipart, auth cookie)
                 ▼
 ┌──── Next.js server action / route ───────────────────────────────┐
 │ 1. RECORD    validate (size, mime, duration), assign segmentId     │
 │ 2. STORE     put  users/{userId}/stream/{segmentId}.{ext}  → R2    │
 │              insert VoiceSegment(status=PENDING)                   │
 │ 3. TRANSCRIBE enqueue → lib/stt (Deepgram batch)                   │
 │              update transcript, words[], language, status=DONE     │
 │ 4. ANIMATE   client fetches segment + words[] → timed caption /    │
 │              spectrum progress bar / Da Vinci visual (lib/llm)     │
 └──────────────────────────────────────────────────────────────────┘
                 │
                 ▼  playback: signed GET URL (15 min), never public bucket
 Voice Stream (own diary) · Listen feed (friends/public) · /s/{token} share
```

Live modes (Da Vinci, Chalkboard, Gravity) use Deepgram streaming over WebSocket, falling back to
the browser Web Speech API when no key is set. Live audio is **not stored** unless the user taps
"keep".

## 2. Data model

Existing (PR #4): `User`, `Account`, `Session`, `VerificationToken`, `VoiceStream`, `VoiceSegment`,
`Share`, `Board`. Proposed additions for the social layer:

```
User            id, name, handle (unique), email, image, avatarKey, defaultVisibility, createdAt
VoiceStream     id, userId (1:1)
VoiceSegment    id, streamId, audioKey, mime, durationMs, transcript, words(json), lang,
                status, visibility (PRIVATE|FRIENDS|PUBLIC), createdAt
DaVinciArtifact id, segmentId, kind (translation|summary|visual), lang, payload(json), createdAt  [new]
Follow          followerId, followeeId, createdAt                                                  [new]
Block           blockerId, blockedId                                                              [new]
Share           id, userId, segmentId?, token, includeAudio, includeTranscript, revokedAt
Board           id, userId, data(json)
Report          id, reporterId, segmentId, reason, status, resolvedById, createdAt               [new]
AuditLog        id, actorId, action, targetType, targetId, createdAt                             [new]
```

### "Destroy all my voice data" — deletion guarantee

Implemented today in `lib/privacy/hard-delete.ts`, exposed in Settings behind a typed `DESTROY`
confirmation:

1. **Object storage first.** Delete every `VoiceSegment.audioKey`, then sweep the whole prefix
   `users/{userId}/stream/` so orphaned chunks are impossible to miss. Storage is per-user
   prefixed precisely so this sweep is a single, provable operation.
2. **Database second, in one transaction.** Delete `Share` rows (share links die instantly),
   `DaVinciArtifact` rows (cascade from segment), `VoiceSegment` rows, then the `VoiceStream`.
   Transcripts live only on `VoiceSegment`, so they go with it. Nothing is soft-deleted.
3. **Caches.** `revalidatePath` on `/stream`, `/settings`, feed and share routes; signed URLs
   expire within 15 minutes anyway. CDN cache headers on audio are `private, no-store`.
4. **Third parties.** STT/LLM providers are contracted for zero data retention; we never send
   userIds to them, only opaque segmentIds.
5. **Backups.** Database point-in-time backups are purged on the provider's window (Neon: 7 days
   default; we state 30 days as the ceiling). Audio has no backup copy by design — R2 versioning
   stays **off**.
6. **Confirmation.** Return the count of destroyed segments; send an email on completion
   (Milestone 4, needs mail provider — owner decision).

"Delete account" = the above + avatar prefix sweep + `User` row (cascades Account/Session/Follow/
Block/Board).

## 3. MVP milestones (each = one reviewed PR with a preview deployment)

| #   | Milestone                                                                                                                                                                                                                                                                            | Effort       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| 0   | **Brand + foundation** (this PR): `/brand` kit, Adventor, light/dark monochrome tokens, homepage with lockup + demo stream, footer credit, cookie consent, PWA manifest/SW/offline, `/settings` with export + destroy + delete, `/privacy` `/terms` `/content-policy` drafts, README | done         |
| 1   | **Hosting + preview deploys**: Vercel project, Neon Postgres, R2 bucket, CI Lighthouse ≥90, OAuth apps for 3 providers (owner creates)                                                                                                                                               | 1 session    |
| 2   | **Voice Stream v1 hardening**: iOS Safari `audio/mp4` recording, chunked upload, IndexedDB offline queue, waveform + timed captions, per-segment visibility                                                                                                                          | 1 session    |
| 3   | **Profiles + social**: `@handle`, public profile page with avatar + public notes, Follow/Block, chronological Listen feed (friends / public tabs), notifications-free                                                                                                                | 1–2 sessions |
| 4   | **Privacy completion**: zip export with audio, deletion completion email, Report → human queue, AuditLog, block/mute enforcement in feed & shares                                                                                                                                    | 1 session    |
| 5   | **Da Vinci v1**: live captions in 375px layout, translate-to-language picker, summary card, spectrum visual; artifacts persisted per segment                                                                                                                                         | 1 session    |
| 6   | **Infinity Chalkboard polish**: monochrome chalk surface, voice-command palette, save/share board                                                                                                                                                                                    | 1 session    |
| 7   | **Launch readiness**: legal text signed off, accessibility audit (VoiceOver/TalkBack, captions everywhere), Lighthouse CI gate, DNS cut-over for e1-4.com (**owner action**)                                                                                                         | 1 session    |
| —   | **Gravity Board** stays behind `NEXT_PUBLIC_FEATURE_GRAVITY_BOARD`; does not block MVP                                                                                                                                                                                               | later        |

## 4. Open questions for the owner

1. **Hosting & cost.** Approve Vercel Pro (~$20/mo) + Neon (free→$19) + R2 (pennies)? Or an
   alternative you already pay for?
2. **OAuth apps.** I cannot create Google/Facebook/Microsoft developer apps in your name. Will you
   create them and paste the client IDs/secrets into Vercel env, or grant me access?
3. **Minimum age.** Drafted as 16 (GDPR consent age in most EU states). Confirm, or 13/18?
4. **Backup window.** Privacy draft says "purged within 30 days". Acceptable, or do you want
   shorter (means disabling PITR)?
5. **Transactional email** for deletion confirmation and legal notices: Resend / Postmark / none
   for MVP? (recurring cost).
6. **Public-by-default or private-by-default** for new recordings?
7. **Live-mode audio** (Da Vinci / Chalkboard): confirm it should _not_ be stored unless the user
   explicitly keeps it.
8. **Handles**: `@handle` unique per user, or is name + avatar enough for MVP?
9. **Content policy**: the draft removes only illegal content and court-ordered items, with
   published order counts and human-reviewed appeals. Confirm that stance before launch.
10. **Analytics / ad measurement**: which pixel (if any) goes behind "Allow all"? None is wired
    today.
