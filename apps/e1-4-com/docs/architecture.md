# e1-4.com architecture

Voice in, spacetime out. Nothing on screen is typed or read: people are voices, conversations are
fields, and the words (transcripts) stay in the data layer for search, export and screen readers.

## System context

```mermaid
flowchart LR
  person((Person)) -- speaks --> browser[Browser: MediaRecorder + Web Audio]
  browser -- PCM sample --> voiceid[/api/voice-id/]
  browser -- audio span + PCM --> segments[/api/stream/segments/]
  browser -- voice note / live clip --> talk[/api/talk/:id/notes/]
  voiceid --> auth[(Supabase Auth: app_metadata.voiceprint)]
  segments --> db[(Postgres via Prisma)]
  talk --> db
  segments --> storage[(Supabase Storage: voice, talk buckets)]
  talk --> storage
  segments -. async .-> stt[STT provider: Deepgram / Whisper]
  talk -. async .-> stt
  browser --> field[Spacetime renderers: SpacetimeBackground, PinField, TopologyCollapse]
```

## Voice identity and the 1D stream

Every entry is voice-checked; the first one also opens the door.

```mermaid
sequenceDiagram
  participant P as Person
  participant G as VoiceGate / Stream recorder
  participant V as /api/voice-id
  participant S as /api/stream/segments
  participant A as Supabase Auth
  participant D as voice_segments

  P->>G: speaks (signed out)
  G->>V: 16 kHz PCM
  V->>A: nearest voiceprint within MATCH_DISTANCE?
  alt known voice
    V->>A: blend print, mint session
  else new voice
    V->>A: create hidden <uuid>@voice.e1-4.com user, mint session
  end
  V-->>G: session cookie
  G->>S: same span (audio + PCM)
  S->>A: verifySpeaker(owner, print)
  S->>D: append segment (index n, speaker_verified)
  Note over P,D: Later entries: signed in, every span is appended to the same stream and checked<br/>against the owner's print. A different voice is kept but marked, and never blended in.
```

- One `voice_streams` row per user; `voice_segments` are ordered by `(stream_id, index)`.
- `speaker_verified`: `true` matched the owner's print, `false` another voice, `null` too short
  (< 1.5 s) or not checked.
- A mismatched sample never updates the stored print, so another voice can't drift an account.

## Talk: 1D to 5D over a conversation

```mermaid
flowchart TB
  note[Voice note or live clip being heard] --> decode[decodeSound: waveform, spectrogram, loudness, pitch]
  decode --> read[readSound: candidate forms + resolved form]
  offset[AudioDock offsetMs / note duration] --> stage[talkStageAt]
  stage -->|1D voice| line[PinField line: the waveform]
  stage -->|2D board| board[board: spectrogram spread flat]
  stage -->|3D gravity| relief[relief: loudness lifts the pins]
  stage -->|4D horizon| well[well: density folds inward]
  stage -->|5D superposition| cycle[form: candidates flicker]
  stage -->|observed| resolved[form: the one that was meant]
  read --> cycle
  read --> resolved
  rec[Recording] -->|live level| listen[listen: field ripples]
```

- The thread is voices only: avatars, waveform glyphs sized by duration, live rings, icon controls.
  Transcripts are rendered `sr-only`.
- The stages reuse the personal journey's proportions (`lib/journey.ts`), spread across the note's
  length with at least `MIN_STAGE_MS` each.
- 3D is a real WebGL scene; 4D (time as depth/density) and 5D (superposed interpretations) are
  projections into it, not literal higher-dimensional renders.
- `SpacetimeBackground` stays behind every page (fixed, `pointer-events: none`) and only reads the
  level of a recording already in progress; it never opens the microphone.

## Data model (voice parts)

```mermaid
erDiagram
  users ||--|| voice_streams : "one stream"
  voice_streams ||--o{ voice_segments : "ordered spans"
  voice_segments ||--o{ shares : "public links"
  users ||--o{ conversation_members : joins
  conversations ||--o{ conversation_members : has
  conversations ||--o{ voice_notes : holds
  users ||--o{ voice_notes : sends
  users ||--o{ contacts : "@handle book"
```

Hard delete (`lib/privacy/hard-delete.ts`) removes rows and storage objects for all of the above;
the export includes every segment with its `speaker_verified` flag.

## Deployment boundary

```mermaid
flowchart LR
  subgraph Vercel
    next[Next.js app: pages, route handlers, server actions]
  end
  subgraph Supabase
    authz[Auth] --- pg[(Postgres + RLS)] --- obj[(Storage)]
  end
  next -- service role, server only --> authz
  next -- Prisma --> pg
  next -- signed URLs --> obj
  next -. optional keys .-> ai[STT / LLM providers]
```

## Known limits

- Voiceprint matching scans every stored print; it needs an index (or a provider) before scale.
- No liveness / anti-clone check yet: a good recording or clone of someone could open their stream.
- Talk polls while open; no push, no WebRTC.
