# Live checks

`npm run test:live` runs against the configured Postgres database and Supabase Storage. It does not
run in CI. Tests create disposable Prisma users and remove them after use.

Required environment: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. Use a test project. Node 22+.

| Spec                      | What it checks                                                               |
| ------------------------- | ---------------------------------------------------------------------------- |
| `delete-all.live.test.ts` | User-data cascades and removal of objects under the user's Storage paths.    |
| `share-page.live.test.ts` | Public share page and audio route. Requires a running app or `LIVE_APP_URL`. |

For the share-page test, start the app with `npm run build && npm start`, then run
`LIVE_APP_URL=http://localhost:3000 npm run test:live`.
