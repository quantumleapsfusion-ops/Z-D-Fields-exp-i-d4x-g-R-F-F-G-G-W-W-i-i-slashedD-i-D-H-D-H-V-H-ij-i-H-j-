"use client";

import { useState, useTransition } from "react";

import { createShareAction } from "@/app/actions/stream";

/** Creates a public link (friends or strangers) to one segment or the whole stream. */
export function ShareButton({
  segmentId,
  label,
}: {
  segmentId: string | null;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      const { token } = await createShareAction({
        segmentId,
        includeAudio,
        includeTranscript,
      });
      const link = `${window.location.origin}/s/${token}`;
      setUrl(link);
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setUrl(null);
        }}
        className="text-dust hover:text-ochre text-sm transition-colors"
      >
        {label}
      </button>
      {open ? (
        <div className="border-chalk/15 bg-blackboard absolute right-0 z-20 mt-2 w-72 rounded-sm border p-4 shadow-xl">
          <p className="label mb-3">Public link</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeAudio}
              onChange={(e) => setIncludeAudio(e.target.checked)}
            />
            Audio
          </label>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeTranscript}
              onChange={(e) => setIncludeTranscript(e.target.checked)}
            />
            Transcription
          </label>
          {url ? (
            <div className="mt-3">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="border-chalk/15 w-full rounded-sm border bg-transparent px-2 py-1 font-mono text-xs"
              />
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
        </div>
      ) : null}
    </div>
  );
}
