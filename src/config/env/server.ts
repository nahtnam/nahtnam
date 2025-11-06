import arkenv from "arkenv";

export const env = arkenv({
  BETTER_AUTH_SECRET: "string",
  BETTER_AUTH_URL: "string.url",
  "DATABASE_AUTH_TOKEN?": "string",
  DATABASE_URL: "string.url",

  "GOOGLE_CLIENT_ID?": "string",
  "GOOGLE_CLIENT_SECRET?": "string",
});
