import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/hearings/[id]": ["./public/data/hearings/**/*"],
    "/": ["./public/data/hearings/**/*"],
    "/search": ["./public/data/hearings/**/*"],
    "/about": ["./public/data/hearings/**/*"],
  },
};

export default nextConfig;
