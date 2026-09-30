import { describe, expect, it } from "vitest";

import { tiltFrom } from "@/lib/device/tilt";

const neutral = { beta: 40, gamma: 0 };

describe("tiltFrom", () => {
  it("is level where the phone was first held", () => {
    expect(tiltFrom(neutral, neutral)).toEqual({ x: 0, y: 0 });
  });

  it("leans right when the right edge dips", () => {
    expect(tiltFrom({ beta: 40, gamma: 17.5 }, neutral).x).toBeCloseTo(0.5);
  });

  it("leans up when the top edge dips toward the floor", () => {
    expect(tiltFrom({ beta: 5, gamma: 0 }, neutral).y).toBeCloseTo(1);
  });

  it("caps a steep lean at a full tilt", () => {
    expect(tiltFrom({ beta: 40, gamma: -90 }, neutral).x).toBe(-1);
  });

  it("keeps screen axes when the phone is turned to landscape", () => {
    const turned = tiltFrom({ beta: 40, gamma: 17.5 }, neutral, 90);
    expect(turned.y).toBeCloseTo(0.5);
    expect(turned.x).toBeCloseTo(0);
  });
});
