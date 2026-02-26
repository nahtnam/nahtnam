export const isDevelopment = process.env.NODE_ENV !== "production"; // eslint-disable-line n/prefer-global/process
export const isProduction = process.env.NODE_ENV === "production"; // eslint-disable-line n/prefer-global/process

export const appName = "nahtnam";
export const appUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://www.nahtnam.com";
