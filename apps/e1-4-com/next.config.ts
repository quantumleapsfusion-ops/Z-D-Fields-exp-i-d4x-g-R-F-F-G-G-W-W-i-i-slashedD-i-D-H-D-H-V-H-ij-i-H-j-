import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui", "@earth-one/spacetime"],
};

export default nextConfig;
