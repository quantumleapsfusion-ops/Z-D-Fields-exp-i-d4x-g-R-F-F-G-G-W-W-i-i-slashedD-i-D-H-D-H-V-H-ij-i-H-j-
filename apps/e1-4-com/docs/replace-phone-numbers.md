# Plan: replacing phone numbers with voice

Goal: reach anyone on e1-4 by who they are (their voice and `@handle`), never by a number.

## What exists today

- Voice identity: a voiceprint opens the account; no email, password or number.
- `@handle` + QR code on `/talk/contacts` ("Your @handle is your number").
- Talk: direct and group conversations, voice notes, live clips, invite links.

## Phases

1. **Handle as number (done).** Contacts by `@handle`, QR, invite links; direct conversations are
   deduplicated with `direct_key`.
2. **Say who you want.** Spoken navigation resolves "talk to Ada" against your contacts; the
   voice note starts recording in that conversation. Unknown names prompt a QR/invite share.
3. **Reachability without numbers.** Web push (then native wrappers) so a note or live stream
   rings the other person when the app is closed; presence from `live_at` heartbeats.
4. **Real-time voice.** WebRTC for live mode (TURN relay, Supabase Realtime for signalling) so
   live is sub-second instead of 4 s clips; the recording path stays as the fallback and archive.
5. **Bridging.** Opt-in: invite someone from your phone's share sheet (link, no number stored);
   later a PSTN gateway so a phone can call into a Talk thread, numbers kept only on the gateway.
6. **Trust.** Liveness and anti-clone checks before voice alone unlocks sensitive actions; passkey
   as the second factor; rate limits and abuse reporting per handle.

## Never

- Store phone numbers as identity or harvest address books.
- Present Talk as an emergency line: it needs data/Wi-Fi and cannot reach emergency services.

## Success measures

- A new person reaches a friend in under 10 seconds, without typing.
- Share of conversations started by voice command or QR rather than a link.
- Push delivery under 5 s; live latency under 500 ms after phase 4.
