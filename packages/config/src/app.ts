export const isDevelopment = process.env.NODE_ENV !== "production";
export const isProduction = process.env.NODE_ENV === "production";

export const appName = "nahtnam";
export const siteDescription =
  "Personal site of Manthan (@nahtnam), Principal Software Engineer at Mercury, with writing about software, startups, personal finance, travel, and developer tools.";
export const siteTitle = "Manthan (@nahtnam)";
export const appUrl = isDevelopment
  ? "https://nahtnam.localhost"
  : "https://www.nahtnam.com";
