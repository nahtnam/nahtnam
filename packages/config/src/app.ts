export const isDevelopment = process.env.NODE_ENV !== "production";
export const isProduction = process.env.NODE_ENV === "production";

export const appName = "nahtnam";
export const siteDescription =
  "Manthan Mallikarjun is a Principal Software Engineer at Mercury working on applied AI, product systems, and developer infrastructure.";
export const siteTitle = "Manthan Mallikarjun (@nahtnam)";
// Printed links must remain reachable from a phone, regardless of worker mode.
export const publicAppUrl = "https://www.nahtnam.com";
export const receiptPhoneNumber = "+18556248626";
export const appUrl = isDevelopment
  ? "https://nahtnam.localhost"
  : publicAppUrl;
