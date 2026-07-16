import { mkdir, writeFile } from "node:fs/promises";

import { generateOgImagePng } from "../apps/web/src/lib/og-image";
import { pageSeo } from "../apps/web/src/lib/seo";

type Preview = {
  description: string;
  label?: string;
  name: string;
  path: string;
  title: string;
};

const previews: Preview[] = [
  {
    description: pageSeo.home.description,
    label: pageSeo.home.imageLabel,
    name: "home",
    path: pageSeo.home.path,
    title: pageSeo.home.socialTitle,
  },
  {
    description:
      "Large Next.js projects with deeply nested route groups, parallel routes, and dynamic segments make it surprisingly annoying to find the source file for a given URL.",
    label: "Writing",
    name: "blog-nextjs-route-jumper",
    path: "/blog/announcing-nextjs-route-jumper",
    title: "Announcing Next.js Route Jumper",
  },
  {
    description: pageSeo.golfR.description,
    label: pageSeo.golfR.imageLabel,
    name: "golf-r",
    path: pageSeo.golfR.path,
    title: pageSeo.golfR.socialTitle,
  },
  {
    description: pageSeo.pomodoro.description,
    label: pageSeo.pomodoro.imageLabel,
    name: "pomodoro",
    path: pageSeo.pomodoro.path,
    title: pageSeo.pomodoro.socialTitle,
  },
];

const outputDirectory = ".tmp/og-previews";
await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  previews.map(async (preview) => {
    const png = await generateOgImagePng(preview);
    await writeFile(`${outputDirectory}/${preview.name}.png`, png);
  })
);

console.log(`Wrote ${previews.length} OG image previews to ${outputDirectory}`);
