export const isDevelopment = process.env.NODE_ENV !== "production";
export const isProduction = process.env.NODE_ENV === "production";

export const appName = "nahtnam";
export const siteDescription =
  "Manthan Mallikarjun is a Principal Software Engineer at Mercury working on applied AI, product systems, and developer infrastructure.";
export const siteTitle = "Manthan Mallikarjun (@nahtnam)";
export const appUrl = isDevelopment
  ? "https://nahtnam.localhost"
  : "https://www.nahtnam.com";
