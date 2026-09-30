-- Prisma's migration history lives in public, which PostgREST exposes to the
-- anon key. Only Prisma (the postgres owner) touches it.

alter table public._prisma_migrations enable row level security;
revoke all on table public._prisma_migrations from anon, authenticated;
