import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1b3a",
        mute: "#5f5b7d",
        paper: "#fff8ec",
        cream: "#fff1d6",
        grape: { DEFAULT: "#7b5cff", soft: "#e9e3ff" },
        bubble: { DEFAULT: "#ff5fa2", soft: "#ffe1ee" },
        sun: { DEFAULT: "#ffc53d", soft: "#fff1c7" },
        mint: { DEFAULT: "#22d3a0", soft: "#d5f8ec" },
        sky: { DEFAULT: "#38b6ff", soft: "#dbf1ff" },
        tangerine: { DEFAULT: "#ff8a3d", soft: "#ffe6d5" },
        coral: "#ff5a5f",
        space: { DEFAULT: "#1b1240", deep: "#0f0a2a" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Rounded MT Bold", "Arial", "sans-serif"],
        sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        micro: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      borderRadius: {
        control: "14px",
        card: "22px",
        panel: "30px",
      },
      boxShadow: {
        pop: "4px 4px 0 #1d1b3a",
        "pop-sm": "2px 2px 0 #1d1b3a",
        "pop-lg": "7px 7px 0 #1d1b3a",
        key: "0 4px 0 #1d1b3a",
      },
      keyframes: {
        enter: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(1.6)" },
          "100%": { transform: "scale(1)" },
        },
        blink: {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float-up": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(-50px) scale(1.25)" },
        },
        banner: {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-8deg)" },
          "18%": { opacity: "1", transform: "scale(1.12) rotate(3deg)" },
          "30%": { transform: "scale(1) rotate(-2deg)" },
          "75%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.05) translateY(-20px) rotate(-2deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--r, 0deg))" },
        },
        fall: {
          from: { transform: "translateY(-40px) rotate(0deg)", opacity: "0" },
          "15%": { opacity: "1" },
          to: { transform: "translateY(190px) rotate(40deg)", opacity: "0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        enter: "enter 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        blink: "blink 1s step-end infinite",
        "float-up": "float-up 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        banner: "banner 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        drift: "drift 4.5s ease-in-out infinite",
        fall: "fall 3.4s linear infinite",
        wiggle: "wiggle 1.6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
