import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import daisyUI from "daisyui";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  daisyui: {
    themes: ["light"],
    logs: false,
  },
  plugins: [tailwindTypography, daisyUI],
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: "1rem",
          "2xl": "6rem",
          lg: "4rem",
          sm: "2rem",
          xl: "5rem",
        },
      },
      fontFamily: {
        display: [
          "var(--font-inter-tight)",
          "var(--font-inter)",
          ...defaultTheme.fontFamily.sans,
        ],
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
export default config;
