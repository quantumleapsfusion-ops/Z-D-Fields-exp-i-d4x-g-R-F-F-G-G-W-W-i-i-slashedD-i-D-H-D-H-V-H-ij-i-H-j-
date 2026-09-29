-- Handles, contacts and passkeys. Run after `npm run prisma:deploy` has applied
-- prisma/migrations/20260929120000_handles_contacts_passkeys.
--
-- The app reads and writes these tables through Prisma (bypasses RLS). These
-- policies protect the anon-key path.

alter table public.contacts        enable row level security;
alter table public.passkeys        enable row level security;
alter table public.auth_challenges enable row level security;

-- contacts: your address book is yours alone.
drop policy if exists "contacts_owner_select" on public.contacts;
create policy "contacts_owner_select" on public.contacts
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists "contacts_owner_delete" on public.contacts;
create policy "contacts_owner_delete" on public.contacts
  for delete to authenticated using (owner_id = auth.uid());

-- passkeys: owners may list theirs. Registration and sign-in are verified server-side only.
drop policy if exists "passkeys_owner_select" on public.passkeys;
create policy "passkeys_owner_select" on public.passkeys
  for select to authenticated using (user_id = auth.uid());

-- auth_challenges: no policies; server-only.
