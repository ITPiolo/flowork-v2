import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1A1D18",
          soft: "#252921",
        },
        sage: {
          50: "#F1F3ED",
          100: "#DEE3D3",
          300: "#AEBC9C",
          500: "#7C8A6D",
          600: "#66735A",
          700: "#4E5945",
        },
        cream: "#F7F5EF",
        sand: {
          DEFAULT: "#C9A876",
          dark: "#A8875A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      keyframes: {
        grow: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
