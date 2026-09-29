import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui"],
  // Native speaker-recognition binaries load from node_modules at runtime.
  serverExternalPackages: ["@picovoice/eagle-node"],
};

export default nextConfig;
