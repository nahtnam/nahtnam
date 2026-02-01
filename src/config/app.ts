import { isDevelopment } from "./env";

export const appName = "nahtnam";
export const appUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://www.nahtnam.com";
