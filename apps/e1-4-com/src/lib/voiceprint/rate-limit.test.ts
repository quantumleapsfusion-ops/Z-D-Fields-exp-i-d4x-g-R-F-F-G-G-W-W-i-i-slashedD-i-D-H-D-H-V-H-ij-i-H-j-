import { describe, expect, it } from "vitest";

import { isVoiceIdRateLimited } from "./rate-limit";

describe("isVoiceIdRateLimited", () => {
  it("allows up to ten attempts per minute and two failures per fifteen minutes", () => {
    expect(isVoiceIdRateLimited(10, 2)).toBe(false);
    expect(isVoiceIdRateLimited(0, 0)).toBe(false);
  });

  it("limits the eleventh attempt in a minute", () => {
    expect(isVoiceIdRateLimited(11, 0)).toBe(true);
  });

  it("locks out after three failures in fifteen minutes", () => {
    expect(isVoiceIdRateLimited(0, 3)).toBe(true);
  });
});
