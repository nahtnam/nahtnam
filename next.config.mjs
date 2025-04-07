// @ts-check
import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig}*/
const nextConfig = {
  poweredByHeader: false,
};

const withMDX = createMDX();

export default withMDX(nextConfig);
