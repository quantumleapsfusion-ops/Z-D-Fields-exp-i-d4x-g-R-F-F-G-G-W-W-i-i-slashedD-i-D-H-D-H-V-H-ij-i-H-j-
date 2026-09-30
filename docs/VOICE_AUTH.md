# Voice identity and navigation on e1-4

## Navigation

`VoiceCommandOrb` (every route except `/`, `/login`, and public shares, whose own mic
handles voice) listens for one utterance and matches whole-phrase commands in
`src/lib/voice/commands.ts`: home, log in, profile, stream / share, talk, Da Vinci,
chalkboard, gravity. Speech-to-text only routes; it never proves identity.

## Identity today

`/api/voice-id` and `src/lib/voiceprint` sign people in by voice alone: the device
computes a spectral voiceprint, the server signs in the closest stored print within
`MATCH_DISTANCE`, and an unmatched voice self-enrolls a new voice-only account. Existing
accounts are refined only from their own signed-in session.

Known limits of this in-house voiceprint:

- No liveness or anti-spoofing: a recording or synthetic clone of a voice is accepted.
- One-to-many matching across all users; false accepts grow with the user count and have
  not been measured.
- A successful match blends the new sample into the matched account's print.
- Rate limiting is per server instance only.
- There is no recovery path if a voice changes or is rejected.

## Recommended upgrade: a managed verifier (Veridas das-Peak)

[das-Peak](https://veridas.com/en/apis/) is a cloud REST voice comparison service; its
[performance report](https://docs.veridas.com/das-peak/cloud/v2.23/resources/performance-report/)
documents text-independent verification, configurable thresholds with published
false-accept / false-reject rates, and authenticity checks for replay and injection
attacks. [ID R&D IDVoice](https://docs.idrnd.net/voice/) is an alternative if we prefer
to host the engine. Vendor figures are not a guarantee for our microphones and users;
thresholds must be validated on our own samples.

Integration outline, behind `identifyVoice` so the client flow is unchanged:

1. Obtain vendor access (via the product site); keep credentials server-only.
2. Keep self-enrollment for new voice-only profiles; enroll several samples with
   explicit consent; delete templates with the account.
3. On sign-in, require the vendor's authenticity check to pass before any match, and
   prefer a one-to-one check against a device-held account hint over a global search.
4. Stop blending unverified samples into stored templates.
5. Add a durable (not per-instance) rate limit and a recovery credential issued at
   enrollment, such as a passkey (already supported in `src/lib/auth/passkeys.ts`).
