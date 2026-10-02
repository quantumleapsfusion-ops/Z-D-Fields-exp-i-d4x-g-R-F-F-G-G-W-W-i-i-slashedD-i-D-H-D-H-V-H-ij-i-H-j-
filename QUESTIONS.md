# Open Questions for Z

Logged from product spec review (2026-10-01) and implementation decisions.

## 1D Voice Stream

- **Stream segmentation**: Z says "one big audio" but the app indexes segments. Should segments be invisible to the user (just one scroll timeline), or explicitly listed and selectable?
- **Categorization**: Z mentions users can "categorize the audio". Does this mean tagging segments, folders, or metadata on the stream itself?
- **Replay & listen-back UX**: Should users see a scrubber bar, waveform, or just press play on the whole stream?

## Animation & Visual

- **3D form progression**: What triggers the forms to grow more complex? Number of recordings? Time? Analyzed content keywords?
- **Animation sync**: Z says "animation should come to life so it's in sync" — should motion map to speech frequency, volume, pacing, or semantic content?
- **Form variety**: Does each recording create a new 3D form, or does one form evolve as recordings accumulate?

## 2D–5D Interpretation

- **2D Chalkboard**: Shared drawing surface tied to a voice segment, or something else?
- **3D Gravity Board**: Ideas as bodies that attract by topic, or does this refer to the 3D forms growing and clustering?
- **4D Event Horizon**: Time view of the stream with fading/persistence, or something tied to Da Vinci conversation history?
- **5D Da Vinci**: AI analyzing and advising through Vercel AI Gateway — does this live in all dimensions, or mainly as a separate mode?

## Authentication & Recovery

- **Voiceprint quality thresholds**: What's the acceptable false-rejection rate when tolerating cold/new phone changes?
- **30-day cool-off UX**: Should the user see a countdown, get reminders, or be able to cancel the deletion mid-cooldown?

## Storage & Encryption

- **Encrypted metadata**: Are segment boundaries, timestamps, and categorization tags also encrypted, or just the audio blob?
- **Per-segment encryption** or **per-stream encryption**: Should deletion of one segment work, or is it all-or-nothing?

## Logo & Launch

- **Animated logo**: Does the logo animate when the app first opens, or is it static until the user speaks?
- **Logo size on home vs. other pages**: Should it remain large (hero), or shrink to icon size once on the stream page?

## Voice Authentication Integration

- **Sign-in vs. verification**: Is the voiceprint used only to sign in, or also to verify every action (e.g., sending a recording)?
- **Voice condition changes**: How often should the voiceprint be re-trained if the user's voice changes (new phone, moved regions)?

---

*Updated as clarifications arrive or implementation raises new questions. Link to Z's full spec: [[e1-4-product-spec]].*
