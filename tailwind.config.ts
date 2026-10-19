import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-ink": "var(--accent-ink)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Fraunces Variable"', "Fraunces", "Georgia", "serif"],
        sans: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
