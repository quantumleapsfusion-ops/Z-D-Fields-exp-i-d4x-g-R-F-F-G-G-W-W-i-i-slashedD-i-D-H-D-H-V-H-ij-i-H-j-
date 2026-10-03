import { describe, expect, it } from "vitest";

import { shouldSpeakIntro } from "./intro";

describe("shouldSpeakIntro", () => {
  it("speaks once, on a gesture away from the microphone", () => {
    expect(shouldSpeakIntro({ heard: false, onMic: false, speaking: false })).toBe(true);
  });

  it("stays quiet when the device has heard it", () => {
    expect(shouldSpeakIntro({ heard: true, onMic: false, speaking: false })).toBe(false);
  });

  it("never talks over the microphone or over itself", () => {
    expect(shouldSpeakIntro({ heard: false, onMic: true, speaking: false })).toBe(false);
    expect(shouldSpeakIntro({ heard: false, onMic: false, speaking: true })).toBe(false);
  });
});
