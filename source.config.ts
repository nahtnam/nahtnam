import { defineCollections, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
export const blogPosts = defineCollections({
  type: "doc",
  dir: "src/content/blog",
  schema: frontmatterSchema.extend({
    title: z.string(),
    publishedAt: z.string().date().or(z.date()),
    author: z.string().optional(),
    summary: z.string().optional(),
  }),
});
