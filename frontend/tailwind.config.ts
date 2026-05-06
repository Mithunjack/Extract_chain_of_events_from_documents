import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1320",
        gold: "#f4c96b",
        mist: "#cbd5e1",
        ember: "#f97316",
        sapphire: "#38bdf8"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(244, 201, 107, 0.25), 0 25px 80px rgba(11, 19, 32, 0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
