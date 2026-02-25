import { type Config } from "prettier";

const config: Config = {
  bracketSpacing: true,
  jsonRecursiveSort: true,
  plugins: ["prettier-plugin-sort-json"],
  singleQuote: false,
};

export default config;
