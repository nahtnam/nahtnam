import { mkdir, rm, writeFile } from "node:fs/promises";

import { generateOgImagePng } from "../apps/web/src/lib/og-image";
import { pageSeo } from "../apps/web/src/lib/seo";

type Preview = {
  readonly name: string;
  readonly title: string;
};

const pagePreviews: Preview[] = Object.entries(pageSeo).map(([name, seo]) => ({
  name,
  title: seo.socialTitle ?? seo.title,
}));
const blogPreviews: Preview[] = [
  {
    name: "blog-what-mattered-while-building-mercury-command",
    title: "What Mattered While Building Mercury Command",
  },
  {
    name: "blog-announcing-nextjs-route-jumper",
    title: "Next.js Route Jumper — A VS Code Extension I Built",
  },
  {
    name: "blog-announcing-tanstack-route-jumper",
    title: "TanStack Route Jumper — A VS Code Extension I Built",
  },
  {
    name: "blog-claude-bought-me-a-car",
    title: "Claude Bought Me a Car",
  },
  {
    name: "blog-how-i-set-up-a-new-mac",
    title: "How I Set Up a New Mac",
  },
  {
    name: "blog-ynab-for-the-middle-class",
    title: "YNAB for the Middle Class",
  },
];
const previews = [...pagePreviews, ...blogPreviews];
const outputDirectory = ".tmp/og-previews";

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  previews.map(async (preview) => {
    const png = await generateOgImagePng({ title: preview.title });
    await writeFile(`${outputDirectory}/${preview.name}.png`, png);
  })
);

console.log(`Wrote ${previews.length} OG image previews to ${outputDirectory}`);
