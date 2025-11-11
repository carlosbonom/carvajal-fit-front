import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        primary: {
          DEFAULT: "#00b2de",
          50: "#e6f7fc",
          100: "#b3e8f6",
          200: "#80d9f0",
          300: "#4dcaea",
          400: "#1abbe4",
          500: "#00b2de",
          600: "#008fb1",
          700: "#006c84",
          800: "#004957",
          900: "#00262a",
          foreground: "#ffffff",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#00b2de",
            50: "#e6f7fc",
            100: "#b3e8f6",
            200: "#80d9f0",
            300: "#4dcaea",
            400: "#1abbe4",
            500: "#00b2de",
            600: "#008fb1",
            700: "#006c84",
            800: "#004957",
            900: "#00262a",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}

module.exports = config;