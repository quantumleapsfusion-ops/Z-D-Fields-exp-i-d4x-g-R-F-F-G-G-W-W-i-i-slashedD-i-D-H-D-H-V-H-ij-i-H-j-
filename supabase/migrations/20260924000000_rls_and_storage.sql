-- Supabase-specific hardening: Row Level Security + Storage buckets/policies.
-- Run AFTER the Prisma migrations have created the tables
-- (`npm run prisma:deploy`), via `supabase db push` or the SQL editor.
--
-- Prisma connects as the `postgres` role and therefore bypasses RLS; these
-- policies protect the PostgREST / anon-key path that browser clients use.

-- ---------------------------------------------------------------------------
-- Helper: does the current user have access to a stream (owner or share)?
-- ---------------------------------------------------------------------------
create or replace function public.can_read_stream(p_stream_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.voice_streams vs
    where vs.id = p_stream_id and vs.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.shares s
    where s.stream_id = p_stream_id
      and s.scope = 'USER'
      and s.recipient_id = auth.uid()
      and (s.expires_at is null or s.expires_at > now())
  );
$$;

revoke all on function public.can_read_stream(uuid) from public;
grant execute on function public.can_read_stream(uuid) to authenticated, anon;

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

-- voice_streams: owner has full access; recipients of a USER share may read.
drop policy if exists "voice_streams_select" on public.voice_streams;
create policy "voice_streams_select" on public.voice_streams
  for select to authenticated using (public.can_read_stream(id));

drop policy if exists "voice_streams_insert_own" on public.voice_streams;
create policy "voice_streams_insert_own" on public.voice_streams
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "voice_streams_update_own" on public.voice_streams;
create policy "voice_streams_update_own" on public.voice_streams
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "voice_streams_delete_own" on public.voice_streams;
create policy "voice_streams_delete_own" on public.voice_streams
  for delete to authenticated using (owner_id = auth.uid());

-- voice_segments: inherit access from the parent stream.
drop policy if exists "voice_segments_select" on public.voice_segments;
create policy "voice_segments_select" on public.voice_segments
  for select to authenticated using (public.can_read_stream(stream_id));

drop policy if exists "voice_segments_write_owner" on public.voice_segments;
create policy "voice_segments_write_owner" on public.voice_segments
  for all to authenticated
  using (exists (select 1 from public.voice_streams vs where vs.id = stream_id and vs.owner_id = auth.uid()))
  with check (exists (select 1 from public.voice_streams vs where vs.id = stream_id and vs.owner_id = auth.uid()));

-- shares: owner manages; recipient may see shares addressed to them.
drop policy if exists "shares_select" on public.shares;
create policy "shares_select" on public.shares
  for select to authenticated using (owner_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "shares_write_owner" on public.shares;
create policy "shares_write_owner" on public.shares
  for all to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.voice_streams vs where vs.id = stream_id and vs.owner_id = auth.uid())
  );

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

-- voice: owner full access; USER-share recipients may read (second path
-- segment is the stream id). LINK shares are served by the server via signed
-- URLs using the service role, so they need no object-level policy.
drop policy if exists "voice_read" on storage.objects;
create policy "voice_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'voice'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.can_read_stream(((storage.foldername(name))[2])::uuid)
    )
  );

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
