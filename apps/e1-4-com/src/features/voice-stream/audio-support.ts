/**
 * Browser capability detection and error mapping for microphone capture.
 * Pure functions (no React, no globals unless passed in) so they can be unit
 * tested against the quirks of iOS Safari and Android Chrome.
 */

/**
 * Container/codec candidates in preference order. Chrome/Firefox/Android take
 * WebM+Opus; Safari (macOS and iOS 14.3+) only records MP4/AAC and reports
 * `isTypeSupported("audio/webm") === false`.
 */
export const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export type MediaRecorderStatics = {
  isTypeSupported?: (type: string) => boolean;
};

/**
 * First candidate the recorder claims to support, or `undefined` to let the
 * browser pick its default (older Safari lacks `isTypeSupported` entirely).
 */
export function pickMimeType(
  recorder: MediaRecorderStatics | undefined,
): string | undefined {
  const check = recorder?.isTypeSupported;
  if (typeof check !== "function") return undefined;
  for (const candidate of MIME_CANDIDATES) {
    try {
      if (check.call(recorder, candidate)) return candidate;
    } catch {
      // Some WebViews throw for unknown types instead of returning false.
    }
  }
  return undefined;
}

export type AudioSupport =
  | { ok: true }
  | {
      ok: false;
      reason: "insecure-context" | "no-media-devices" | "no-media-recorder";
      message: string;
    };

type WindowLike = {
  isSecureContext?: boolean;
  navigator?: { mediaDevices?: { getUserMedia?: unknown } };
  MediaRecorder?: unknown;
};

/** Cheap pre-flight so we can explain *why* recording is unavailable before asking for the mic. */
export function detectAudioSupport(win: WindowLike | undefined): AudioSupport {
  if (!win) return { ok: true }; // SSR: decide on the client.
  const getUserMedia = win.navigator?.mediaDevices?.getUserMedia;
  if (typeof getUserMedia !== "function") {
    if (win.isSecureContext === false) {
      return {
        ok: false,
        reason: "insecure-context",
        message:
          "Recording needs a secure connection. Open this page over https:// (or on localhost).",
      };
    }
    return {
      ok: false,
      reason: "no-media-devices",
      message:
        "This browser cannot access the microphone. On iPhone, open e1-4 in Safari rather than an in-app browser.",
    };
  }
  if (typeof win.MediaRecorder !== "function") {
    return {
      ok: false,
      reason: "no-media-recorder",
      message:
        "This browser cannot record audio. Update to iOS 14.3+ / Safari 14.1+ or use Chrome.",
    };
  }
  return { ok: true };
}

/** Human-readable, platform-aware message for a `getUserMedia` / `MediaRecorder` failure. */
export function describeMicError(err: unknown, platform: Platform = "other"): string {
  const name = errorName(err);
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return platform === "ios"
        ? "Microphone access was blocked. In iOS Settings › Safari › Microphone choose Allow, or tap the “AA” menu › Website Settings, then reload."
        : platform === "android"
          ? "Microphone access was blocked. Tap the lock icon in the address bar › Permissions › Microphone › Allow, then try again."
          : "Microphone access was blocked. Allow the microphone for this site in your browser settings and try again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found on this device.";
    case "NotReadableError":
    case "TrackStartError":
      return "The microphone is busy or unavailable — close other apps using it and try again.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Your microphone does not support the requested settings.";
    case "NotSupportedError":
      return "This browser cannot record audio in a supported format. Update your browser or try Chrome/Safari.";
    case "AbortError":
      return "Recording was interrupted. Please try again.";
    case "InvalidStateError":
      return "The recorder was interrupted (for example by a phone call or switching apps). Tap Record to continue.";
    default:
      return err instanceof Error && err.message
        ? err.message
        : "Microphone unavailable. Please try again.";
  }
}

function errorName(err: unknown): string {
  if (typeof err === "object" && err !== null && "name" in err) {
    const name = (err as { name: unknown }).name;
    if (typeof name === "string") return name;
  }
  return "";
}

export type Platform = "ios" | "android" | "other";

/** Coarse platform sniff, only used to word permission instructions. */
export function detectPlatform(userAgent: string | undefined): Platform {
  if (!userAgent) return "other";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  // iPadOS 13+ Safari reports a Mac UA; `Macintosh` + touch is handled by the caller.
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

/**
 * The MIME type to stamp on the captured blob. Safari frequently leaves
 * `recorder.mimeType` empty; the first data chunk normally carries the real
 * container type, then the requested type, then a platform-appropriate guess.
 */
export function resolveBlobType(input: {
  recorderMimeType: string | undefined;
  requestedMimeType: string | undefined;
  firstChunkType: string | undefined;
  platform: Platform;
}): string {
  const fromRecorder = clean(input.recorderMimeType);
  if (fromRecorder) return fromRecorder;
  const fromChunk = clean(input.firstChunkType);
  if (fromChunk) return fromChunk;
  const requested = clean(input.requestedMimeType);
  if (requested) return requested;
  return input.platform === "ios" ? "audio/mp4" : "audio/webm";
}

function clean(type: string | undefined): string | undefined {
  const t = type?.trim();
  return t && t.startsWith("audio/") ? t : undefined;
}

type AudioContextCtor = new () => AudioContext;

/** `AudioContext`, falling back to the prefixed constructor still shipped by older Safari. */
export function getAudioContextCtor(
  win: { AudioContext?: unknown; webkitAudioContext?: unknown } | undefined,
): AudioContextCtor | undefined {
  if (!win) return undefined;
  if (typeof win.AudioContext === "function") return win.AudioContext as AudioContextCtor;
  if (typeof win.webkitAudioContext === "function")
    return win.webkitAudioContext as AudioContextCtor;
  return undefined;
}
