import { appName, appUrl } from "@repo/config/app";

export const siteTitle = "Manthan (@nahtnam)";
export const siteDescription =
  "Personal site of Manthan (@nahtnam), Principal Software Engineer at Mercury, with writing about software, startups, personal finance, travel, and developer tools.";
export const siteImage = `${appUrl}/assets/images/me.avif`;
export const twitterHandle = "@nahtnam";

export type SeoOptions = {
  readonly description: string;
  readonly image?: string;
  readonly imageLabel?: string;
  readonly keywords?: string;
  readonly path: string;
  readonly publishedAt?: Date | number | string;
  readonly robots?: string;
  readonly section?: string;
  readonly socialTitle?: string;
  readonly title: string;
  readonly type?: "article" | "website";
};

export const pageSeo = {
  blog: {
    description:
      "Essays by Manthan (@nahtnam) about software engineering, startups, personal finance, product building, developer tools, and everyday systems.",
    imageLabel: "Writing",
    path: "/blog",
    socialTitle: "Blog",
    title: `Blog | ${siteTitle}`,
  },
  bnb: {
    description:
      "A private couch booking page for friends visiting Manthan in San Francisco.",
    imageLabel: "Novelty",
    path: "/bnb",
    robots: "noindex, nofollow",
    socialTitle: "Couch BnB",
    title: `Couch BnB | ${siteTitle}`,
  },
  contact: {
    description:
      "Get in touch with Manthan (@nahtnam) about software engineering, startups, product work, writing, and collaboration opportunities.",
    imageLabel: "Contact",
    path: "/contact",
    socialTitle: "Contact Manthan",
    title: `Contact | ${siteTitle}`,
  },
  experience: {
    description:
      "Professional experience, projects, and education for Manthan (@nahtnam), Principal Software Engineer at Mercury.",
    imageLabel: "Career",
    path: "/experience",
    socialTitle: "Experience",
    title: `Experience | ${siteTitle}`,
  },
  golfR: {
    description:
      "A running ledger of mods, upgrades, maintenance, and costs for Manthan's 2026 Volkswagen Golf R in Pure White.",
    imageLabel: "Golf R Build",
    path: "/golf-r",
    socialTitle: "Golf R Build",
    title: `Golf R Build | ${siteTitle}`,
  },
  home: {
    description: siteDescription,
    imageLabel: "Portfolio",
    path: "/",
    socialTitle: siteTitle,
    title: `${siteTitle} - Principal Software Engineer at Mercury`,
  },
  pomodoro: {
    description:
      "A clean Pomodoro flip clock with configurable focus sessions, short breaks, long breaks, cycle length, browser title alerts, and an alarm.",
    imageLabel: "Focus Tool",
    keywords:
      "pomodoro timer, flip clock, focus timer, productivity timer, work timer",
    path: "/pomodoro",
    socialTitle: "Pomodoro Flip Clock",
    title: `Pomodoro Flip Clock | ${siteTitle}`,
  },
  textMe: {
    description:
      "Text Manthan's toll-free number to print your message on a receipt printer on his desk.",
    imageLabel: "Receipt Printer",
    path: "/text-me",
    socialTitle: "Text Me",
    title: `Text Me | ${siteTitle}`,
  },
  travel: {
    description:
      "Flight history and travel stats for Manthan (@nahtnam), including airports visited, routes flown, and airline patterns.",
    imageLabel: "Flight Log",
    path: "/travel",
    socialTitle: "Travel",
    title: `Travel | ${siteTitle}`,
  },
} satisfies Record<string, SeoOptions>;

type OgImageOptions = {
  readonly description: string;
  readonly label?: string;
  readonly path: string;
  readonly title: string;
};

export function canonicalUrl(path: string) {
  return new URL(path, appUrl).toString().replace(/\/$/u, "") || appUrl;
}

export function ogImageUrl(options: OgImageOptions) {
  const { description, label, path, title } = options;
  const imageUrl = new URL("/og", appUrl);
  imageUrl.searchParams.set("title", title);
  imageUrl.searchParams.set("description", description);
  imageUrl.searchParams.set("path", path);

  if (label) {
    imageUrl.searchParams.set("label", label);
  }

  return imageUrl.toString();
}

export function createSeo(options: SeoOptions) {
  const canonical = canonicalUrl(options.path);
  const socialTitle = options.socialTitle ?? options.title;
  const image =
    options.image ??
    ogImageUrl({
      description: options.description,
      label: options.imageLabel,
      path: options.path,
      title: socialTitle,
    });
  const type = options.type ?? "website";
  const publishedAt = normalizePublishedAt(options.publishedAt);

  return {
    links: [{ href: canonical, rel: "canonical" }],
    meta: [
      { title: options.title },
      { content: options.description, name: "description" },
      { content: options.robots ?? "index, follow", name: "robots" },
      ...(options.keywords
        ? [{ content: options.keywords, name: "keywords" }]
        : []),
      { content: appName, property: "og:site_name" },
      { content: canonical, property: "og:url" },
      { content: type, property: "og:type" },
      { content: socialTitle, property: "og:title" },
      { content: options.description, property: "og:description" },
      { content: image, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: "image/png", property: "og:image:type" },
      ...(publishedAt
        ? [{ content: publishedAt, property: "article:published_time" }]
        : []),
      ...(options.section
        ? [{ content: options.section, property: "article:section" }]
        : []),
      ...(type === "article"
        ? [{ content: canonicalUrl("/"), property: "article:author" }]
        : []),
      { content: "summary_large_image", name: "twitter:card" },
      { content: twitterHandle, name: "twitter:creator" },
      { content: twitterHandle, name: "twitter:site" },
      { content: socialTitle, name: "twitter:title" },
      { content: options.description, name: "twitter:description" },
      { content: image, name: "twitter:image" },
    ],
  };
}

function normalizePublishedAt(value: SeoOptions["publishedAt"]) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  return value;
}
