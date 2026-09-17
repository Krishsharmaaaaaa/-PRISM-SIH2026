import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF7",
        surface: "#FFFFFF",
        surfaceSunken: "#F3F1EC",
        ink: "#211F1C",
        stone: "#6E6A63",
        stoneLight: "#9C978E",
        hairline: "#E4E0D7",
        hairlineStrong: "#CFC9BC",
        oxblood: {
          DEFAULT: "#7A2331",
          dark: "#5E1A25",
          light: "#9C3A49",
          tint: "#F6E9EA",
        },
        moss: { DEFAULT: "#3F6B4F", tint: "#EAF1EC" },
        amber: { DEFAULT: "#8A6A1F", tint: "#F6EFE0" },
        slateblue: { DEFAULT: "#3A5166", tint: "#EAEEF2" },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.3rem" }],
        sm: ["0.9375rem", { lineHeight: "1.45rem" }],
        base: ["1.0625rem", { lineHeight: "1.65rem" }],
        lg: ["1.1875rem", { lineHeight: "1.7rem" }],
        xl: ["1.375rem", { lineHeight: "1.85rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.15rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.6rem" }],
        "4xl": ["2.9rem", { lineHeight: "3.2rem" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(33,31,28,0.04), 0 4px 16px rgba(33,31,28,0.06)",
        float: "0 8px 28px rgba(33,31,28,0.14)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(122,35,49,0.35)" },
          "70%": { boxShadow: "0 0 0 8px rgba(122,35,49,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(122,35,49,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        pulseRing: "pulseRing 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
