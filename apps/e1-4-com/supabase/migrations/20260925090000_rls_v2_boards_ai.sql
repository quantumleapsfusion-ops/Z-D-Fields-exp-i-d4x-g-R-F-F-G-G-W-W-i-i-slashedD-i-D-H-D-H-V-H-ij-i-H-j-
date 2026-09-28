-- Follows prisma/migrations/20260925090000_boards_ai_usage_voice_v2.
-- Voice model v2: streams are owned via user_id, shares are link-tokens (owner
-- user_id, optional segment_id, revoked_at) served by the server. Adds RLS for
-- boards and the AI usage ledger. Run after `npm run prisma:deploy`.

-- ---------------------------------------------------------------------------
-- Replace the share-aware helper: link shares are resolved server-side with the
-- service role, so the anon-key path only ever sees the owner's own rows.
-- ---------------------------------------------------------------------------
drop policy if exists "voice_read" on storage.objects;
drop policy if exists "voice_streams_select" on public.voice_streams;
drop policy if exists "voice_segments_select" on public.voice_segments;
drop policy if exists "voice_segments_write_owner" on public.voice_segments;
drop policy if exists "shares_select" on public.shares;
drop policy if exists "shares_write_owner" on public.shares;
drop policy if exists "voice_streams_insert_own" on public.voice_streams;
drop policy if exists "voice_streams_update_own" on public.voice_streams;
drop policy if exists "voice_streams_delete_own" on public.voice_streams;
drop function if exists public.can_read_stream(uuid);

create or replace function public.owns_stream(p_stream_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.voice_streams vs
    where vs.id = p_stream_id and vs.user_id = auth.uid()
  );
$$;

revoke all on function public.owns_stream(uuid) from public;
grant execute on function public.owns_stream(uuid) to authenticated;

-- voice_streams: owner only.
drop policy if exists "voice_streams_owner" on public.voice_streams;
create policy "voice_streams_owner" on public.voice_streams
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- voice_segments: inherit from the parent stream.
drop policy if exists "voice_segments_owner" on public.voice_segments;
create policy "voice_segments_owner" on public.voice_segments
  for all to authenticated
  using (public.owns_stream(stream_id)) with check (public.owns_stream(stream_id));

-- shares: owner manages their own link tokens; token lookups happen server-side.
drop policy if exists "shares_owner" on public.shares;
create policy "shares_owner" on public.shares
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      segment_id is null
      or exists (
        select 1 from public.voice_segments seg
        where seg.id = segment_id and public.owns_stream(seg.stream_id)
      )
    )
  );

-- voice objects: owner only (first path segment = uid). Shared audio is
-- streamed by /api/share/[token]/audio via the service role.
drop policy if exists "voice_owner_read" on storage.objects;
create policy "voice_owner_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'voice' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- boards (Infinity Chalkboard): owner only.
-- ---------------------------------------------------------------------------
alter table public.boards enable row level security;

drop policy if exists "boards_owner" on public.boards;
create policy "boards_owner" on public.boards
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- AI usage ledger: users may read their own usage; only the server (service
-- role, bypasses RLS) writes. Budget alerts are server-only.
-- ---------------------------------------------------------------------------
alter table public.ai_usage_events  enable row level security;
alter table public.ai_budget_alerts enable row level security;

drop policy if exists "ai_usage_select_own" on public.ai_usage_events;
create policy "ai_usage_select_own" on public.ai_usage_events
  for select to authenticated using (user_id = auth.uid());
-- (no insert/update/delete policies: anon-key clients cannot write the ledger)
-- (no policies on ai_budget_alerts: server-only table)
