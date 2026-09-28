import { create } from "zustand";

export type PlayableSegment = {
  id: string;
  durationMs: number;
  transcript?: string | null;
};

export type Playlist = {
  /** Stable id so re-setting the same list does not restart playback. */
  key: string;
  title: string;
  segments: PlayableSegment[];
  audioUrl: (segmentId: string) => string;
};

/** Implemented by the single `<AudioDock>`; the store only forwards intents to it. */
export type AudioEngine = {
  load: (index: number, offsetMs: number, autoplay: boolean) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
};

type PlaybackState = {
  playlist: Playlist | null;
  current: number;
  offsetMs: number;
  playing: boolean;
  loading: boolean;
  engine: AudioEngine | null;

  bindEngine: (engine: AudioEngine | null) => void;
  setPlaylist: (playlist: Playlist | null) => void;
  /** Engine callbacks. */
  report: (
    patch: Partial<Pick<PlaybackState, "current" | "offsetMs" | "playing" | "loading">>,
  ) => void;

  toggle: () => void;
  playFrom: (segmentId: string) => void;
  seekGlobal: (ms: number) => void;
  next: () => boolean;
};

export const usePlayback = create<PlaybackState>((set, get) => ({
  playlist: null,
  current: 0,
  offsetMs: 0,
  playing: false,
  loading: false,
  engine: null,

  bindEngine: (engine) => set({ engine }),

  setPlaylist: (playlist) => {
    const prev = get().playlist;
    if (playlist && prev && prev.key === playlist.key) {
      const currentId = prev.segments[get().current]?.id;
      const index = playlist.segments.findIndex((s) => s.id === currentId);
      set({ playlist, current: index >= 0 ? index : 0 });
      return;
    }
    get().engine?.pause();
    set({ playlist, current: 0, offsetMs: 0, playing: false });
  },

  report: (patch) => set(patch),

  toggle: () => {
    const { engine, playlist, playing, current, offsetMs } = get();
    if (!engine || !playlist || playlist.segments.length === 0) return;
    if (playing) engine.pause();
    else void engine.resume().catch(() => engine.load(current, offsetMs, true));
  },

  playFrom: (segmentId) => {
    const { engine, playlist } = get();
    if (!engine || !playlist) return;
    const index = playlist.segments.findIndex((s) => s.id === segmentId);
    if (index >= 0) void engine.load(index, 0, true);
  },

  seekGlobal: (ms) => {
    const { engine, playlist, playing } = get();
    if (!engine || !playlist) return;
    const starts = segmentStarts(playlist.segments);
    let index = starts.findIndex(
      (start, i) => ms < start + playlist.segments[i].durationMs,
    );
    if (index === -1) index = playlist.segments.length - 1;
    if (index < 0) return;
    void engine.load(index, Math.max(0, ms - starts[index]), playing);
  },

  next: () => {
    const { engine, playlist, current } = get();
    if (!engine || !playlist) return false;
    const index = current + 1;
    if (index >= playlist.segments.length) return false;
    void engine.load(index, 0, true);
    return true;
  },
}));

export function segmentStarts(segments: PlayableSegment[]): number[] {
  let acc = 0;
  return segments.map((s) => {
    const start = acc;
    acc += s.durationMs;
    return start;
  });
}

export const selectActiveSegmentId = (s: PlaybackState) =>
  s.playing ? (s.playlist?.segments[s.current]?.id ?? null) : null;
