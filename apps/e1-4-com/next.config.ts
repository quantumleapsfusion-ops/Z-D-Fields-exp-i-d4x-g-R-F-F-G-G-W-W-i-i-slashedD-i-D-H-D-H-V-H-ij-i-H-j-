import type { NextConfig } from "next";

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
  // Short personal links: e1-4.com/@handle.
  async rewrites() {
    return [{ source: "/@:handle", destination: "/u/:handle" }];
  },
};

export default nextConfig;
