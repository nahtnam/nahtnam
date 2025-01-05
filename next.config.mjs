// @ts-check
import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig}*/
const nextConfig = {
  experimental: {
    dynamicIO: true,
  },
  poweredByHeader: false,
};

const withMDX = createMDX();

export default withMDX(nextConfig);
