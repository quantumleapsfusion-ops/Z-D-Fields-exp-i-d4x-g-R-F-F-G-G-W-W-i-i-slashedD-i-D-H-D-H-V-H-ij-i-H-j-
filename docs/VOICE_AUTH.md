# Voice authentication path for e1-4

The microphone control on every e1-4 app surface recognizes a small set of navigation
commands (home, log in, profile, stream, Da Vinci, chalkboard, gravity). Speech
recognition does **not** prove who spoke or create a session. The existing account flow creates the
profile, and its share links remain revocable.

## Recommended managed verifier: Veridas das-Peak

[das-Peak](https://veridas.com/en/apis/) is a cloud REST voice comparison service;
the [vendor's performance report](https://docs.veridas.com/das-peak/cloud/v2.23/resources/performance-report/)
documents text-independent verification, configurable similarity thresholds, and
voice authenticity checks for replay and injection attacks. It fits a browser microphone
flow better than Pindrop's contact-center-focused integrations. [ID R&D
IDVoice](https://docs.idrnd.net/voice/) is an alternative when hosting the biometric
service ourselves is preferable. Vendor documentation describes capabilities, not a
security guarantee for our users; thresholds need validation with our own microphone
samples, languages, and threat model before use in production.

## Integration prerequisites

1. Obtain Veridas service access and API documentation/credentials through its
   [product site](https://veridas.com/en/apis/). Keep credentials server-side.
2. Enrollment policy: self-enrollment creates **new** voice-only profiles; it never
   attaches a voice to an existing profile. Existing profiles enroll only from an
   already-authenticated session. Obtain explicit consent, record several samples,
   bind the template to the profile, and delete it with the account.
3. For sign-in, first identify the account, issue a short-lived random challenge,
   record a fresh microphone sample, and send it to a server endpoint. The server
   applies rate limits, size limits, liveness and calibrated match checks. A transcript
   or client-side comparison must never be accepted as authentication.
4. Integrate the verified result with a supported Supabase session issuance mechanism
   (no email or password is shown to voice-only users). Keep a recovery path, such as
   a recovery phrase issued at enrollment, for users whose voice is rejected. Require additional
   verification for account recovery, template changes, and destructive operations.
5. Test replay, synthetic audio, noise, browsers without microphone access, false
   accepts/rejects, and deletion before enabling voice login.

Voice-only login remains disabled until the vendor and server-side session integration
are available. The voice command and profile/share features work without the vendor.
