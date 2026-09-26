import { describe, expect, it } from "vitest";

import { formatDuration } from "./format";

describe("formatDuration", () => {
  it("formats sub-hour durations as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(999)).toBe("0:00");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(59 * 60_000 + 59_000)).toBe("59:59");
  });

  it("formats hour-plus durations as h:mm:ss", () => {
    expect(formatDuration(3_600_000)).toBe("1:00:00");
    expect(formatDuration(3_600_000 + 5 * 60_000 + 7_000)).toBe("1:05:07");
  });

  it("clamps negative input to zero", () => {
    expect(formatDuration(-5000)).toBe("0:00");
  });
});
