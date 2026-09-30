import { env } from "@/lib/env";
import type {
  Completion,
  CompletionRequest,
  LanguageModel,
  ModelTier,
} from "@/lib/llm/types";
import type { Transcriber, TranscriptionResult } from "@/lib/stt/types";

/** Da Vinci gateway is configured but unreachable / failing. Routes map this to 503. */
export class DaVinciUnavailableError extends Error {
  constructor(
    readonly status: number,
    detail: string,
  ) {
    super(`Da Vinci unavailable (${status}): ${detail}`);
    this.name = "DaVinciUnavailableError";
  }
}

type CompleteResponse = {
  text: string;
  json: unknown;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
};

type TranscribeResponse = {
  text: string;
  language: string | null;
  duration_s: number | null;
  segments: { start: number; end: number; text: string }[];
  model: string;
};

type EmbedResponse = {
  vectors: number[][];
  model: string;
  dimensions: number;
  usage: { input_tokens: number; output_tokens: number };
};

export type StructuredRequest = CompletionRequest & {
  /** JSON Schema the gateway enforces with grammar-constrained decoding. */
  schema: Record<string, unknown>;
  seed?: number;
};

export type StructuredCompletion<T> = Completion & { json: T };

/**
 * The one client every feature uses to reach Da Vinci. Created lazily by `getDaVinci()` so
 * importing this module never reads env or opens a connection at build time.
 */
export class DaVinciClient {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
  ) {}

  private async call<T>(path: string, init: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${this.secret}`, ...(init.headers ?? {}) },
      });
    } catch (error) {
      throw new DaVinciUnavailableError(0, (error as Error).message);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 401) throw new DaVinciUnavailableError(401, "secret rejected");
      throw new DaVinciUnavailableError(res.status, body.slice(0, 300));
    }
    return (await res.json()) as T;
  }

  private json(path: string, body: unknown, init: RequestInit = {}) {
    return this.call<never>(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      ...init,
    });
  }

  async ready(): Promise<{ llm: boolean; stt: boolean; embed: boolean }> {
    return this.call("/readyz", { method: "GET" });
  }

  async complete(tier: ModelTier, request: CompletionRequest): Promise<Completion> {
    const res = (await this.json("/v1/complete", {
      system: request.system,
      prompt: request.prompt,
      tier,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1500,
    })) as CompleteResponse;
    return {
      text: res.text,
      usage: {
        inputTokens: res.usage.input_tokens,
        outputTokens: res.usage.output_tokens,
      },
    };
  }

  /** Structured output: the gateway constrains decoding to `schema`; `json` is already parsed. */
  async completeStructured<T>(
    tier: ModelTier,
    request: StructuredRequest,
  ): Promise<StructuredCompletion<T>> {
    const res = (await this.json("/v1/complete", {
      system: request.system,
      prompt: request.prompt,
      tier,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 1500,
      seed: request.seed,
      json_schema: request.schema,
    })) as CompleteResponse;
    return {
      text: res.text,
      json: res.json as T,
      usage: {
        inputTokens: res.usage.input_tokens,
        outputTokens: res.usage.output_tokens,
      },
    };
  }

  async transcribe(
    audio: Uint8Array,
    mimeType: string,
    language?: string,
  ): Promise<TranscribeResponse> {
    const ext = mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("ogg")
        ? "ogg"
        : "webm";
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(audio)], { type: mimeType }),
      `segment.${ext}`,
    );
    if (language) form.append("language", language);
    return this.call<TranscribeResponse>("/v1/transcribe", {
      method: "POST",
      body: form,
    });
  }

  async embed(texts: string[]): Promise<EmbedResponse> {
    return this.json("/v1/embed", { texts }) as Promise<EmbedResponse>;
  }
}

/** `LanguageModel` adapter so `completeForUser` / budget accounting work unchanged. */
export class DaVinciModel implements LanguageModel {
  readonly name: string;
  readonly model: string;

  constructor(
    private readonly client: DaVinciClient,
    private readonly tier: ModelTier,
  ) {
    this.model = tier === "heavy" ? "davinci-heavy" : "davinci";
    this.name = `davinci:${this.tier}`;
  }

  complete(request: CompletionRequest) {
    return this.client.complete(this.tier, request);
  }
}

/** `Transcriber` adapter for the Voice Stream batch path. */
export class DaVinciTranscriber implements Transcriber {
  readonly name = "davinci";

  constructor(private readonly client: DaVinciClient) {}

  async transcribe(audio: Uint8Array, mimeType: string): Promise<TranscriptionResult> {
    const res = await this.client.transcribe(audio, mimeType);
    return { text: res.text.trim() };
  }
}

/** True when both `DAVINCI_URL` and `DAVINCI_SECRET` are set. */
export function isDaVinciConfigured(): boolean {
  return Boolean(env.davinci.url && env.davinci.secret);
}

/**
 * Lazy accessor. Returns `null` when Da Vinci is not configured so callers can fall back
 * (today: third-party providers or stubs; after M5: a 503).
 */
export function getDaVinci(): DaVinciClient | null {
  const { url, secret } = env.davinci;
  if (!url || !secret) return null;
  return new DaVinciClient(url.replace(/\/+$/, ""), secret);
}
