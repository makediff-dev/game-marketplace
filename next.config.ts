import type { NextConfig } from "next";

// Files in public/ have no hash in the name, so a week, not a year.
const PUBLIC_DIRS = ["assets", "auth", "catalog", "fonts", "profile"];

const nextConfig: NextConfig = {
  async headers() {
    return PUBLIC_DIRS.map((dir) => ({
      source: `/${dir}/:path*`,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=604800, stale-while-revalidate=86400",
        },
      ],
    }));
  },
};

export default nextConfig;
