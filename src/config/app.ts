import { isDevelopment } from "./env";

export const appName = "TODO";
export const appUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://www.TODO.com";
