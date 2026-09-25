-- Supabase-specific hardening: profile trigger, Row Level Security, Storage buckets/policies.
-- Run AFTER the Prisma migration has created the tables (`npm run db:deploy`), via
-- `supabase db push` or the SQL editor.
--
-- The Next.js server talks to Postgres through Prisma as the `postgres` role and to Storage with
-- the service-role key, so it bypasses RLS and performs its own authorization (every query is
-- scoped to the signed-in user's id). These policies are defence in depth: they lock down the
-- PostgREST / anon-key surface so a leaked anon key or a future browser client can only ever see
-- the caller's own rows and objects.

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
  insert into public."User" (id, email, name, image, "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
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

-- Deleting the auth identity removes the profile and, by cascade, every user-owned row.
create or replace function public.handle_deleted_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public."User" where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_deleted_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security (table names are Prisma's defaults, quoted)
-- ---------------------------------------------------------------------------
alter table public."User"         enable row level security;
alter table public."VoiceStream"  enable row level security;
alter table public."VoiceSegment" enable row level security;
alter table public."Share"        enable row level security;
alter table public."Board"        enable row level security;

-- User: only your own profile row.
drop policy if exists "user_select_own" on public."User";
create policy "user_select_own" on public."User"
  for select to authenticated using (id = auth.uid());

drop policy if exists "user_update_own" on public."User";
create policy "user_update_own" on public."User"
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "user_delete_own" on public."User";
create policy "user_delete_own" on public."User"
  for delete to authenticated using (id = auth.uid());

-- VoiceStream: owner only (one stream per user).
drop policy if exists "voice_stream_owner_all" on public."VoiceStream";
create policy "voice_stream_owner_all" on public."VoiceStream"
  for all to authenticated
  using ("userId" = auth.uid()) with check ("userId" = auth.uid());

-- VoiceSegment: inherits ownership from the parent stream.
drop policy if exists "voice_segment_owner_all" on public."VoiceSegment";
create policy "voice_segment_owner_all" on public."VoiceSegment"
  for all to authenticated
  using (exists (select 1 from public."VoiceStream" vs where vs.id = "streamId" and vs."userId" = auth.uid()))
  with check (exists (select 1 from public."VoiceStream" vs where vs.id = "streamId" and vs."userId" = auth.uid()));

-- Share: owner manages share links. Public /s/<token> pages are rendered by the server
-- (service role) after validating the token, so anon needs no direct table access.
drop policy if exists "share_owner_all" on public."Share";
create policy "share_owner_all" on public."Share"
  for all to authenticated
  using ("userId" = auth.uid()) with check ("userId" = auth.uid());

-- Board (Infinity Chalkboard): owner only.
drop policy if exists "board_owner_all" on public."Board";
create policy "board_owner_all" on public."Board"
  for all to authenticated
  using ("userId" = auth.uid()) with check ("userId" = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage buckets. Object paths always start with the owner's uid:
--   avatars : <uid>/avatar/<timestamp>.<ext>   public-read, owner-write
--   voice   : <uid>/segments/<segmentId>.<ext> private; read only via signed URLs
--             issued by the server (/api/stream/... and /api/share/...) after
--             checking ownership or a valid share token.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 4194304, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('voice', 'voice', false, 52428800, array[
    'audio/webm', 'audio/webm;codecs=opus',
    'audio/ogg', 'audio/ogg;codecs=opus',
    'audio/mp4', 'audio/mp4;codecs=mp4a.40.2', 'audio/aac', 'audio/x-m4a',
    'audio/mpeg', 'audio/wav'
  ])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- avatars: anyone can read; only the owner (first path segment = uid) can write.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- voice: owner only. Nobody else gets object-level access; shared playback goes through
-- server-issued signed URLs.
drop policy if exists "voice_owner_all" on storage.objects;
create policy "voice_owner_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text);
