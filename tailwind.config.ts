import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#050a12",
          2: "#0a1525",
          3: "#0f1f35",
        },
        accent: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          teal: "#06b6d4",
        },
      },
    },
  },
  plugins: [],
};

export default config;
