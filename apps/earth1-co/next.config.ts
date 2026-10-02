import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@earth-one/ui", "@earth-one/spacetime"],
  async redirects() {
    return [
      // Redirect old pillar URLs to /learn
      {
        source: "/mathematics",
        destination: "/learn/mathematics",
        permanent: true,
      },
      {
        source: "/physics",
        destination: "/learn/physics",
        permanent: true,
      },
      {
        source: "/chemistry",
        destination: "/learn/chemistry",
        permanent: true,
      },
      {
        source: "/biology",
        destination: "/learn/biology",
        permanent: true,
      },
      {
        source: "/quantum-mechanics",
        destination: "/learn/quantum-mechanics",
        permanent: true,
      },
      {
        source: "/quantum-computing",
        destination: "/learn/quantum-computing",
        permanent: true,
      },
      {
        source: "/global-citizenship",
        destination: "/learn/global-citizenship",
        permanent: true,
      },
      // Redirect old /founder to /about
      {
        source: "/founder",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
