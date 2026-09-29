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
  async redirects() {
    return WORDED_PAGES.map((source) => ({ source, destination: "/", permanent: false }));
  },
};

export default nextConfig;
