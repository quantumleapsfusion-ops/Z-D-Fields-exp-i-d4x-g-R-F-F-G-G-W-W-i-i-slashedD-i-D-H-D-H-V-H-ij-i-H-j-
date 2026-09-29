"use client";

/**
 * Free, key-less speech-to-text that runs entirely in the visitor's browser: the open-source
 * Whisper model through transformers.js (ONNX Runtime on WebAssembly). The library and model
 * download once from public CDNs and are cached by the browser; no audio leaves the device.
 */
const TRANSFORMERS_URL =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/dist/transformers.web.min.js";
const MODEL = "Xenova/whisper-tiny";
const SAMPLE_RATE = 16000;

type Transcriber = (
  audio: Float32Array,
  options: { chunk_length_s: number; stride_length_s: number },
) => Promise<{ text: string } | { text: string }[]>;

type TransformersModule = {
  env: { backends: { onnx: { wasm?: { proxy?: boolean } } } };
  pipeline: (
    task: "automatic-speech-recognition",
    model: string,
    options: { dtype: string; device: string },
  ) => Promise<Transcriber>;
};

let transcriber: Promise<Transcriber> | null = null;

function loadTranscriber(): Promise<Transcriber> {
  transcriber ??= (
    import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ TRANSFORMERS_URL
    ) as Promise<TransformersModule>
  )
    .then((lib) => {
      const wasm = lib.env.backends.onnx.wasm;
      if (wasm) wasm.proxy = true;
      return lib.pipeline("automatic-speech-recognition", MODEL, {
        dtype: "q8",
        device: "wasm",
      });
    })
    .catch((err: unknown) => {
      transcriber = null;
      throw err;
    });
  return transcriber;
}

async function toMono16k(blob: Blob): Promise<Float32Array> {
  const context = new AudioContext({ sampleRate: SAMPLE_RATE });
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    return decoded.getChannelData(0);
  } finally {
    void context.close();
  }
}

export async function transcribeOnDevice(blobs: Blob[]): Promise<string> {
  if (!blobs.length) return "";
  const run = await loadTranscriber();
  const texts: string[] = [];
  for (const blob of blobs) {
    const result = await run(await toMono16k(blob), {
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    const text = (
      Array.isArray(result) ? result.map((r) => r.text).join(" ") : result.text
    )
      .replace(/\[[^\]]*\]|\([^)]*\)/g, "")
      .trim();
    if (text) texts.push(text);
  }
  return texts.join(" ");
}
