-- Sessions, voiceprints and login history are read and written only by the app
-- (the postgres owner). Nothing here is for the anon or authenticated keys.

alter table public.sessions enable row level security;
alter table public.voiceprints enable row level security;
alter table public.login_events enable row level security;
revoke all on table public.sessions, public.voiceprints, public.login_events from anon, authenticated;
