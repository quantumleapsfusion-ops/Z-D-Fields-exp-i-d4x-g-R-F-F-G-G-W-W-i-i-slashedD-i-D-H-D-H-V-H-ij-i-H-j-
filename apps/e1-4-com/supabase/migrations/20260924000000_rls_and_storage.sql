-- Supabase-specific hardening: Row Level Security + Storage buckets/policies.
-- Run AFTER the Prisma migrations have created the tables
-- (`npm run prisma:deploy`), via `supabase db push` or the SQL editor.
--
-- Prisma connects as the `postgres` role and therefore bypasses RLS; these
-- policies protect the PostgREST / anon-key path that browser clients use.
--
-- Scope: profile trigger, users policies, storage buckets and avatar/voice
-- object write policies. Row policies for voice_streams / voice_segments /
-- shares and voice object reads live in 20260925090000_rls_v2_boards_ai.sql,
-- which targets the v2 column names produced by the full Prisma migration set.

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a Supabase Auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_path, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    null,
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users          enable row level security;
alter table public.voice_streams  enable row level security;
alter table public.voice_segments enable row level security;
alter table public.shares         enable row level security;

-- users: a user may read/update/delete only their own profile row.
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated using (id = auth.uid());

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own" on public.users
  for delete to authenticated using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage buckets
--   avatars : public-read, owner-write. Object path: <uid>/<filename>
--   voice   : private, owner-write, read via signed URLs (server issues them
--             after checking the sharing model). Object path: <uid>/<streamId>/<file>
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('voice', 'voice', false, 104857600, array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- avatars: anyone can read; only the owner (first path segment = uid) can write.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- voice: owner write. Reads are defined in the v2 migration (owner only;
-- link shares are streamed by the server via the service role).
drop policy if exists "voice_owner_insert" on storage.objects;
create policy "voice_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "voice_owner_update" on storage.objects;
create policy "voice_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "voice_owner_delete" on storage.objects;
create policy "voice_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text);
