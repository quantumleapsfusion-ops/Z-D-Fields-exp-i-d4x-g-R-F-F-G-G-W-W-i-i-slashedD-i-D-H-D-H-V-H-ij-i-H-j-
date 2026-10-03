import { describe, expect, it } from "vitest";

import { equations } from "./equations";
import { people, peopleIn, personBySlug } from "./people";
import { physics, quantumComputing, quantumMechanics, sectionList } from "./sections";

const equationIds = new Set(equations.map((e) => e.id));
const sections = [quantumMechanics, quantumComputing, physics];

describe("people", () => {
  it("has unique slugs and a lookup that covers everyone", () => {
    const slugs = people.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(personBySlug.size).toBe(people.length);
  });

  it("fills in the fields every profile page renders", () => {
    for (const p of people) {
      expect(p.slug, p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      for (const field of [p.name, p.lived, p.country, p.known, p.who]) {
        expect(field.trim(), p.slug).not.toBe("");
      }
      expect(p.sections.length, p.slug).toBeGreaterThan(0);
      expect(p.work.length, p.slug).toBeGreaterThan(0);
      expect(p.mattered.length, p.slug).toBeGreaterThan(0);
    }
  });

  it("only links to people and equations that exist", () => {
    for (const p of people) {
      for (const slug of p.related ?? []) {
        expect(personBySlug.has(slug), `${p.slug} → related ${slug}`).toBe(true);
        expect(slug, `${p.slug} relates to itself`).not.toBe(p.slug);
      }
      for (const id of p.equations ?? []) {
        expect(equationIds.has(id), `${p.slug} → equation ${id}`).toBe(true);
      }
    }
  });

  it("never lists a quotation without its source", () => {
    for (const p of people) {
      for (const q of p.quotes ?? []) {
        expect(q.text.trim(), p.slug).not.toBe("");
        expect(q.source.trim(), `${p.slug} quote needs a source`).not.toBe("");
      }
    }
  });

  it("filters by section", () => {
    for (const section of ["quantum-mechanics", "quantum-computing"] as const) {
      const list = peopleIn(section);
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((p) => p.sections.includes(section))).toBe(true);
    }
  });
});

describe("equations", () => {
  it("has unique ids", () => {
    expect(equationIds.size).toBe(equations.length);
  });

  it("points back at real people", () => {
    for (const e of equations) {
      expect(e.formula.trim(), e.id).not.toBe("");
      expect(e.explain.trim(), e.id).not.toBe("");
      for (const slug of e.people) {
        expect(personBySlug.has(slug), `${e.id} → person ${slug}`).toBe(true);
      }
    }
  });
});

describe("sections", () => {
  it("lists every section once, with its own title and line", () => {
    expect(sectionList.map((s) => s.slug)).toEqual(sections.map((s) => s.slug));
    for (const s of sections) {
      const entry = sectionList.find((x) => x.slug === s.slug);
      expect(entry?.title).toBe(s.title);
      expect(entry?.line).toBe(s.line);
    }
  });

  it("references only real equations and people", () => {
    for (const s of sections) {
      const ids = s.concepts.map((c) => c.id);
      expect(new Set(ids).size, `${s.slug} concept ids`).toBe(ids.length);
      for (const c of s.concepts) {
        if (c.equation)
          expect(equationIds.has(c.equation), `${s.slug}/${c.id}`).toBe(true);
      }
      for (const t of s.timeline) {
        if (t.person)
          expect(personBySlug.has(t.person), `${s.slug} ${t.year}`).toBe(true);
      }
    }
    for (const i of quantumMechanics.interpretations) {
      for (const slug of i.people ?? []) {
        expect(personBySlug.has(slug), `${i.name} → ${slug}`).toBe(true);
      }
    }
  });

  it("keeps timelines in chronological order", () => {
    for (const s of sections) {
      const years = s.timeline.map((t) => Number.parseInt(t.year, 10));
      expect(years.every(Number.isFinite), s.slug).toBe(true);
      expect(
        [...years].sort((a, b) => a - b),
        s.slug,
      ).toEqual(years);
    }
  });
});
