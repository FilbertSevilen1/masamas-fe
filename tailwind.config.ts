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
        primary: {
          DEFAULT: "#f97316",
          light: "#fb923c",
          dark: "#ea580c",
          foreground: "#ffffff",
        },
        charcoal: {
          DEFAULT: "#1f2230",
          light: "#2d3148",
          foreground: "#f9fafb",
        },
        background: "#ffffff",
        foreground: "#111827",
        border: "#e5e7eb",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        "primary-glow": "0 8px 20px rgba(249, 115, 22, 0.35)",
        "card-hover": "0 20px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
