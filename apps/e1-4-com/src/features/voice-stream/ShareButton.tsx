"use client";

import { useState, useTransition } from "react";

import { createShareAction } from "@/app/actions/stream";
import { haptic } from "@/lib/device/haptics";

export function ShareButton({
  segmentId,
  label,
}: {
  segmentId: string | null;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      haptic("saved");
      setCopied(true);
      setError("");
    } catch {
      haptic("rejected");
      setError("Copy unavailable. Select the link below.");
    }
  };

  const create = () =>
    start(async () => {
      try {
        const { token } = await createShareAction({
          segmentId,
          includeAudio,
          includeTranscript,
        });
        haptic("saved");
        setUrl(`${window.location.origin}/s/${token}`);
        setError("");
      } catch {
        haptic("rejected");
        setError("Could not create a share link. Try again.");
      }
    });

  const send = async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "e1-4 voice", url });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        await copy(url);
      }
    } else {
      await copy(url);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          haptic("stage");
          setOpen((v) => !v);
          setUrl(null);
          setCopied(false);
          setError("");
        }}
        aria-label={label}
        title={label}
        className="text-dust hover:text-ochre flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="5" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m7.3 10.9 8.4-4.7m-8.4 6.9 8.4 4.7" />
        </svg>
      </button>
      {open ? (
        <div className="border-chalk/15 bg-blackboard absolute right-0 z-20 mt-2 w-72 rounded-sm border p-4 shadow-xl">
          <p className="label mb-3">Public link</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeAudio}
              disabled={Boolean(url)}
              onChange={(e) => setIncludeAudio(e.target.checked)}
            />
            Audio
          </label>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeTranscript}
              disabled={Boolean(url)}
              onChange={(e) => setIncludeTranscript(e.target.checked)}
            />
            Transcription
          </label>
          {url ? (
            <div className="mt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={send}
                  className="bg-ochre text-blackboard flex-1 rounded-full px-3 py-2 text-sm"
                >
                  Send to a friend
                </button>
                <button
                  type="button"
                  onClick={() => void copy(url)}
                  aria-label="Copy share link"
                  title="Copy share link"
                  className="border-chalk/30 rounded-full border px-3 py-2"
                >
                  ⧉
                </button>
              </div>
              {error ? (
                <input
                  readOnly
                  aria-label="Share link"
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="border-chalk/15 mt-2 w-full rounded-sm border bg-transparent px-2 py-1 font-mono text-xs"
                />
              ) : null}
              <p className="text-dust mt-1 text-xs">
                {copied ? "Copied. " : ""}Anyone with the link can open it. Revoke from
                your profile.
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={pending || (!includeAudio && !includeTranscript)}
              onClick={create}
              className="bg-ochre text-blackboard mt-4 w-full rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create link"}
            </button>
          )}
          {error ? (
            <p role="alert" className="text-ochre mt-2 text-xs">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
