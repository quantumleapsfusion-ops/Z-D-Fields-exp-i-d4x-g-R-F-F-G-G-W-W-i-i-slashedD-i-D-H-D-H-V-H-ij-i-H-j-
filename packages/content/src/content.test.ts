import { describe, expect, it } from "vitest";

import { citableQuotes, lifespan, sections } from "./index";
import type { Quote } from "./types";

const allFigures = sections.flatMap((s) => [...s.figures, ...(s.sub?.figures ?? [])]);

describe("citableQuotes", () => {
  it("drops unverified quotes and verified quotes with no source", () => {
    const quotes: Quote[] = [
      { text: "kept", source: "A book, 1900", verified: true },
      { text: "unverified", source: "A book, 1900", verified: false },
      { text: "no source", source: "  ", verified: true },
    ];
    expect(citableQuotes(quotes).map((q) => q.text)).toEqual(["kept"]);
  });

  it("never passes an unverified quote from the real content", () => {
    for (const f of allFigures) {
      for (const q of citableQuotes(f.quotes)) {
        expect(q.verified, `${f.name}: ${q.text}`).toBe(true);
        expect(q.source.trim(), `${f.name}: ${q.text}`).not.toBe("");
      }
    }
  });

  it("keeps the known misattributions in the data but hidden", () => {
    const hidden = allFigures.flatMap((f) => f.quotes.filter((q) => !q.verified));
    expect(hidden.length).toBeGreaterThan(0);
    for (const q of hidden) expect(citableQuotes([q])).toEqual([]);
  });
});

describe("content shape", () => {
  it("has unique slugs across every section", () => {
    const slugs = allFigures.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every figure a field and at least one contribution", () => {
    for (const f of allFigures) {
      expect(f.field.length, f.name).toBeGreaterThan(0);
      expect(f.contributions.length, f.name).toBeGreaterThan(0);
    }
  });
});

describe("global citizenship", () => {
  it("covers the brief's philosophers and the science-fiction sub-section", () => {
    const gc = sections.find((s) => s.slug === "global-citizenship");
    const names = gc?.figures.map((f) => f.name.split(" ").at(-1)) ?? [];
    for (const n of ["Kant", "Hume", "Rousseau", "Locke", "Hippo", "Hegel", "Foucault"]) {
      expect(names).toContain(n);
    }
    expect(gc?.sub?.figures.map((f) => f.name)).toEqual([
      "Isaac Asimov",
      "Douglas Adams",
    ]);
  });
});

describe("lifespan", () => {
  it("formats dates for the dead and the living", () => {
    expect(lifespan({ born: "1643", died: "1727" })).toBe("1643 – 1727");
    expect(lifespan({ born: "1936", died: "" })).toBe("born 1936");
  });
});

describe("subject topics", () => {
  it("fills mathematics, physics and biochemistry with topics", () => {
    const ids = (slug: string) =>
      sections.find((s) => s.slug === slug)?.topics?.map((t) => t.id) ?? [];
    expect(ids("mathematics")).toEqual(
      expect.arrayContaining([
        "euclid",
        "calculus",
        "leibniz",
        "differential-equations",
        "linear-algebra",
        "parametric-curves",
      ]),
    );
    expect(ids("physics")).toEqual(
      expect.arrayContaining([
        "classical-mechanics",
        "lagrangian",
        "relativity",
        "lorentz",
        "quantum",
        "thermodynamics",
      ]),
    );
    expect(ids("biochemistry")).toEqual(
      expect.arrayContaining([
        "molecules-of-life",
        "enzymes",
        "metabolism",
        "central-dogma",
        "atp",
      ]),
    );
  });

  it("gives every topic prose and unique ids within its page", () => {
    for (const s of sections) {
      const topics = s.topics ?? [];
      expect(new Set(topics.map((t) => t.id)).size, s.slug).toBe(topics.length);
      for (const t of topics) {
        expect(t.paragraphs.length, t.id).toBeGreaterThan(0);
        for (const e of t.equations ?? []) expect(e.label.trim(), t.id).not.toBe("");
      }
    }
  });
});
