import withMDX from "@next/mdx";
import withToc from "@stefanprobst/rehype-extract-toc";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
// @ts-check
// import cpx from 'cpx2';
import { env } from "./src/config/env.mjs";

/**
 * Next.js and Tailwind do not support symbolic links
 * For now we use the `sync-directory` library to create links
 * @param {string} name - The name of the module to copy
 */
// function syncModuleToApp(name) {
//   cpx.copySync(`./src/${name}/app/**/*`, `./src/app/(shipzen)/(${name})`, {
//     clean: true,
//   });
// }

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: env.IS_STANDALONE ? "standalone" : undefined,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        pathname: "/avatar/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@zenstackhq/runtime"],
    swcPlugins: [
      [
        "next-superjson-plugin",
        {
          excluded: [],
        },
      ],
    ],
  },
};

export default withMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      [rehypePrettyCode, { theme: "github-dark-default" }],
      rehypeSlug,
      withToc,
      withTocExport,
      rehypeMdxImportMedia,
    ],
  },
})(nextConfig);
