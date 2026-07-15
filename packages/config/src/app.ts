export const isDevelopment = process.env.NODE_ENV !== "production";
export const isProduction = process.env.NODE_ENV === "production";

export const appName = "TODO";
export const appUrl = isDevelopment
  ? "https://TODO.localhost"
  : "https://www.TODO.com";
