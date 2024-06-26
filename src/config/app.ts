import { isDev } from "./node";

export const rootDomain = "nahtnam.com";
export const baseDomain = (() => {
  if (isDev) return "localhost:3000";
  return `www.${rootDomain}`;
})();
export const baseUrl = (() => {
  if (isDev) return `http://${baseDomain}`;
  return `https://${baseDomain}`;
})();
