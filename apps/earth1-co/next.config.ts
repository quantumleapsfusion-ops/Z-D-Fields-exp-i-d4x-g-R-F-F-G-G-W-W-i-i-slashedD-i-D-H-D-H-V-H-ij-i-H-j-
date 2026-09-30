import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui", "@earth-one/spacetime", "@earth-one/liquid-metal"],
};

export default nextConfig;
