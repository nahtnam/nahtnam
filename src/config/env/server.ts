import arkenv from "arkenv";

export const env = arkenv({
  DRAFT_MODE: "boolean = false",
  "OST_GITHUB_CALLBACK_URL?": "string.url",
  OST_GITHUB_ID: "string",
  OST_GITHUB_SECRET: "string",
});
