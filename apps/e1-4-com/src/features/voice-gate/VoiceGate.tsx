"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useLiveTranscription,
  type FinalPhrase,
  type LiveTranscription,
} from "@/features/live/useLiveTranscription";
import { enrollVoiceAction, verifyVoiceAction } from "@/lib/auth/actions";
import type { VoiceAuthResult } from "@/lib/auth/voice";
import { startVoiceCapture, type VoiceCapture } from "@/lib/voice/capture";
import { isUsablePhrase, MIN_VOICED_FRAMES, phraseKey } from "@/lib/voice/voiceprint";

const ENROL_SAMPLES = 3;

type Stage =
  | { kind: "idle" }
  | { kind: "listening"; mode: "verify" | "enrol"; take: number }
  | { kind: "checking" }
  | { kind: "enrol-offer"; phrase: string }
  | { kind: "enrolling"; phrase: string; samples: number[][] }
  | { kind: "welcome" }
  | { kind: "error"; message: string; retryMode: "verify" | "enrol" };

/**
 * The voice gate. No forms, no email: say your voice name and the site hears
 * both *what* you said (speech recognition) and *how* you said it (voice
 * print). Unknown names are offered enrolment; enrolment records the name a
 * few times so the print is stable.
 */
export function VoiceGate({ next }: { next: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [heard, setHeard] = useState("");
  const [level, setLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const captureRef = useRef<VoiceCapture | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  const liveRef = useRef<LiveTranscription | null>(null);
  const pendingEnrol = useRef<{ phrase: string; samples: number[][] } | null>(null);

  const releaseMic = useCallback(() => {
    captureRef.current?.cancel();
    captureRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => releaseMic, [releaseMic]);

  useEffect(() => {
    if (stage.kind !== "listening") return;
    const id = setInterval(() => {
      const cap = captureRef.current;
      if (!cap) return;
      setLevel(cap.level());
      setProgress(Math.min(1, cap.voicedFrames() / MIN_VOICED_FRAMES));
    }, 80);
    return () => clearInterval(id);
  }, [stage.kind]);

  const handleResult = useCallback(
    (result: VoiceAuthResult, phrase: string, retryMode: "verify" | "enrol") => {
      if (result.ok) {
        setStage({ kind: "welcome" });
        router.replace(next);
        router.refresh();
        return;
      }
      if (result.reason === "unknown-phrase") {
        setStage({ kind: "enrol-offer", phrase });
        return;
      }
      setStage({ kind: "error", message: result.message, retryMode });
    },
    [next, router],
  );

  const onPhrase = useCallback(
    async (p: FinalPhrase) => {
      const current = stageRef.current;
      if (current.kind !== "listening") return;
      const key = phraseKey(p.text);
      setHeard(p.text);
      if (!isUsablePhrase(key)) return;
      const cap = captureRef.current;
      if (!cap || cap.voicedFrames() < MIN_VOICED_FRAMES) return;

      liveRef.current?.stop();
      let embedding: number[];
      try {
        embedding = cap.finish();
      } catch (e) {
        releaseMic();
        setStage({
          kind: "error",
          message: e instanceof Error ? e.message : "Couldn't hear you.",
          retryMode: current.mode,
        });
        return;
      }
      captureRef.current = null;
      releaseMic();

      if (current.mode === "verify") {
        setStage({ kind: "checking" });
        handleResult(await verifyVoiceAction({ phrase: key, embedding }), key, "verify");
        return;
      }

      // Enrolment: collect ENROL_SAMPLES utterances of the same name.
      const pending = pendingEnrol.current;
      if (pending && pending.phrase !== key) {
        setStage({
          kind: "error",
          message: `Heard “${key}” — say “${pending.phrase}” again so the takes match.`,
          retryMode: "enrol",
        });
        return;
      }
      const samples = [...(pending?.samples ?? []), embedding];
      pendingEnrol.current = { phrase: key, samples };
      if (samples.length < ENROL_SAMPLES) {
        setStage({ kind: "enrolling", phrase: key, samples });
        return;
      }
      setStage({ kind: "checking" });
      pendingEnrol.current = null;
      handleResult(await enrollVoiceAction({ phrase: key, samples }), key, "enrol");
    },
    [handleResult, releaseMic],
  );

  const live = useLiveTranscription(onPhrase);
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  const listen = useCallback(
    async (mode: "verify" | "enrol") => {
      setHeard("");
      setLevel(0);
      setProgress(0);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        captureRef.current = startVoiceCapture(stream);
      } catch {
        setStage({
          kind: "error",
          message: "Microphone access is needed — your voice is the key here.",
          retryMode: mode,
        });
        return;
      }
      setStage({
        kind: "listening",
        mode,
        take: (pendingEnrol.current?.samples.length ?? 0) + 1,
      });
      await live.start();
    },
    [live],
  );

  const startEnrol = useCallback(
    (phrase: string) => {
      pendingEnrol.current = { phrase, samples: [] };
      void listen("enrol");
    },
    [listen],
  );

  const cancel = useCallback(() => {
    live.stop();
    releaseMic();
    pendingEnrol.current = null;
    setStage({ kind: "idle" });
  }, [live, releaseMic]);

  if (!live.supported) {
    return (
      <p className="border-ochre text-ochre rounded-(--radius-board) border px-4 py-3 text-sm">
        This browser has no speech recognition. Open e1-4 in Chrome, Edge or Safari to be
        heard.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => (stage.kind === "listening" ? cancel() : void listen("verify"))}
          disabled={stage.kind === "checking" || stage.kind === "welcome"}
          aria-pressed={stage.kind === "listening"}
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
            stage.kind === "listening"
              ? "bg-ochre text-blackboard"
              : "border-chalk/25 text-chalk hover:border-ochre hover:text-ochre border"
          }`}
        >
          {stage.kind === "listening" ? (
            <span
              aria-hidden="true"
              className="bg-blackboard/30 absolute inset-0 rounded-full"
              style={{
                transform: `scale(${1 + level * 0.35})`,
                transition: "transform 80ms",
              }}
            />
          ) : null}
          <span className="relative font-sans text-sm">
            {stage.kind === "listening" ? "Listening" : "Speak"}
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-chalk text-2xl leading-tight">{title(stage)}</p>
          <p className="text-dust mt-1 text-sm">{hint(stage)}</p>
        </div>
      </div>

      {stage.kind === "listening" ? (
        <div className="bg-chalk/10 h-1 w-full overflow-hidden rounded-full">
          <div
            className="bg-ochre h-full transition-[width]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}

      <p className="text-chalk/70 min-h-6 font-sans text-sm" aria-live="polite">
        {live.interim || heard ? `“${live.interim || heard}”` : ""}
      </p>

      {stage.kind === "enrol-offer" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => startEnrol(stage.phrase)}
            className="bg-ochre text-blackboard rounded-full px-5 py-2 font-sans text-sm"
          >
            Yes, that&apos;s me — learn my voice
          </button>
          <button
            type="button"
            onClick={() => void listen("verify")}
            className="border-chalk/25 text-chalk hover:border-ochre hover:text-ochre rounded-full border px-5 py-2 font-sans text-sm"
          >
            No, I&apos;ll say it again
          </button>
        </div>
      ) : null}

      {stage.kind === "enrolling" ? (
        <button
          type="button"
          onClick={() => void listen("enrol")}
          className="bg-ochre text-blackboard self-start rounded-full px-5 py-2 font-sans text-sm"
        >
          Say it again ({stage.samples.length}/{ENROL_SAMPLES})
        </button>
      ) : null}

      {stage.kind === "error" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              stage.retryMode === "enrol" && pendingEnrol.current
                ? void listen("enrol")
                : void listen("verify")
            }
            className="border-chalk/25 text-chalk hover:border-ochre hover:text-ochre rounded-full border px-5 py-2 font-sans text-sm"
          >
            Try again
          </button>
        </div>
      ) : null}

      <p className="label">
        {live.error
          ? live.error
          : live.provider === "deepgram"
            ? "Deepgram live"
            : "Browser speech recognition · your voice print is computed on this device"}
      </p>
    </div>
  );
}

function title(stage: Stage): string {
  switch (stage.kind) {
    case "idle":
      return "Say your voice name.";
    case "listening":
      return stage.mode === "enrol" ? "Say it clearly." : "Listening…";
    case "checking":
      return "Recognising…";
    case "enrol-offer":
      return `New here, “${stage.phrase}”?`;
    case "enrolling":
      return "Good. Once more.";
    case "welcome":
      return "Welcome back, Earthling.";
    case "error":
      return "Hm.";
  }
}

function hint(stage: Stage): string {
  switch (stage.kind) {
    case "idle":
      return "Two or more words that are yours — a name, a phrase. No email, no password.";
    case "listening":
      return stage.mode === "enrol"
        ? `Take ${stage.take} of ${ENROL_SAMPLES}. Same words, natural voice.`
        : "Speak your voice name. We listen to the words and to the voice.";
    case "checking":
      return "Comparing what we heard with the voice we know.";
    case "enrol-offer":
      return `We haven't met that voice name. Learn it now (${ENROL_SAMPLES} short takes)?`;
    case "enrolling":
      return `Heard “${stage.phrase}”. ${ENROL_SAMPLES - stage.samples.length} more take(s) to go.`;
    case "welcome":
      return "Opening the door.";
    case "error":
      return stage.message;
  }
}
