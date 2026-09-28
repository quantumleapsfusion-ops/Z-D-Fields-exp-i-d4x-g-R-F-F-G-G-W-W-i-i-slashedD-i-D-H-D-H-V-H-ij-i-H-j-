# Live end-to-end checks

`npm run test:live` runs `live/*.live.test.ts` against the **real** Supabase project named by
`NEXT_PUBLIC_SUPABASE_URL`. It never runs in CI. Each spec creates throwaway auth users
(`devin-live-*@example.com`), exercises the real code paths, and removes everything it created via
`hardDeleteUser` (which is itself under test).

Required env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`. Node 22+.

| Spec                      | What it proves                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `supabase.live.test.ts`   | `auth.users` → `public.users` trigger; avatar in `avatars` is public-read; voice object is owner-only under Storage + table RLS (non-owner and anon get "Object not found", non-owner upload into the owner prefix hits RLS); link token resolves; `hardDeleteUser` clears storage, rows, and the auth user. |
| `share-page.live.test.ts` | `/s/<token>` renders and `/api/share/<token>/audio/<segment>` streams `audio/webm` to a visitor with no session; unknown token 404s. Needs a running app: `npm run build && npm start`, or set `LIVE_APP_URL`.                                                                                               |

## Not covered here (needs a browser / paid keys)

- OAuth sign-in (Google / Facebook / Microsoft) — drive `/login` in a browser. Quick preflight
  that a provider is enabled in the Supabase dashboard:
  `curl "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback"`
  returns a 302 to the provider when enabled and `provider is not enabled` (400) when it isn't.
- Real transcription — the live spec logs `transcriptionStatus` after `appendSegment`. `PENDING` means a
  provider key is configured; `SKIPPED` means neither `DEEPGRAM_API_KEY` nor `OPENAI_API_KEY` was set.
- Anthropic model IDs — `POST /api/davinci/draw` and `/api/gravity/superpose` return `source: "llm"`
  when the configured model resolves, `source: "stub"` otherwise.
