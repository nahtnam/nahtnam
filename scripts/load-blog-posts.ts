import { readdirSync, readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import matter from "gray-matter";
import { blogCategories, blogPosts } from "@/db/schema/blog";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const db = drizzle({
  casing: "snake_case",
  connection: {
    authToken: process.env.DATABASE_AUTH_TOKEN,
    url: DATABASE_URL,
  },
});

const blogDir = new URL("../blog", import.meta.url);
const files = readdirSync(blogDir).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
  console.log("No .md files found in blog/");
  process.exit(0);
}

const categoryCache = new Map<string, string>();

async function getCategoryId(name: string): Promise<string> {
  const cached = categoryCache.get(name);
  if (cached) {
    return cached;
  }

  const existing = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.name, name))
    .limit(1);

  const first = existing[0];
  if (first) {
    categoryCache.set(name, first.id);
    return first.id;
  }

  const [inserted] = await db
    .insert(blogCategories)
    .values({ name })
    .returning();

  if (!inserted) {
    throw new Error(`Failed to insert category: ${name}`);
  }

  categoryCache.set(name, inserted.id);
  console.log(`Created category: ${name}`);
  return inserted.id;
}

let upserted = 0;

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = readFileSync(new URL(file, `${blogDir.href}/`), "utf-8");
  const { data, content } = matter(raw);

  if (!(data.title && data.excerpt && data.category && data.publishedAt)) {
    console.error(
      `Skipping ${file}: missing required frontmatter (title, excerpt, category, publishedAt)`
    );
    continue;
  }

  const categoryId = await getCategoryId(data.category);

  await db
    .insert(blogPosts)
    .values({
      categoryId,
      content: content.trim(),
      excerpt: data.excerpt,
      publishedAt: new Date(data.publishedAt),
      slug,
      title: data.title,
    })
    .onConflictDoUpdate({
      set: {
        categoryId,
        content: content.trim(),
        excerpt: data.excerpt,
        publishedAt: new Date(data.publishedAt),
        title: data.title,
      },
      target: blogPosts.slug,
    });

  console.log(`Upserted: ${slug}`);
  upserted++;
}

console.log(`Done. Upserted ${upserted} post(s).`);
