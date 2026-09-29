"use client";

import {
  bandEdges,
  buildEmbedding,
  frameFeatures,
  MIN_VOICED_FRAMES,
  type Frame,
} from "./voiceprint";

export type VoiceCapture = {
  /** Voiced frames seen so far (drives the enrolment progress meter). */
  voicedFrames: () => number;
  /** Instantaneous level 0..1 for a simple meter. */
  level: () => number;
  /** Stop analysing and build the print. Throws if too little speech was heard. */
  finish: () => number[];
  /** Stop and discard. */
  cancel: () => void;
};

/**
 * Taps a microphone stream with an AnalyserNode and folds each voiced spectrum
 * frame into a voice print. Runs alongside speech recognition, which handles
 * the *what was said*; this handles the *who said it*.
 */
export function startVoiceCapture(stream: MediaStream): VoiceCapture {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0;
  source.connect(analyser);

  const edges = bandEdges();
  const spectrum = new Float32Array(analyser.frequencyBinCount);
  const frames: Frame[] = [];
  let level = 0;
  let stopped = false;

  const timer = setInterval(() => {
    if (stopped) return;
    analyser.getFloatFrequencyData(spectrum);
    const f = frameFeatures(spectrum, ctx.sampleRate, edges);
    let sum = 0;
    for (let i = 0; i < spectrum.length; i++) sum += spectrum[i];
    level = Math.min(1, Math.max(0, (sum / spectrum.length + 90) / 60));
    if (f) frames.push(f);
  }, 40);

  const teardown = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    source.disconnect();
    void ctx.close();
  };

  return {
    voicedFrames: () => frames.length,
    level: () => level,
    finish: () => {
      teardown();
      if (frames.length < MIN_VOICED_FRAMES) {
        throw new Error("Didn't hear enough of your voice — try again, a little louder.");
      }
      return buildEmbedding(frames);
    },
    cancel: teardown,
  };
}
