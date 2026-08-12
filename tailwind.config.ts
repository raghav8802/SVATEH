import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "svate-white": "#FFFFFF",
        "svate-ivory": "#fff8f5",
        "svate-beige": "#E9DDCF",
        "svate-gold": "#C8A66A",
        "svate-espresso": "#4B3A2F",
        "svate-sand": "#DCCBB8",
        "svate-rose": "#D9B6A3",
        "svate-terracotta": "#B9806F",
        "svate-mocha": "#8A6B5C",
        "svate-taupe": "#9C8C7A",
        primary: "#C8A66A",
        secondary: "#DCCBB8",
        neutral: "#4B3A2F",
        surface: "#fff8f5",
        warm: "#D9B6A3",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        caption: [
          "0.6875rem",
          { lineHeight: "1rem", letterSpacing: "0.2em" },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
