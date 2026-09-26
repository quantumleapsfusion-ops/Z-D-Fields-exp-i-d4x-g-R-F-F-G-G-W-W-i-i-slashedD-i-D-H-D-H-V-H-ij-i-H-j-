import { describe, expect, it } from "vitest";

import {
  describeMicError,
  detectAudioSupport,
  detectPlatform,
  getAudioContextCtor,
  MIME_CANDIDATES,
  pickMimeType,
  resolveBlobType,
} from "@/features/voice-stream/audio-support";

const supports = (...types: string[]) => ({
  isTypeSupported: (t: string) => types.includes(t),
});

describe("pickMimeType", () => {
  it("prefers WebM/Opus on Chrome, Firefox and Android Chrome", () => {
    expect(
      pickMimeType(supports("audio/webm;codecs=opus", "audio/webm", "audio/ogg")),
    ).toBe("audio/webm;codecs=opus");
  });

  it("falls back to MP4 on Safari / iOS Safari, which rejects every WebM type", () => {
    expect(pickMimeType(supports("audio/mp4", "audio/mp4;codecs=mp4a.40.2"))).toBe(
      "audio/mp4;codecs=mp4a.40.2",
    );
    expect(pickMimeType(supports("audio/mp4"))).toBe("audio/mp4");
  });

  it("returns undefined (let the browser choose) when nothing matches or isTypeSupported is missing", () => {
    expect(pickMimeType(supports())).toBeUndefined();
    expect(pickMimeType({})).toBeUndefined();
    expect(pickMimeType(undefined)).toBeUndefined();
  });

  it("survives WebViews whose isTypeSupported throws", () => {
    expect(
      pickMimeType({
        isTypeSupported: (t) => {
          if (t.includes("webm")) throw new TypeError("nope");
          return t === "audio/mp4";
        },
      }),
    ).toBe("audio/mp4");
  });

  it("only ever proposes audio containers the server accepts", () => {
    for (const t of MIME_CANDIDATES) expect(t).toMatch(/^audio\/(webm|mp4|ogg)/);
  });
});

describe("detectAudioSupport", () => {
  const gum = { getUserMedia: () => Promise.resolve() };

  it("is ok when mediaDevices and MediaRecorder exist", () => {
    expect(
      detectAudioSupport({
        isSecureContext: true,
        navigator: { mediaDevices: gum },
        MediaRecorder: class {},
      }),
    ).toEqual({ ok: true });
  });

  it("explains an insecure (http://) origin — mediaDevices is undefined there on mobile", () => {
    const r = detectAudioSupport({
      isSecureContext: false,
      navigator: {},
      MediaRecorder: class {},
    });
    expect(r).toMatchObject({ ok: false, reason: "insecure-context" });
    expect((r as { message: string }).message).toMatch(/https/);
  });

  it("explains in-app browsers with no mediaDevices", () => {
    const r = detectAudioSupport({
      isSecureContext: true,
      navigator: {},
      MediaRecorder: class {},
    });
    expect(r).toMatchObject({ ok: false, reason: "no-media-devices" });
    expect((r as { message: string }).message).toMatch(/Safari/);
  });

  it("explains old iOS Safari with mediaDevices but no MediaRecorder", () => {
    const r = detectAudioSupport({
      isSecureContext: true,
      navigator: { mediaDevices: gum },
    });
    expect(r).toMatchObject({ ok: false, reason: "no-media-recorder" });
    expect((r as { message: string }).message).toMatch(/iOS 14\.3/);
  });

  it("defers the decision during SSR", () => {
    expect(detectAudioSupport(undefined)).toEqual({ ok: true });
  });
});

describe("describeMicError", () => {
  const dom = (name: string, message = "") => new DOMException(message, name);

  it("gives platform-specific instructions for a denied permission", () => {
    expect(describeMicError(dom("NotAllowedError"), "ios")).toMatch(
      /Settings › Safari › Microphone/,
    );
    expect(describeMicError(dom("NotAllowedError"), "android")).toMatch(/lock icon/);
    expect(describeMicError(dom("NotAllowedError"), "other")).toMatch(/blocked/);
    // Older Chrome spelling and Safari's SecurityError map to the same guidance.
    expect(describeMicError({ name: "PermissionDeniedError" }, "android")).toMatch(
      /lock icon/,
    );
    expect(describeMicError(dom("SecurityError"), "ios")).toMatch(/Safari/);
  });

  it("maps hardware / busy / codec failures to actionable text", () => {
    expect(describeMicError(dom("NotFoundError"))).toMatch(/No microphone/);
    expect(describeMicError(dom("NotReadableError"))).toMatch(/busy/);
    expect(describeMicError(dom("TrackStartError"))).toMatch(/busy/);
    expect(describeMicError(dom("NotSupportedError"))).toMatch(/format/);
    expect(describeMicError(dom("OverconstrainedError"))).toMatch(/settings/);
    expect(describeMicError(dom("InvalidStateError"))).toMatch(
      /phone call|switching apps/,
    );
    expect(describeMicError(dom("AbortError"))).toMatch(/interrupted/);
  });

  it("never leaks raw DOMException names to the user and has a safe default", () => {
    for (const name of [
      "NotAllowedError",
      "NotFoundError",
      "NotReadableError",
      "SecurityError",
    ]) {
      expect(describeMicError(dom(name), "ios")).not.toContain(name);
    }
    expect(describeMicError(undefined)).toMatch(/Microphone unavailable/);
    expect(describeMicError(new Error("custom message"))).toBe("custom message");
    expect(describeMicError({ name: 42 })).toMatch(/Microphone unavailable/);
  });
});

describe("detectPlatform", () => {
  it("recognises iPhone/iPad Safari and Android Chrome", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("ios");
    expect(detectPlatform("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe("ios");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36",
      ),
    ).toBe("android");
    expect(detectPlatform("Mozilla/5.0 (X11; Linux x86_64) Chrome/125.0")).toBe("other");
    expect(detectPlatform(undefined)).toBe("other");
  });
});

describe("resolveBlobType", () => {
  it("trusts the recorder's reported type first", () => {
    expect(
      resolveBlobType({
        recorderMimeType: "audio/webm;codecs=opus",
        requestedMimeType: "audio/webm",
        firstChunkType: "audio/webm",
        platform: "android",
      }),
    ).toBe("audio/webm;codecs=opus");
  });

  it("uses the first chunk's type when Safari leaves recorder.mimeType empty", () => {
    expect(
      resolveBlobType({
        recorderMimeType: "",
        requestedMimeType: undefined,
        firstChunkType: "audio/mp4",
        platform: "ios",
      }),
    ).toBe("audio/mp4");
  });

  it("falls back to the requested type, then to a platform default", () => {
    expect(
      resolveBlobType({
        recorderMimeType: "",
        requestedMimeType: "audio/mp4;codecs=mp4a.40.2",
        firstChunkType: "",
        platform: "ios",
      }),
    ).toBe("audio/mp4;codecs=mp4a.40.2");
    expect(
      resolveBlobType({
        recorderMimeType: undefined,
        requestedMimeType: undefined,
        firstChunkType: undefined,
        platform: "ios",
      }),
    ).toBe("audio/mp4");
    expect(
      resolveBlobType({
        recorderMimeType: undefined,
        requestedMimeType: undefined,
        firstChunkType: undefined,
        platform: "android",
      }),
    ).toBe("audio/webm");
  });

  it("ignores non-audio types (e.g. application/octet-stream chunks)", () => {
    expect(
      resolveBlobType({
        recorderMimeType: "application/octet-stream",
        requestedMimeType: undefined,
        firstChunkType: "video/webm",
        platform: "other",
      }),
    ).toBe("audio/webm");
  });
});

describe("getAudioContextCtor", () => {
  it("prefers the standard constructor, then webkitAudioContext, else undefined", () => {
    class Std {}
    class Webkit {}
    expect(getAudioContextCtor({ AudioContext: Std, webkitAudioContext: Webkit })).toBe(
      Std,
    );
    expect(getAudioContextCtor({ webkitAudioContext: Webkit })).toBe(Webkit);
    expect(getAudioContextCtor({})).toBeUndefined();
    expect(getAudioContextCtor(undefined)).toBeUndefined();
  });
});
