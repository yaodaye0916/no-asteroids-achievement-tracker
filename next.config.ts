import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shared.fastly.steamstatic.com",
        pathname: "/community_assets/images/apps/5527800/**",
      },
    ],
  },
};

export default nextConfig;
