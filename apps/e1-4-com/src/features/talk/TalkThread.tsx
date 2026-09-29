"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  deleteNotesAction,
  leaveConversationAction,
  markReadAction,
  rotateInviteAction,
} from "@/app/actions/talk";
import { Avatar } from "@/components/Avatar";
import { formatDay, formatDuration, formatTime } from "@/features/voice-stream/format";
import { useRecorder, type CapturedSpan } from "@/features/voice-stream/useRecorder";
import { usePlayback, type Playlist } from "@/lib/audio/store";
import { usePlaylist } from "@/lib/audio/usePlaylist";
import type { MemberDTO, NoteDTO, ThreadDTO } from "@/lib/talk/conversations";
import {
  groupThread,
  LIVE_PART_MS,
  mergeNotes,
  nextLivePart,
  pollCursor,
  type ThreadItem,
} from "@/lib/talk/presence";

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
 * One conversation: async voice notes and live streams, newest first. Everything plays back as a
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
  const liveIdRef = useRef<string | null>(null);
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
      const item = { id: crypto.randomUUID(), span, liveId: liveIdRef.current };
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
    liveIdRef.current = liveId;
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
      const data = (await res.json()) as { members: MemberDTO[]; notes: NoteDTO[] };
      const known = new Set(notesRef.current.map((n) => n.id));
      setMembers(data.members);
      setNotes((prev) => mergeNotes(prev, data.notes));
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
  useEffect(() => {
    if (activeId) lastHeard.current = activeId;
  }, [activeId]);
  useEffect(() => {
    if (!following || playing) return;
    const next = nextLivePart(notes, following, lastHeard.current);
    if (next && next.id !== lastHeard.current) playFrom(next.id);
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

  return (
    <div className="pb-32">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display truncate text-3xl tracking-tight sm:text-4xl">
            {initial.title}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {members.map((m) => (
                <Avatar key={m.id} image={m.image} name={m.name} size={28} />
              ))}
            </div>
            <p className="label">
              {members.map((m) => (m.you ? "You" : m.name)).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <InviteButton
            conversationId={conversationId}
            initialToken={initial.inviteToken}
          />
          <button
            type="button"
            onClick={leave}
            className="text-dust hover:text-ochre text-sm"
          >
            Leave
          </button>
        </div>
      </header>

      {liveElsewhere.map((m) => (
        <div
          key={m.id}
          className="border-ochre/40 bg-ochre/[0.06] mt-6 flex items-center justify-between gap-4 rounded-sm border px-4 py-3"
        >
          <p className="text-chalk text-sm">
            <span className="text-ochre animate-pulse">●</span> {m.name} is live now
          </p>
          {following === m.liveId ? (
            <button
              type="button"
              onClick={() => setFollowing(null)}
              className="text-dust hover:text-ochre text-sm"
            >
              Stop listening
            </button>
          ) : (
            <button
              type="button"
              onClick={() => listenLive(m.liveId!)}
              className="bg-ochre text-blackboard rounded-full px-4 py-1.5 text-sm font-medium"
            >
              Listen live
            </button>
          )}
        </div>
      ))}

      <Composer
        recorder={recorder}
        mode={mode}
        liveElapsed={liveElapsed}
        onNote={() => void start("note")}
        onLive={() => void start("live")}
        onFinish={finish}
      />

      {pending.some((p) => p.failed) ? (
        <button
          type="button"
          onClick={() => pending.filter((p) => p.failed).forEach((p) => void upload(p))}
          className="text-ochre mt-4 text-sm"
        >
          Retry failed sends
        </button>
      ) : null}

      <div className="mt-10">
        {pending
          .filter((p) => !p.liveId || p.failed)
          .map((p) => (
            <p
              key={p.id}
              className="border-chalk/15 text-dust mb-3 rounded-sm border border-dashed px-5 py-3 text-sm"
            >
              {p.failed ? "Send failed — kept here until you retry." : "Sending…"}{" "}
              {formatDuration(p.span.durationMs)}
            </p>
          ))}
        {items.length === 0 && pending.length === 0 ? (
          <p className="font-display text-dust text-center text-xl">
            Nothing said yet. Send a voice note, or go live — they can reply whenever.
          </p>
        ) : (
          <ThreadList
            items={items}
            names={names}
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
  const { state, elapsedMs, level, error, supported } = recorder;
  const live = mode === "live";
  const bars = 28;

  return (
    <section className="border-chalk/10 bg-chalk/[0.02] mt-8 rounded-sm border px-6 py-6">
      <div className="flex h-12 items-center justify-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: bars }, (_, i) => {
          const wave = Math.sin((i / bars) * Math.PI);
          const h = state === "recording" ? 8 + wave * level * 90 : 6;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-[height] duration-75 ${
                state === "recording" ? "bg-ochre" : "bg-chalk/25"
              }`}
              style={{ height: `${Math.min(100, h)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {state === "idle" ? (
          <>
            <Pill
              onClick={onNote}
              primary
              disabled={!supported}
              label="Record voice note"
            />
            <Pill onClick={onLive} disabled={!supported} label="Go live" />
          </>
        ) : null}
        {state === "recording" ? (
          <Pill onClick={onFinish} primary label={live ? "End live" : "Send"} />
        ) : null}
        {state === "paused" ? (
          <>
            <Pill
              onClick={() => void recorder.resume()}
              primary
              label={live ? "Resume live" : "Keep talking"}
            />
            <Pill onClick={onFinish} label={live ? "End live" : "Done"} />
          </>
        ) : null}
      </div>

      <p className="text-dust mt-4 text-center font-mono text-xs">
        {state === "recording"
          ? live
            ? `● Live · ${formatDuration(liveElapsed)} — anyone here hears you now`
            : `Recording · ${formatDuration(elapsedMs)}`
          : state === "paused"
            ? "Paused — what you said so far was sent"
            : "No call needed: they listen and reply when they're ready."}
      </p>
      {error ? (
        <p
          role="alert"
          data-testid="recorder-error"
          className="text-ochre mt-2 text-center text-sm"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

function Pill({
  onClick,
  label,
  primary,
  disabled,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-full px-5 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-ochre text-blackboard font-medium hover:opacity-90"
          : "border-chalk/25 text-chalk hover:border-ochre hover:text-ochre border"
      }`}
    >
      {label}
    </button>
  );
}

function itemStart(item: ThreadItem<NoteDTO>) {
  return item.kind === "note" ? item.note.startedAt : item.parts[0].startedAt;
}

function ThreadList({
  items,
  names,
  viewerId,
  activeId,
  liveIds,
  onPlay,
  onDelete,
}: {
  items: ThreadItem<NoteDTO>[];
  names: Map<string, string>;
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

  return (
    <ol>
      {groups.map((group) => (
        <li key={group.day} className="mb-8">
          <p className="label mb-4 text-center">{group.day}</p>
          <ol className="space-y-3">
            {group.items.map((item) => {
              const parts = item.kind === "note" ? [item.note] : item.parts;
              const first = parts[0];
              const mine = first.senderId === viewerId;
              const active = parts.some((p) => p.id === activeId);
              const liveNow = item.kind === "live" && liveIds.has(item.liveId);
              return (
                <li
                  key={item.kind === "note" ? item.note.id : item.liveId}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <article
                    className={`w-full max-w-[85%] rounded-2xl border px-4 py-3 transition-colors ${
                      active
                        ? "border-ochre/50 bg-chalk/[0.05]"
                        : mine
                          ? "border-chalk/15 bg-chalk/[0.03]"
                          : "border-chalk/10"
                    }`}
                  >
                    <header className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onPlay(first.id)}
                          aria-label={`Play from ${formatTime(first.startedAt)}`}
                          className="border-chalk/25 text-chalk hover:border-ochre hover:text-ochre flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                          >
                            <path d="M2 1l9 5-9 5z" fill="currentColor" />
                          </svg>
                        </button>
                        <span className="text-chalk text-sm">
                          {names.get(first.senderId) ?? "Someone"}
                        </span>
                        <span className="text-dust font-mono text-xs">
                          {formatTime(first.startedAt)} ·{" "}
                          {formatDuration(parts.reduce((s, p) => s + p.durationMs, 0))}
                        </span>
                        {item.kind === "live" ? (
                          <span className={`label ${liveNow ? "text-ochre" : ""}`}>
                            {liveNow ? "● Live" : "Live"}
                          </span>
                        ) : null}
                      </div>
                      {mine ? (
                        <button
                          type="button"
                          onClick={() => onDelete(parts.map((p) => p.id))}
                          className="text-dust hover:text-ochre text-xs"
                        >
                          Unsend
                        </button>
                      ) : null}
                    </header>
                    <Transcript parts={parts} />
                  </article>
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function Transcript({ parts }: { parts: NoteDTO[] }) {
  const text = parts
    .map((p) => p.transcription?.trim())
    .filter(Boolean)
    .join(" ");
  if (text) {
    return (
      <p className="font-display text-chalk/90 mt-2 text-base leading-relaxed">{text}</p>
    );
  }
  if (parts.some((p) => p.transcriptionStatus === "PENDING")) {
    return <p className="text-dust mt-2 animate-pulse text-sm">Transcribing…</p>;
  }
  if (parts.every((p) => p.transcriptionStatus === "SKIPPED")) return null;
  if (parts.some((p) => p.transcriptionStatus === "FAILED")) {
    return <p className="text-ochre/80 mt-2 text-sm">Transcription failed.</p>;
  }
  return <p className="text-dust mt-2 text-sm italic">(silence)</p>;
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
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const linkFor = (t: string) => `${window.location.origin}/talk/join/${t}`;

  const open = async () => {
    const link = linkFor(token);
    setUrl(link);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Talk with me on e1-4", url: link });
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
      <button
        type="button"
        onClick={() => (url ? setUrl(null) : void open())}
        className="border-chalk/25 hover:border-ochre hover:text-ochre rounded-full border px-4 py-1.5 text-sm"
      >
        Invite
      </button>
      {url ? (
        <div className="border-chalk/15 bg-blackboard absolute right-0 z-20 mt-2 w-80 rounded-sm border p-4 shadow-xl">
          <p className="label mb-2">Invite link</p>
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="border-chalk/15 w-full rounded-sm border bg-transparent px-2 py-1 font-mono text-xs"
          />
          <p className="text-dust mt-2 text-xs">
            {copied ? "Copied. " : ""}Anyone who opens it and signs in joins this
            conversation.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={rotate}
            className="text-dust hover:text-ochre mt-3 text-xs disabled:opacity-50"
          >
            Make a new link (old one stops working)
          </button>
        </div>
      ) : null}
    </div>
  );
}
