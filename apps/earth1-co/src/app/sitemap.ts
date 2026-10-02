import type { MetadataRoute } from "next";

import { learn } from "@/lib/learn";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/research",
    "/research/psigda-burgers",
    "/papers",
    "/notebooks",
    "/lab-notes",
    "/learn",
    ...learn.map((s) => `/learn/${s.slug}`),
    "/about",
  ];

  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
