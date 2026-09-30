-- Talk (async voice conversations). Run after `npm run prisma:deploy` has
-- applied prisma/migrations/20260929090000_talk_conversations.
--
-- The app reads and writes these tables through Prisma (bypasses RLS) and
-- streams audio through the server after a membership check. These policies
-- protect the anon-key path: a user only ever sees conversations they belong to.

alter table public.conversations        enable row level security;
alter table public.conversation_members enable row level security;
alter table public.voice_notes          enable row level security;

-- security definer so policies on conversation_members can call it without recursing.
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members m
    where m.conversation_id = p_conversation_id and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

-- conversations: members can read. Creation, joining and invite rotation happen
-- server-side (the invite token must never be readable by non-members).
drop policy if exists "conversations_member_select" on public.conversations;
create policy "conversations_member_select" on public.conversations
  for select to authenticated using (public.is_conversation_member(id));

-- conversation_members: members see who else is in their conversations; a
-- user may update (read receipts) or delete (leave) only their own row.
drop policy if exists "conversation_members_select" on public.conversation_members;
create policy "conversation_members_select" on public.conversation_members
  for select to authenticated using (public.is_conversation_member(conversation_id));

drop policy if exists "conversation_members_update_own" on public.conversation_members;
create policy "conversation_members_update_own" on public.conversation_members
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "conversation_members_delete_own" on public.conversation_members;
create policy "conversation_members_delete_own" on public.conversation_members
  for delete to authenticated using (user_id = auth.uid());

-- voice_notes: members read; a member may add notes as themself and delete their own.
drop policy if exists "voice_notes_member_select" on public.voice_notes;
create policy "voice_notes_member_select" on public.voice_notes
  for select to authenticated using (public.is_conversation_member(conversation_id));

drop policy if exists "voice_notes_insert_own" on public.voice_notes;
create policy "voice_notes_insert_own" on public.voice_notes
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));

drop policy if exists "voice_notes_delete_own" on public.voice_notes;
create policy "voice_notes_delete_own" on public.voice_notes
  for delete to authenticated using (sender_id = auth.uid());

-- Note audio lives at voice/<senderId>/talk/<conversationId>/<noteId>.<ext>, so the
-- existing owner-only object policies already apply; other members hear it via
-- /api/talk/notes/[id]/audio, which checks membership and uses the service role.
