import type { MetadataRoute } from "next";

import { people } from "@/lib/library/people";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/quantum-mechanics",
    "/quantum-computing",
    ...site.pillars.map((p) => `/${p.slug}`),
    "/equations",
    "/knowledge-test",
    "/symbols",
    "/periodic-table",
    "/planets",
    "/black-hole",
    "/founder",
  ];
  const entries = paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path ? 0.8 : 1,
  }));
  const profiles = people.map((p) => ({
    url: `${site.url}/people/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...entries, ...profiles];
}
