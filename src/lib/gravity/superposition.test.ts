import { describe, expect, it } from "vitest";

import {
  EVENT_HORIZON,
  FORMS,
  density,
  resolve,
  stubSuperpose,
  superpositionSchema,
  words,
} from "./superposition";

describe("words", () => {
  it("lowercases, tokenises and drops stop words", () => {
    expect(words("The Cat and the Hat")).toEqual(["cat", "hat"]);
  });
});

describe("density", () => {
  it("is 0 for empty input and bounded in [0, 1]", () => {
    expect(density("")).toBe(0);
    const dense = density(
      "Consciousness, therefore, is an emergent phenomenon; whereas computation, although " +
        "deterministic, produces unpredictable, irreducible, self-referential structures which " +
        "nevertheless remain physically instantiated in biological substrates.",
    );
    expect(dense).toBeGreaterThan(0);
    expect(dense).toBeLessThanOrEqual(1);
  });

  it("ranks a dense idea above a trivial one", () => {
    const trivial = density("hi");
    const dense = density(
      "Gravity is a curvature of spacetime, because mass tells space how to bend, " +
        "and space tells mass how to move; therefore the apple and the moon fall alike.",
    );
    expect(dense).toBeGreaterThan(trivial);
    expect(trivial).toBeLessThan(EVENT_HORIZON);
  });
});

describe("resolve", () => {
  it("prefers the candidate that overlaps what was said, weighted by confidence", () => {
    const text = "the river loops back on itself like a cycle";
    const idx = resolve(text, [
      {
        title: "growth",
        interpretation: "unfolds outward",
        form: "spiral",
        confidence: 0.5,
      },
      {
        title: "river as a cycle",
        interpretation: "the river loops back on itself",
        form: "torus",
        confidence: 0.5,
      },
    ]);
    expect(idx).toBe(1);
  });
});

describe("stubSuperpose", () => {
  it("is deterministic given a seeded RNG and yields 4 schema-valid candidates", () => {
    let n = 0;
    const rng = () => ((n += 7) % 10) / 10;
    const a = stubSuperpose("rivers carve canyons over millennia", rng);
    n = 0;
    const b = stubSuperpose("rivers carve canyons over millennia", rng);
    expect(a).toEqual(b);
    expect(a.source).toBe("stub");
    expect(a.candidates).toHaveLength(4);
    expect(superpositionSchema.parse({ candidates: a.candidates })).toBeTruthy();
    for (const c of a.candidates) expect(FORMS).toContain(c.form);
    expect(a.resolvedIndex).toBeGreaterThanOrEqual(0);
    expect(a.resolvedIndex).toBeLessThan(4);
  });
});

describe("superpositionSchema", () => {
  it("coerces unknown forms and out-of-range confidence instead of rejecting", () => {
    const parsed = superpositionSchema.parse({
      candidates: [{ title: "t", interpretation: "i", form: "cube", confidence: 7 }],
    });
    expect(parsed.candidates[0]).toMatchObject({ form: "sphere", confidence: 0.5 });
  });
});
