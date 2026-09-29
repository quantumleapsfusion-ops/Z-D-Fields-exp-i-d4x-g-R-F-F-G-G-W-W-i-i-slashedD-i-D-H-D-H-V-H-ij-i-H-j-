import type { MetadataRoute } from "next";

// Crawlers stay blocked until launch.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
