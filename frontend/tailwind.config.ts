import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../backend/templates/**/*.html"],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#1d4ed8",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
