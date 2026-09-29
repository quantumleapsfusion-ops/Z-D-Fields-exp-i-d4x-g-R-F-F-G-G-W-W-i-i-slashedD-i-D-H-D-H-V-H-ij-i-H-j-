"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { VOICE_SAMPLE_RATE, concatPcm, floatToInt16 } from "@/lib/voice-id/pcm";

const WORKLET = `
registerProcessor("voice-tap", class extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
});`;

type Session = {
  media: MediaStream;
  context: AudioContext;
  node: AudioWorkletNode;
  chunks: Float32Array[];
};

async function resample(samples: Float32Array, fromRate: number): Promise<Int16Array> {
  if (samples.length === 0) return new Int16Array(0);
  const length = Math.ceil((samples.length * VOICE_SAMPLE_RATE) / fromRate);
  const offline = new OfflineAudioContext(1, length, VOICE_SAMPLE_RATE);
  const buffer = offline.createBuffer(1, samples.length, fromRate);
  buffer.copyToChannel(new Float32Array(samples), 0);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  return floatToInt16((await offline.startRendering()).getChannelData(0));
}

/**
 * Raw microphone capture for voice ID: 16 kHz mono 16-bit PCM, which is what the speaker engine
 * needs (MediaRecorder only gives compressed audio). The microphone opens on `start()` only.
 */
export function useVoiceCapture() {
  const [capturing, setCapturing] = useState(false);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const session = useRef<Session | null>(null);

  const release = useCallback(() => {
    const s = session.current;
    session.current = null;
    if (!s) return;
    s.node.port.onmessage = null;
    s.node.disconnect();
    s.media.getTracks().forEach((t) => t.stop());
    void s.context.close();
  }, []);

  useEffect(() => release, [release]);

  const start = useCallback(async () => {
    release();
    const media = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    const context = new AudioContext();
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
    try {
      await context.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    const node = new AudioWorkletNode(context, "voice-tap");
    const chunks: Float32Array[] = [];
    let total = 0;
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      chunks.push(event.data);
      total += event.data.length;
      let peak = 0;
      for (const v of event.data) peak = Math.max(peak, Math.abs(v));
      setLevel(peak);
      setSeconds(total / context.sampleRate);
    };
    context.createMediaStreamSource(media).connect(node);
    session.current = { media, context, node, chunks };
    setSeconds(0);
    setCapturing(true);
  }, [release]);

  /** Stops the microphone and returns everything heard since `start()`, at 16 kHz. */
  const stop = useCallback(async (): Promise<Int16Array> => {
    const s = session.current;
    setCapturing(false);
    setLevel(0);
    if (!s) return new Int16Array(0);
    const rate = s.context.sampleRate;
    const joined = new Float32Array(s.chunks.reduce((n, c) => n + c.length, 0));
    let offset = 0;
    for (const c of s.chunks) {
      joined.set(c, offset);
      offset += c.length;
    }
    release();
    return resample(joined, rate);
  }, [release]);

  return { capturing, level, seconds, start, stop, concat: concatPcm };
}
