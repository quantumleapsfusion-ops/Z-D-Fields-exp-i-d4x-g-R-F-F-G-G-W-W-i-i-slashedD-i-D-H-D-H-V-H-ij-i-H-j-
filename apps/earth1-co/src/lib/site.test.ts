import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

import { CICERO, LOREM_PHRASE } from "./cicero";
import { research } from "./research";
import { people } from "./library/people";
import { site } from "./site";

describe("site", () => {
  it("has unique pillar slugs that are valid URL segments", () => {
    const slugs = site.pillars.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it("keeps the canonical url free of a trailing slash", () => {
    expect(site.url).toBe(`https://${site.domain}`);
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("has no duplicate urls and only absolute ones on our domain", () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u.startsWith(`${site.url}`)).toBe(true);
  });

  it("puts the home page first at top priority", () => {
    expect(entries[0]).toMatchObject({ url: site.url, priority: 1 });
  });

  it("includes every pillar and every person profile", () => {
    for (const p of site.pillars) expect(urls).toContain(`${site.url}/${p.slug}`);
    for (const p of people) expect(urls).toContain(`${site.url}/people/${p.slug}`);
    for (const route of [
      "/knowledge-test",
      "/symbols",
      "/periodic-table",
      "/planets",
      "/black-hole",
    ]) {
      expect(urls).toContain(`${site.url}${route}`);
    }
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${site.url}/sitemap.xml`,
    });
  });
});

describe("research", () => {
  it("uses https references and matches the section slugs", () => {
    for (const r of research) {
      expect(r.reference.url.startsWith("https://")).toBe(true);
      expect(r.focus.length).toBeGreaterThan(0);
    }
    expect(research.map((r) => r.id)).toEqual(["quantum-mechanics", "quantum-computing"]);
  });
});

describe("cicero", () => {
  it("quotes the lorem ipsum phrase from the §32 Latin", () => {
    expect(CICERO.map((c) => c.number)).toEqual(["§32", "§33"]);
    expect(CICERO[0].latin).toContain(LOREM_PHRASE);
    for (const c of CICERO) expect(c.english.length).toBeGreaterThan(0);
  });
});
