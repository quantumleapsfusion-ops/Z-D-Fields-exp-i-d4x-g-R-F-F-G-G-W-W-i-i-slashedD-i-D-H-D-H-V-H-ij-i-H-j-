"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  deleteNotesAction,
  leaveConversationAction,
  markReadAction,
  rotateInviteAction,
} from "@/app/actions/talk";
import { Avatar } from "@/components/Avatar";
import { TalkField } from "@/features/talk/TalkField";
import { formatDay, formatDuration, formatTime } from "@/features/voice-stream/format";
import { useRecorder, type CapturedSpan } from "@/features/voice-stream/useRecorder";
import { usePlayback, type Playlist } from "@/lib/audio/store";
import { DIMENSIONS, inTalk } from "@/lib/talk/dimensions";
import { usePlaylist } from "@/lib/audio/usePlaylist";
import type { MemberDTO, NoteDTO, ThreadDTO } from "@/lib/talk/conversations";
import {
  groupThread,
  LIVE_PART_MS,
  mergeNotes,
  nextLivePart,
  pollCursor,
  reconcileNotes,
  type ThreadItem,
} from "@/lib/talk/presence";

import { liveIdFor, type RecordingSession } from "./liveSpan";

type Pending = {
  id: string;
  span: CapturedSpan;
  liveId: string | null;
  failed?: boolean;
};
type Mode = "note" | "live";

const noteAudioUrl = (id: string) => `/api/talk/notes/${id}/audio`;

function postLive(conversationId: string, liveId: string | null, keepalive = false) {
  return fetch(`/api/talk/${conversationId}/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liveId }),
    keepalive,
  }).catch(() => {});
}

/**
 * One conversation, with no words on screen: the note being heard climbs the 1D-5D spacetime
 * field, and the thread below is voices as avatars and waveforms. Async voice notes and live
 * streams, newest first. Everything plays back as a
 * single chronological playlist in the AudioDock, so "play from here" keeps going through the
 * replies. Polls for new notes and live presence while the tab is visible.
 */
export function TalkThread({
  initial,
  viewerId,
}: {
  initial: ThreadDTO;
  viewerId: string;
}) {
  const conversationId = initial.id;
  const [notes, setNotes] = useState(initial.notes);
  const [members, setMembers] = useState(initial.members);
  const [pending, setPending] = useState<Pending[]>([]);
  const [mode, setMode] = useState<Mode>("note");
  const [currentLiveId, setCurrentLiveId] = useState<string | null>(null);
  const sessions = useRef<RecordingSession[]>([]);
  const [following, setFollowing] = useState<string | null>(null);
  const lastHeard = useRef<string | null>(null);
  const notesRef = useRef(notes);
  const [, startTransition] = useTransition();

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const names = useMemo(
    () => new Map(members.map((m) => [m.id, m.you ? "You" : m.name])),
    [members],
  );

  const playlist = useMemo<Playlist | null>(
    () =>
      notes.length > 0
        ? {
            key: `talk:${conversationId}`,
            title: initial.title,
            segments: notes.map((n) => ({
              id: n.id,
              durationMs: n.durationMs,
              transcript: n.transcription,
            })),
            audioUrl: noteAudioUrl,
          }
        : null,
    [notes, conversationId, initial.title],
  );
  const { activeId, playFrom } = usePlaylist(playlist);
  const playing = usePlayback((s) => s.playing);

  const upload = useCallback(
    async (item: Pending) => {
      const form = new FormData();
      form.append("audio", item.span.blob);
      form.append("startedAt", item.span.startedAt.toISOString());
      form.append("endedAt", item.span.endedAt.toISOString());
      form.append("durationMs", String(Math.round(item.span.durationMs)));
      if (item.liveId) form.append("liveId", item.liveId);
      try {
        const res = await fetch(`/api/talk/${conversationId}/notes`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(String(res.status));
        const { note } = (await res.json()) as { note: NoteDTO };
        setNotes((prev) => mergeNotes(prev, [note]));
        setPending((prev) => prev.filter((p) => p.id !== item.id));
      } catch {
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, failed: true } : p)),
        );
      }
    },
    [conversationId],
  );

  const onSpan = useCallback(
    (span: CapturedSpan) => {
      const item = {
        id: crypto.randomUUID(),
        span,
        liveId: liveIdFor(span.startedAt, sessions.current),
      };
      setPending((prev) => [...prev, item]);
      void upload(item);
    },
    [upload],
  );

  const recorder = useRecorder(onSpan);
  const recording = recorder.state === "recording";
  const liveNow = mode === "live" && recorder.state !== "idle";

  const start = async (next: Mode) => {
    const liveId = next === "live" ? crypto.randomUUID() : null;
    sessions.current = [
      ...sessions.current.slice(-20),
      { liveId, startedAt: Date.now() },
    ];
    setCurrentLiveId(liveId);
    setMode(next);
    await recorder.record();
  };

  const finish = () => {
    recorder.stop();
    if (mode === "live") void postLive(conversationId, null);
  };

  // While live: announce presence and cut a new playable clip every few seconds.
  const { cut } = recorder;
  useEffect(() => {
    if (mode !== "live" || !recording || !currentLiveId) return;
    void postLive(conversationId, currentLiveId);
    const timer = setInterval(cut, LIVE_PART_MS);
    return () => clearInterval(timer);
  }, [mode, recording, currentLiveId, conversationId, cut]);

  // Leaving the page mid-stream ends the live presence (the last clip still uploads).
  const liveActive = useRef(false);
  useEffect(() => {
    liveActive.current = liveNow;
  }, [liveNow]);
  useEffect(
    () => () => {
      if (liveActive.current) void postLive(conversationId, null, true);
    },
    [conversationId],
  );

  // Poll for replies and presence; faster while someone is live or a transcript is pending.
  const othersLive = members.some((m) => !m.you && m.liveId);
  const transcribing = notes.some((n) => n.transcriptionStatus === "PENDING");
  const interval = othersLive || following ? 1500 : transcribing ? 3000 : 6000;
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const since = pollCursor(notesRef.current);
      const res = await fetch(
        `/api/talk/${conversationId}${since ? `?since=${encodeURIComponent(since)}` : ""}`,
        { cache: "no-store" },
      ).catch(() => null);
      if (!res?.ok || cancelled) return;
      const data = (await res.json()) as {
        members: MemberDTO[];
        notes: NoteDTO[];
        noteIds: string[];
        asOf: string;
      };
      const known = new Set(notesRef.current.map((n) => n.id));
      setMembers(data.members);
      setNotes((prev) => reconcileNotes(prev, data.notes, data.noteIds, data.asOf));
      if (data.notes.some((n) => n.senderId !== viewerId && !known.has(n.id))) {
        void markReadAction(conversationId);
      }
    };
    const timer = setInterval(tick, interval);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [conversationId, interval, viewerId]);

  // Following someone live: whenever playback goes idle, play their next clip as it lands.
  // Only clips of the followed stream count as "heard"; the dock may auto-advance into other
  // replies, which must not reset the stream back to its first clip.
  useEffect(() => {
    if (!activeId || !following) return;
    if (notesRef.current.find((n) => n.id === activeId)?.liveId === following) {
      lastHeard.current = activeId;
    }
  }, [activeId, following]);
  useEffect(() => {
    if (!following || playing) return;
    const next = nextLivePart(notes, following, lastHeard.current);
    if (next && next.id !== lastHeard.current) {
      lastHeard.current = next.id;
      playFrom(next.id);
    }
  }, [following, playing, notes, playFrom]);

  const listenLive = (liveId: string) => {
    const parts = notes.filter((n) => n.liveId === liveId);
    const edge = parts.at(-1);
    lastHeard.current = null;
    setFollowing(liveId);
    // Jump to the live edge; the effect above keeps up from there.
    if (edge) {
      lastHeard.current = edge.id;
      playFrom(edge.id);
    }
  };

  const remove = (ids: string[]) => {
    if (
      !window.confirm("Unsend this? The audio and transcript are destroyed for everyone.")
    )
      return;
    startTransition(async () => {
      const { deleted } = await deleteNotesAction(ids);
      if (deleted > 0) setNotes((prev) => prev.filter((n) => !ids.includes(n.id)));
    });
  };

  const leave = () => {
    if (
      !window.confirm(
        "Leave this conversation? Your notes stay for the others. If you're the last one here, everything is deleted.",
      )
    )
      return;
    startTransition(() => leaveConversationAction(conversationId));
  };

  const liveElsewhere = members.filter((m) => !m.you && m.liveId);
  const liveElapsed =
    notes
      .filter((n) => currentLiveId && n.liveId === currentLiveId)
      .reduce((sum, n) => sum + n.durationMs, 0) +
    pending
      .filter((p) => currentLiveId && p.liveId === currentLiveId)
      .reduce((sum, p) => sum + p.span.durationMs, 0) +
    (recording ? recorder.elapsedMs : 0);

  const items = groupThread(notes).reverse();
  const [lastHeardId, setLastHeardId] = useState<string | null>(null);
  if (activeId && activeId !== lastHeardId) setLastHeardId(activeId);
  const fieldNote = notes.find((n) => n.id === (activeId ?? lastHeardId)) ?? null;

  return (
    <div className="pb-32">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="sr-only">{initial.title}</h1>
        <div className="flex -space-x-2" role="list" aria-label="Members">
          {members.map((m) => (
            <span key={m.id} role="listitem" title={m.you ? "You" : m.name}>
              <Avatar image={m.image} name={m.name} size={36} />
              <span className="sr-only">{m.you ? "You" : m.name}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <InviteButton
            conversationId={conversationId}
            initialToken={initial.inviteToken}
          />
          <IconButton onClick={leave} label="Leave" tone="quiet">
            <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
          </IconButton>
        </div>
      </header>

      <nav aria-label="Open in a dimension" className="mt-4 flex gap-2">
        {DIMENSIONS.map((dim) => (
          <Link
            key={dim.d}
            href={inTalk(dim.href, conversationId)}
            aria-label={dim.label}
            className="border-chalk/20 text-dust hover:border-ochre hover:text-chalk flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs transition-colors"
          >
            {dim.d}D
          </Link>
        ))}
      </nav>

      {liveElsewhere.map((m) => (
        <div key={m.id} className="mt-6 flex items-center justify-center gap-4">
          <span className="relative" title={m.name}>
            <span
              aria-hidden="true"
              className="border-ochre absolute -inset-1.5 animate-pulse rounded-full border-2"
            />
            <Avatar image={m.image} name={m.name} size={44} />
          </span>
          {following === m.liveId ? (
            <IconButton
              onClick={() => setFollowing(null)}
              label={`Stop listening to ${m.name}`}
              tone="quiet"
            >
              <path d="M6 6h12v12H6z" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => listenLive(m.liveId!)}
              label={`Listen live to ${m.name}`}
              tone="primary"
            >
              <path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z" />
            </IconButton>
          )}
        </div>
      ))}

      <div className="mt-4">
        <TalkField
          note={fieldNote}
          playing={Boolean(activeId)}
          recording={recording}
          level={recorder.level}
          audioUrl={noteAudioUrl}
        />
      </div>

      <Composer
        recorder={recorder}
        mode={mode}
        liveElapsed={liveElapsed}
        onNote={() => void start("note")}
        onLive={() => void start("live")}
        onFinish={finish}
      />

      {pending.some((p) => p.failed) ? (
        <div className="mt-4 flex justify-center">
          <IconButton
            onClick={() => pending.filter((p) => p.failed).forEach((p) => void upload(p))}
            label="Retry failed sends"
            tone="alert"
          >
            <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
          </IconButton>
        </div>
      ) : null}

      <div className="mt-10">
        <ul className="mb-3 flex flex-col items-end gap-3">
          {pending
            .filter((p) => !p.liveId || p.failed)
            .map((p) => (
              <li
                key={p.id}
                className={`h-11 rounded-full border border-dashed ${
                  p.failed ? "border-ochre/60" : "border-chalk/25 animate-pulse"
                }`}
                style={{ width: glyphWidth(p.span.durationMs) }}
              >
                <span className="sr-only">
                  {p.failed ? "Send failed" : "Sending"} ·{" "}
                  {formatDuration(p.span.durationMs)}
                </span>
              </li>
            ))}
        </ul>
        {items.length === 0 && pending.length === 0 ? (
          <p className="sr-only">Nothing said yet.</p>
        ) : (
          <ThreadList
            items={items}
            names={names}
            members={members}
            viewerId={viewerId}
            activeId={activeId}
            liveIds={new Set(members.map((m) => m.liveId).filter(Boolean) as string[])}
            onPlay={playFrom}
            onDelete={remove}
          />
        )}
      </div>
    </div>
  );
}

function Composer({
  recorder,
  mode,
  liveElapsed,
  onNote,
  onLive,
  onFinish,
}: {
  recorder: ReturnType<typeof useRecorder>;
  mode: Mode;
  liveElapsed: number;
  onNote: () => void;
  onLive: () => void;
  onFinish: () => void;
}) {
  const { state, elapsedMs, error, supported } = recorder;
  const live = mode === "live";

  return (
    <section className="mt-2 flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-4">
        {state === "idle" ? (
          <>
            <IconButton
              onClick={onNote}
              label="Record voice note"
              tone="primary"
              size="lg"
              disabled={!supported}
            >
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
            </IconButton>
            <IconButton onClick={onLive} label="Go live" disabled={!supported}>
              <path d="M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
            </IconButton>
          </>
        ) : null}
        {state === "recording" ? (
          <IconButton
            onClick={onFinish}
            label={live ? "End live" : "Send"}
            tone="primary"
            size="lg"
          >
            {live ? <path d="M7 7h10v10H7z" /> : <path d="M5 12h13M13 6l6 6-6 6" />}
          </IconButton>
        ) : null}
        {state === "paused" ? (
          <>
            <IconButton
              onClick={() => void recorder.resume()}
              label={live ? "Resume live" : "Keep talking"}
              tone="primary"
              size="lg"
            >
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
            </IconButton>
            <IconButton onClick={onFinish} label={live ? "End live" : "Done"}>
              <path d="M5 12l5 5 9-10" />
            </IconButton>
          </>
        ) : null}
      </div>
      {state === "recording" && live ? (
        <span
          aria-hidden="true"
          className="bg-ochre h-2 w-2 animate-pulse rounded-full"
        />
      ) : null}
      <p role="status" className="sr-only">
        {state === "recording"
          ? live
            ? `Live, ${formatDuration(liveElapsed)}. Anyone here hears you now.`
            : `Recording, ${formatDuration(elapsedMs)}`
          : state === "paused"
            ? "Paused. What you said so far was sent."
            : "Send a voice note or go live."}
      </p>
      {error ? (
        <p
          role="alert"
          data-testid="recorder-error"
          className="text-ochre text-center text-sm"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

const TONES = {
  primary: "bg-ochre text-blackboard hover:opacity-90",
  plain: "border-chalk/25 text-chalk hover:border-ochre hover:text-ochre border",
  quiet: "text-dust hover:text-ochre",
  alert: "border-ochre/60 text-ochre border",
} as const;

function IconButton({
  onClick,
  label,
  tone = "plain",
  size = "md",
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  tone?: keyof typeof TONES;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const box = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${box} ${TONES[tone]}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={icon}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}

/** Width of a note's glyph: grows with its length, on a log scale so long notes stay on screen. */
function glyphWidth(durationMs: number): string {
  const seconds = Math.max(1, durationMs / 1000);
  return `${Math.min(100, 28 + Math.log2(seconds) * 12)}%`;
}

function itemStart(item: ThreadItem<NoteDTO>) {
  return item.kind === "note" ? item.note.startedAt : item.parts[0].startedAt;
}

function ThreadList({
  items,
  names,
  members,
  viewerId,
  activeId,
  liveIds,
  onPlay,
  onDelete,
}: {
  items: ThreadItem<NoteDTO>[];
  names: Map<string, string>;
  members: MemberDTO[];
  viewerId: string;
  activeId: string | null;
  liveIds: Set<string>;
  onPlay: (id: string) => void;
  onDelete: (ids: string[]) => void;
}) {
  const groups: { day: string; items: ThreadItem<NoteDTO>[] }[] = [];
  for (const item of items) {
    const day = formatDay(itemStart(item));
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  const people = new Map(members.map((m) => [m.id, m]));

  return (
    <ol>
      {groups.map((group) => (
        <li key={group.day} className="mb-8">
          <div aria-hidden="true" className="hairline mb-4" />
          <h2 className="sr-only">{group.day}</h2>
          <ol className="space-y-3">
            {group.items.map((item) => {
              const parts = item.kind === "note" ? [item.note] : item.parts;
              const first = parts[0];
              const mine = first.senderId === viewerId;
              const active = parts.some((p) => p.id === activeId);
              const liveNow = item.kind === "live" && liveIds.has(item.liveId);
              const durationMs = parts.reduce((s, p) => s + p.durationMs, 0);
              const sender = people.get(first.senderId);
              const name = names.get(first.senderId) ?? "Someone";
              const transcript = parts
                .map((p) => p.transcription?.trim())
                .filter(Boolean)
                .join(" ");
              return (
                <li
                  key={item.kind === "note" ? item.note.id : item.liveId}
                  className={`flex items-center gap-2 ${mine ? "flex-row-reverse" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onPlay(first.id)}
                    aria-label={`Play ${name} from ${formatTime(first.startedAt)}, ${formatDuration(durationMs)}`}
                    className={`flex h-12 items-center gap-3 rounded-full border px-1.5 pr-4 transition-colors ${
                      mine ? "flex-row-reverse pr-1.5 pl-4" : ""
                    } ${
                      active
                        ? "border-ochre/60 bg-chalk/[0.05]"
                        : "border-chalk/15 hover:border-chalk/40"
                    }`}
                    style={{ width: glyphWidth(durationMs) }}
                  >
                    <span className="relative shrink-0">
                      {liveNow ? (
                        <span
                          aria-hidden="true"
                          className="border-ochre absolute -inset-1 animate-pulse rounded-full border-2"
                        />
                      ) : null}
                      <Avatar
                        image={sender?.image}
                        name={sender?.name ?? name}
                        size={36}
                      />
                    </span>
                    <Glyph seed={first.id} active={active} />
                  </button>
                  {mine ? (
                    <IconButton
                      onClick={() => onDelete(parts.map((p) => p.id))}
                      label="Unsend"
                      tone="quiet"
                      size="sm"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </IconButton>
                  ) : null}
                  {transcript ? <p className="sr-only">{transcript}</p> : null}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}

/** A note's waveform stand-in: deterministic bars from its id, lit while it plays. */
function glyphBars(seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const bars: number[] = [];
  for (let i = 0; i < 24; i += 1) {
    h = (h * 1103515245 + 12345) | 0;
    bars.push(25 + (Math.abs(h >> 8) % 75) * Math.sin(((i + 1) / 25) * Math.PI));
  }
  return bars;
}

function Glyph({ seed, active }: { seed: string; active: boolean }) {
  const bars = glyphBars(seed);
  return (
    <span aria-hidden="true" className="flex h-7 min-w-0 flex-1 items-center gap-[3px]">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-[3px] shrink-0 rounded-full ${active ? "bg-ochre" : "bg-chalk/35"}`}
          style={{ height: `${Math.min(100, height)}%` }}
        />
      ))}
    </span>
  );
}

function InviteButton({
  conversationId,
  initialToken,
}: {
  conversationId: string;
  initialToken: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [url, setUrl] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const linkFor = (t: string) => `${window.location.origin}/talk/join/${t}`;

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void QRCode.toString(url, {
      type: "svg",
      margin: 1,
      color: { dark: "#f1ede1", light: "#000000" },
    }).then((svg) => {
      if (!cancelled) setQr(svg);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const open = async () => {
    const link = linkFor(token);
    setUrl(link);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url: link });
        return;
      } catch {
        // Dismissed or unsupported; fall back to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const rotate = () =>
    start(async () => {
      const { token: next } = await rotateInviteAction(conversationId);
      setToken(next);
      setUrl(linkFor(next));
      setCopied(false);
    });

  return (
    <div className="relative">
      <IconButton
        onClick={() => (url ? setUrl(null) : void open())}
        label="Invite"
        tone="plain"
      >
        <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
      </IconButton>
      {url ? (
        <div className="border-chalk/15 bg-blackboard absolute right-0 z-20 mt-2 flex w-56 flex-col items-center gap-3 rounded-sm border p-4 shadow-xl">
          {qr ? (
            <div
              className="w-44 overflow-hidden rounded-sm"
              role="img"
              aria-label="Invite code"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          ) : (
            <div aria-hidden="true" className="bg-chalk/5 h-44 w-44 animate-pulse" />
          )}
          <input readOnly value={url} aria-label="Invite link" className="sr-only" />
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() =>
                void navigator.clipboard.writeText(url).then(
                  () => setCopied(true),
                  () => setCopied(false),
                )
              }
              label={copied ? "Copied" : "Copy invite link"}
              size="sm"
            >
              {copied ? (
                <path d="M5 12l5 5 9-10" />
              ) : (
                <path d="M8 8h11v11H8zM5 16V5h11" />
              )}
            </IconButton>
            <IconButton
              onClick={rotate}
              label="Make a new link (old one stops working)"
              tone="quiet"
              size="sm"
              disabled={pending}
            >
              <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
            </IconButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
