import type { NextConfig } from "next";

const WORDED_PAGES = [
  "/chalkboard",
  "/gravity",
  "/horizon",
  "/superposition",
  "/davinci",
  "/profile",
  "/privacy",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui", "@earth-one/spacetime"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return WORDED_PAGES.map((source) => ({ source, destination: "/", permanent: false }));
  },
  // Short personal links: e1-4.com/@handle.
  async rewrites() {
    return [{ source: "/@:handle", destination: "/u/:handle" }];
  },
};

export default nextConfig;
