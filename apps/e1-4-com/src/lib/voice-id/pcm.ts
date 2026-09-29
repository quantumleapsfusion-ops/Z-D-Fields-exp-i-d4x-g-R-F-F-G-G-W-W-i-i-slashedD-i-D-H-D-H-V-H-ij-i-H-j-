/** Speaker recognition and the challenge transcript both run on 16 kHz mono 16-bit PCM. */
export const VOICE_SAMPLE_RATE = 16_000;

/** Little-endian 16-bit PCM bytes (as posted by the browser) to samples. */
export function int16FromBytes(bytes: ArrayBuffer | Uint8Array): Int16Array {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (view.byteLength % 2 !== 0) throw new Error("PCM byte length must be even");
  const data = new DataView(view.buffer, view.byteOffset, view.byteLength);
  const out = new Int16Array(view.byteLength / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = data.getInt16(i * 2, true);
  return out;
}

/** Samples to little-endian bytes, the wire format for the voice ID routes. */
export function int16ToBytes(pcm: Int16Array): Uint8Array {
  const out = new Uint8Array(pcm.length * 2);
  const data = new DataView(out.buffer);
  pcm.forEach((sample, i) => data.setInt16(i * 2, sample, true));
  return out;
}

export function floatToInt16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
  }
  return out;
}

export function concatPcm(parts: Int16Array[]): Int16Array {
  const out = new Int16Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Consecutive full frames of `size` samples; a trailing partial frame is dropped. */
export function frames(pcm: Int16Array, size: number): Int16Array[] {
  const out: Int16Array[] = [];
  for (let start = 0; start + size <= pcm.length; start += size) {
    out.push(pcm.subarray(start, start + size));
  }
  return out;
}

/** Wraps PCM in a RIFF/WAVE header so batch speech-to-text providers accept it. */
export function wavFromPcm(pcm: Int16Array, sampleRate = VOICE_SAMPLE_RATE): Uint8Array {
  const dataBytes = pcm.length * 2;
  const out = new Uint8Array(44 + dataBytes);
  const view = new DataView(out.buffer);
  const ascii = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  ascii(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, dataBytes, true);
  out.set(int16ToBytes(pcm), 44);
  return out;
}
