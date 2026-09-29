import type { NextConfig } from "next";

const WORDED_PAGES = [
  "/chalkboard",
  "/gravity",
  "/horizon",
  "/superposition",
  "/davinci",
  "/profile",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui"],
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
};

export default nextConfig;
