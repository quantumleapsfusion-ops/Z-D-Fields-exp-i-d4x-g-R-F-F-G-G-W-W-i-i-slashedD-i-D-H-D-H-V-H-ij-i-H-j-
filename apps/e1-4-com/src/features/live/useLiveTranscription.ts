"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { LiveTranscriptionConfig } from "@/lib/stt/types";

const subscribeNoop = () => () => {};

function detectSupport(): boolean {
  const hasWebSpeech = Boolean(
    window.SpeechRecognition ?? window.webkitSpeechRecognition,
  );
  const hasMedia =
    Boolean(navigator.mediaDevices?.getUserMedia) && "MediaRecorder" in window;
  return hasWebSpeech || hasMedia;
}

export type FinalPhrase = { id: number; text: string; at: number };

export type LiveTranscription = {
  listening: boolean;
  provider: LiveTranscriptionConfig["provider"] | null;
  supported: boolean;
  phrases: FinalPhrase[];
  interim: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  /** Push text as if it had been spoken — keyboard fallback when no microphone/STT is available. */
  pushText: (text: string) => void;
  reset: () => void;
};

type DeepgramMessage = {
  type?: string;
  is_final?: boolean;
  channel?: { alternatives?: { transcript?: string }[] };
};

/**
 * Real-time speech-to-text shared by Da Vinci, Infinity Chalkboard and Gravity Board.
 * Uses Deepgram's streaming WebSocket when the server can mint a token, otherwise the browser's
 * Web Speech API. `onPhrase` fires once per finalised phrase.
 */
export function useLiveTranscription(
  onPhrase?: (phrase: FinalPhrase) => void,
): LiveTranscription {
  const [listening, setListening] = useState(false);
  const [provider, setProvider] = useState<LiveTranscriptionConfig["provider"] | null>(
    null,
  );
  const [phrases, setPhrases] = useState<FinalPhrase[]>([]);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(subscribeNoop, detectSupport, () => true);

  const nextId = useRef(0);
  const onPhraseRef = useRef(onPhrase);
  const cleanupRef = useRef<(() => void) | null>(null);
  const wantListening = useRef(false);

  useEffect(() => {
    onPhraseRef.current = onPhrase;
  }, [onPhrase]);

  useEffect(() => () => cleanupRef.current?.(), []);

  const pushText = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const phrase = { id: nextId.current++, text, at: Date.now() };
    setPhrases((prev) => [...prev, phrase]);
    onPhraseRef.current?.(phrase);
  }, []);

  const startDeepgram = useCallback(
    async (token: string, model: string) => {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      const params = new URLSearchParams({
        model,
        interim_results: "true",
        smart_format: "true",
        punctuate: "true",
      });
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, [
        "bearer",
        token,
      ]);
      const recorder = new MediaRecorder(media);

      socket.onopen = () => {
        recorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN)
            socket.send(e.data);
        });
        recorder.start(250);
      };
      socket.onmessage = (event) => {
        const msg = JSON.parse(String(event.data)) as DeepgramMessage;
        if (msg.type !== "Results") return;
        const text = msg.channel?.alternatives?.[0]?.transcript ?? "";
        if (msg.is_final) {
          setInterim("");
          pushText(text);
        } else {
          setInterim(text);
        }
      };
      socket.onerror = () => setError("Live transcription connection failed.");
      socket.onclose = () => {
        if (wantListening.current) setListening(false);
      };

      cleanupRef.current = () => {
        if (recorder.state !== "inactive") recorder.stop();
        media.getTracks().forEach((t) => t.stop());
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "CloseStream" }));
          socket.close();
        }
      };
    },
    [pushText],
  );

  const startBrowser = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor)
      throw new Error("This browser has no built-in speech recognition. Type instead.");
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) pushText(result[0].transcript);
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    // Browsers end recognition after silence; restart while the user still wants to listen.
    recognition.onend = () => {
      if (wantListening.current) recognition.start();
    };
    recognition.start();
    cleanupRef.current = () => {
      recognition.onend = null;
      recognition.abort();
    };
  }, [pushText]);

  const start = useCallback(async () => {
    setError(null);
    cleanupRef.current?.();
    wantListening.current = true;
    try {
      const res = await fetch("/api/stt/live", { cache: "no-store" });
      const config: LiveTranscriptionConfig = res.ok
        ? ((await res.json()) as LiveTranscriptionConfig)
        : { provider: "browser" };
      setProvider(config.provider);
      if (config.provider === "deepgram") await startDeepgram(config.token, config.model);
      else startBrowser();
      setListening(true);
    } catch (err) {
      wantListening.current = false;
      setListening(false);
      setError(err instanceof Error ? err.message : "Could not start listening.");
    }
  }, [startBrowser, startDeepgram]);

  const stop = useCallback(() => {
    wantListening.current = false;
    cleanupRef.current?.();
    cleanupRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const reset = useCallback(() => {
    setPhrases([]);
    setInterim("");
  }, []);

  return {
    listening,
    provider,
    supported,
    phrases,
    interim,
    error,
    start,
    stop,
    pushText,
    reset,
  };
}
