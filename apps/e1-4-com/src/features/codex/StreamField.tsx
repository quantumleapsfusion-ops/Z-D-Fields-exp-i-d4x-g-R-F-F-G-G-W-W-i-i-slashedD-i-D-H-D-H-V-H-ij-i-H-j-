"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useRef, useState, useTransition } from "react";

import { createShareAction } from "@/app/actions/stream";
import { MicMark } from "@/components/MicMark";
import { decodeSound } from "@/features/sound/decode";
import type { Form } from "@/lib/gravity/superposition";
import type { SoundPrint } from "@/lib/sound/analyse";
import { commentOn } from "@/lib/sound/commentary";
import { readSound } from "@/lib/sound/reading";
import { haptic } from "@/lib/device/haptics";

import type { PinPhase } from "./PinField";
import { speak } from "./voice";

const PinField = dynamic(() => import("./PinField"), { ssr: false });

export type StreamEntry = { id: string; durationMs: number; audioUrl: string };

/**
 * The stream you come back to: every original entry is a bead along the bottom. Touching one
 * plays it as it was recorded, raises it in the metal, then folds it into its shape and speaks.
 */
export function StreamField({ entries }: { entries: StreamEntry[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<PinPhase>("rest");
  const [print, setPrint] = useState<SoundPrint | null>(null);
  const [form, setForm] = useState<Form | undefined>(undefined);
  const [pulse, setPulse] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAudio, setShareAudio] = useState(true);
  const [shareTranscript, setShareTranscript] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareQr, setShareQr] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [, startShareTransition] = useTransition();
  const stop = useRef<() => void>(() => {});

  useEffect(() => () => stop.current(), []);

  useEffect(() => {
    if (!shareUrl) return;
    let cancelled = false;
    void QRCode.toString(shareUrl, {
      type: "svg",
      margin: 1,
      color: { dark: "#f1ede1", light: "#000000" },
    }).then((svg) => {
      if (!cancelled) setShareQr(svg);
    });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const openShare = async () => {
    if (!active) return;
    haptic("play");
    startShareTransition(async () => {
      const { token } = await createShareAction({
        segmentId: active,
        includeAudio: shareAudio,
        includeTranscript: shareTranscript,
      });
      const link = `${window.location.origin}/s/${token}`;
      setShareUrl(link);
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ url: link });
          return;
        } catch {
          // Dismissed or unsupported; fall back to copy
        }
      }
      try {
        await navigator.clipboard.writeText(link);
        setShareCopied(true);
      } catch {
        setShareCopied(false);
      }
    });
  };

  const open = async (entry: StreamEntry) => {
    stop.current();
    setActive(entry.id);
    setPhase("listen");
    let cancelled = false;
    let cancelVoice = () => {};
    const audio = new Audio();
    stop.current = () => {
      cancelled = true;
      audio.pause();
      cancelVoice();
    };
    try {
      const res = await fetch(entry.audioUrl);
      if (!res.ok || cancelled) return;
      const blob = await res.blob();
      const measured = await decodeSound([blob]);
      if (cancelled) return;
      setPrint(measured);
      if (measured) {
        const reading = readSound(measured);
        setForm(reading.candidates[reading.resolvedIndex].form);
      }
      setPhase(measured ? "relief" : "listen");
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (cancelled || !measured) return setPhase("rest");
        setPhase("form");
        cancelVoice = speak(commentOn(measured), {
          onLine: () => {},
          onWord: () => setPulse((p) => p + 1),
          onEnd: () => {},
        });
      };
      await audio.play().catch(() => audio.onended?.(new Event("ended")));
    } catch {
      setPhase("rest");
    }
  };

  const longest = Math.max(1, ...entries.map((e) => e.durationMs));

  return (
    <main className="relative h-dvh overflow-hidden bg-black">
      <div className="absolute inset-0">
        <PinField phase={phase} print={print} form={form} pulse={pulse} />
      </div>
      <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-6 z-10 flex gap-3">
        {active ? (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Send this moment"
            className="h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f4f6f8,#8a929c_45%,#2b2f35)] shadow-[0_0_24px_rgba(0,0,0,0.9)] hover:opacity-90 transition flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <circle cx="18" cy="5" r="3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
            </svg>
          </button>
        ) : null}
        <Link
          href="/"
          aria-label="Speak"
          className="h-12 w-12"
        >
          <MicMark className="h-full w-full" />
        </Link>
      </div>
      {entries.length === 0 ? <p className="sr-only">Your stream is silent.</p> : null}
      <ol
        aria-label="Your stream"
        className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 overflow-x-auto px-6 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
      >
        {entries.map((entry, i) => {
          const size = 28 + Math.round(36 * Math.sqrt(entry.durationMs / longest));
          return (
            <li key={entry.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Entry ${i + 1}`}
                aria-pressed={active === entry.id}
                onClick={() => void open(entry)}
                style={{ width: size, height: size }}
                className={`rounded-full bg-[radial-gradient(circle_at_30%_30%,#f4f6f8,#8a929c_45%,#2b2f35)] shadow-[0_0_24px_rgba(0,0,0,0.9)] transition ${
                  active === entry.id
                    ? "ring-2 ring-[#1f6bff] ring-offset-2 ring-offset-black"
                    : "opacity-80 hover:opacity-100"
                }`}
              />
            </li>
          );
        })}
      </ol>
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-blackboard border-chalk/15 rounded-lg border p-6 w-96 max-w-[calc(100%-2rem)] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Send this moment</h2>
              <button
                type="button"
                onClick={() => {
                  setShareOpen(false);
                  setShareUrl(null);
                  setShareQr(null);
                }}
                aria-label="Close"
                className="text-chalk/60 hover:text-chalk transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {shareUrl ? (
              <div className="space-y-4">
                {shareQr ? (
                  <div
                    className="w-full overflow-hidden rounded-sm"
                    role="img"
                    aria-label="Share code"
                    dangerouslySetInnerHTML={{ __html: shareQr }}
                  />
                ) : (
                  <div aria-hidden="true" className="bg-chalk/5 h-56 w-full animate-pulse rounded-sm" />
                )}
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    aria-label="Share link"
                    className="flex-1 bg-chalk/5 border border-chalk/15 rounded px-3 py-2 text-sm text-chalk/80 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl).then(
                        () => setShareCopied(true),
                        () => setShareCopied(false),
                      );
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className="bg-ochre text-blackboard px-4 py-2 rounded font-semibold hover:opacity-90 transition text-sm"
                  >
                    {shareCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareAudio}
                      onChange={(e) => setShareAudio(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include audio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareTranscript}
                      onChange={(e) => setShareTranscript(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include transcript</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShareOpen(false);
                    }}
                    className="flex-1 border border-chalk/25 text-chalk px-4 py-2 rounded font-semibold hover:border-chalk/40 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={openShare}
                    disabled={!shareAudio && !shareTranscript}
                    className="flex-1 bg-ochre text-blackboard px-4 py-2 rounded font-semibold hover:opacity-90 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
