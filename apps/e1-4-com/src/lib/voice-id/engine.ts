import "server-only";

import { Eagle, EagleProfiler } from "@picovoice/eagle-node";

import { env } from "@/lib/env";

import { aggregateScores } from "./match";
import { VOICE_SAMPLE_RATE, frames } from "./pcm";

export type Enrollment = { percentage: number; profile: Uint8Array | null };

/** Speaker recognition behind a small interface so the engine can be swapped. */
export interface SpeakerEngine {
  readonly name: string;
  /** Builds a voiceprint from one continuous recording. `profile` is null until 100 %. */
  enroll(pcm: Int16Array): Enrollment;
  /** One similarity score (0–1) per profile. */
  score(pcm: Int16Array, profiles: Uint8Array[]): number[];
}

/** Picovoice Eagle: on-device (server-local) speaker recognition. */
export class EagleEngine implements SpeakerEngine {
  readonly name = "picovoice-eagle";

  constructor(private readonly accessKey: string) {}

  enroll(pcm: Int16Array): Enrollment {
    const profiler = new EagleProfiler(this.accessKey);
    try {
      assertRate(profiler.sampleRate);
      for (const frame of frames(pcm, profiler.frameLength)) profiler.enroll(frame);
      const percentage = profiler.flush();
      return { percentage, profile: percentage >= 100 ? profiler.export() : null };
    } finally {
      profiler.release();
    }
  }

  score(pcm: Int16Array, profiles: Uint8Array[]): number[] {
    if (profiles.length === 0) return [];
    const eagle = new Eagle(this.accessKey);
    try {
      assertRate(eagle.sampleRate);
      const chunks = frames(pcm, eagle.minProcessSamples).map((chunk) =>
        eagle.process(chunk, profiles),
      );
      return aggregateScores(chunks, profiles.length);
    } finally {
      eagle.release();
    }
  }
}

function assertRate(rate: number) {
  if (rate !== VOICE_SAMPLE_RATE) {
    throw new Error(
      `Speaker engine expects ${rate} Hz audio, clients send ${VOICE_SAMPLE_RATE} Hz`,
    );
  }
}

export function getSpeakerEngine(): SpeakerEngine | null {
  const key = env.voiceId.picovoiceKey;
  return key ? new EagleEngine(key) : null;
}
