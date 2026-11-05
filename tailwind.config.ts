import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fervo: {
          cream: "#FBF7EF",
          green: "#0E2F24",
          olive: "#858962",
          terracotta: "#B86F4B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(14, 47, 36, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
