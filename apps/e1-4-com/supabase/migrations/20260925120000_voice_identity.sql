-- Follows prisma/migrations/20260925120000_voice_identity.
-- Voice identity: the auth->profile trigger no longer copies an email (the auth
-- user only carries an internal placeholder address), and voice_prints is
-- locked down so only the service role (server) can read or write it.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, display_name, avatar_path, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    null,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table public.voice_prints enable row level security;
-- No policies: anon/authenticated get nothing; the service role bypasses RLS.
revoke all on table public.voice_prints from anon, authenticated;
