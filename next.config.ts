import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingIncludes: {
    "/*": ["outstatic/**/*"],
  },
  reactCompiler: true,
};

export default nextConfig;
