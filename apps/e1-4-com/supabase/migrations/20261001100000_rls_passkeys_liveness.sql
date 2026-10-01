-- Passkeys and sign-in challenges are read and written only by the app (the postgres owner).
-- Nothing here is for the anon or authenticated keys.

alter table public.passkeys enable row level security;
alter table public.auth_challenges enable row level security;
revoke all on table public.passkeys, public.auth_challenges from anon, authenticated;
