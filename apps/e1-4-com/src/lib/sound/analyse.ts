/**
 * Pure signal analysis of a recording: waveform, log-frequency spectrogram, loudness and pitch.
 * Everything is computed from the samples themselves with a hand-written FFT.
 */

export const WAVE_POINTS = 480;
export const FRAMES = 160;
export const BANDS = 48;

const FFT_SIZE = 2048;
const MIN_HZ = 60;
const MAX_HZ = 8000;
const PITCH_MIN_HZ = 70;
const PITCH_MAX_HZ = 500;
const DB_RANGE = 70;
const SILENCE_RMS = 0.01;

export type SoundPrint = {
  durationMs: number;
  /** Peak amplitude per slice of time, 0..1, scaled to the loudest slice. */
  waveform: number[];
  /** `FRAMES` rows of `BANDS` values, 0..1; row = moment in time, column = low to high pitch. */
  spectrogram: number[][];
  /** RMS per frame, 0..1, scaled to the loudest frame. */
  loudness: number[];
  /** Fundamental frequency per frame in Hz, or null where there is no clear pitch. */
  pitch: (number | null)[];
  meanPitchHz: number | null;
  /** Spectral centroid: where the energy sits on average, in Hz. */
  centroidHz: number;
  /** Share of frames that carry sound above the silence floor. */
  voicedRatio: number;
  peakDb: number;
};

/** In-place iterative radix-2 FFT. `re` and `im` must share a power-of-two length. */
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wr = Math.cos(angle);
    const wi = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const next = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = next;
      }
    }
  }
}

function bandEdges(sampleRate: number): number[] {
  const top = Math.min(MAX_HZ, sampleRate / 2);
  const bin = sampleRate / FFT_SIZE;
  return Array.from({ length: BANDS + 1 }, (_, b) =>
    Math.max(1, Math.round((MIN_HZ * (top / MIN_HZ) ** (b / BANDS)) / bin)),
  );
}

/** Autocorrelation pitch estimate, or null when the frame is not periodic enough. */
export function detectPitch(frame: Float32Array, sampleRate: number): number | null {
  const minLag = Math.floor(sampleRate / PITCH_MAX_HZ);
  const maxLag = Math.min(frame.length - 1, Math.ceil(sampleRate / PITCH_MIN_HZ));
  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) energy += frame[i] * frame[i];
  if (energy === 0) return null;
  const corr = new Float64Array(maxLag + 2);
  for (let lag = minLag - 1; lag <= maxLag + 1 && lag < frame.length; lag += 1) {
    let sum = 0;
    for (let i = 0; i + lag < frame.length; i += 1) sum += frame[i] * frame[i + lag];
    corr[lag] = sum / energy;
  }
  let best = -1;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    if (corr[lag] > corr[lag - 1] && corr[lag] >= corr[lag + 1] && corr[lag] > 0.5) {
      if (best < 0 || corr[lag] > corr[best] * 1.1) best = lag;
    }
  }
  if (best < 0) return null;
  const a = corr[best - 1];
  const b = corr[best];
  const c = corr[best + 1];
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
  return sampleRate / (best + shift);
}

export function analyseSound(samples: Float32Array, sampleRate: number): SoundPrint {
  const durationMs = (samples.length / sampleRate) * 1000;

  const waveform: number[] = [];
  const slice = samples.length / WAVE_POINTS;
  for (let p = 0; p < WAVE_POINTS; p += 1) {
    let peak = 0;
    for (let i = Math.floor(p * slice); i < Math.floor((p + 1) * slice); i += 1) {
      peak = Math.max(peak, Math.abs(samples[i]));
    }
    waveform.push(peak);
  }
  const wavePeak = Math.max(...waveform, 1e-9);

  const hann = Float64Array.from(
    { length: FFT_SIZE },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)),
  );
  const edges = bandEdges(sampleRate);
  const hop = Math.max(0, samples.length - FFT_SIZE) / (FRAMES - 1);
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);
  const frame = new Float32Array(FFT_SIZE);

  const rawDb: number[][] = [];
  const rms: number[] = [];
  const pitch: (number | null)[] = [];
  let weighted = 0;
  let total = 0;

  for (let f = 0; f < FRAMES; f += 1) {
    const start = Math.floor(f * hop);
    frame.fill(0);
    frame.set(samples.subarray(start, start + FFT_SIZE));
    let square = 0;
    for (let i = 0; i < FFT_SIZE; i += 1) {
      square += frame[i] * frame[i];
      re[i] = frame[i] * hann[i];
      im[i] = 0;
    }
    const level = Math.sqrt(square / FFT_SIZE);
    rms.push(level);
    pitch.push(level > SILENCE_RMS ? detectPitch(frame, sampleRate) : null);

    fft(re, im);
    const row: number[] = [];
    for (let b = 0; b < BANDS; b += 1) {
      let power = 0;
      const hi = Math.max(edges[b + 1], edges[b] + 1);
      for (let k = edges[b]; k < hi; k += 1) {
        const mag = re[k] * re[k] + im[k] * im[k];
        power += mag;
        weighted += mag * ((k * sampleRate) / FFT_SIZE);
        total += mag;
      }
      row.push(10 * Math.log10(power / (hi - edges[b]) + 1e-12));
    }
    rawDb.push(row);
  }

  const peakDb = Math.max(...rawDb.flat());
  const spectrogram = rawDb.map((row) =>
    row.map((db) => Math.min(1, Math.max(0, (db - (peakDb - DB_RANGE)) / DB_RANGE))),
  );
  const loudest = Math.max(...rms, 1e-9);
  const voiced = pitch.filter((p): p is number => p !== null);

  return {
    durationMs,
    waveform: waveform.map((v) => v / wavePeak),
    spectrogram,
    loudness: rms.map((v) => v / loudest),
    pitch,
    meanPitchHz: voiced.length ? voiced.reduce((s, p) => s + p, 0) / voiced.length : null,
    centroidHz: total > 0 ? weighted / total : 0,
    voicedRatio: rms.filter((v) => v > SILENCE_RMS).length / FRAMES,
    peakDb,
  };
}

/** Join decoded channels into one mono signal. */
export function mixDown(channels: Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0];
  const out = new Float32Array(channels[0]?.length ?? 0);
  for (const channel of channels) {
    for (let i = 0; i < out.length; i += 1) out[i] += channel[i] / channels.length;
  }
  return out;
}

export function concat(parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
