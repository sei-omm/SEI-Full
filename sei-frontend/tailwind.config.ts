import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }

      xl: { max: "1280px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... thatware}
    },
    extend: {
      fontFamily: {
        futura: ["var(--font-futura-pt)"],
        inter : ["var(--font-inter)"]
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "2.5rem",
              fontWeight: "500",
              lineHeight: "0",
            },
            h2: {
              fontSize: "2rem",
              fontWeight: "500",
              lineHeight: "0",
            },
            h3: {
              fontSize: "1.75rem",
              fontWeight: "500",
              lineHeight: "0",
            },
            h4: {
              fontSize: "1.5rem",
              fontWeight: "400",
              lineHeight: "0",
            },
          },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require('tailwind-scrollbar')],
};
export default config;
