import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [tailwindTypography],
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
