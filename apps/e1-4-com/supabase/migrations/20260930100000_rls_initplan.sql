-- Wrap auth.uid() in a subselect so Postgres evaluates it once per query instead of once per
-- row (Supabase advisor: auth_rls_initplan). Same predicates as before.

alter policy "users_select_own" on public.users using (id = (select auth.uid()));
alter policy "users_insert_own" on public.users with check (id = (select auth.uid()));
alter policy "users_update_own" on public.users
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
alter policy "users_delete_own" on public.users using (id = (select auth.uid()));

alter policy "voice_streams_owner" on public.voice_streams
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter policy "shares_owner" on public.shares
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      segment_id is null
      or exists (
        select 1 from public.voice_segments seg
        where seg.id = shares.segment_id and public.owns_stream(seg.stream_id)
      )
    )
  );

alter policy "boards_owner" on public.boards
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter policy "ai_usage_select_own" on public.ai_usage_events using (user_id = (select auth.uid()));

alter policy "contacts_owner_select" on public.contacts using (owner_id = (select auth.uid()));
alter policy "contacts_owner_delete" on public.contacts using (owner_id = (select auth.uid()));

alter policy "conversation_members_update_own" on public.conversation_members
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "conversation_members_delete_own" on public.conversation_members
  using (user_id = (select auth.uid()));

alter policy "voice_notes_insert_own" on public.voice_notes
  with check (sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id));
alter policy "voice_notes_delete_own" on public.voice_notes using (sender_id = (select auth.uid()));
