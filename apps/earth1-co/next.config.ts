import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui", "@earth-one/spacetime"],
  // earth1.co/e1-4 is the short link to the flagship.
  async redirects() {
    return [{ source: "/e1-4", destination: "https://e1-4.com", permanent: false }];
  },
};

export default nextConfig;
