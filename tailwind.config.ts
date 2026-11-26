import type { Config } from "tailwindcss";

/**
 * PRAJVALA pixel design tokens.
 *
 * Palette values are extracted from the owner's reference site (riskimivan.id)
 * and adapted where the reference pairing fails WCAG AA. Every diverging value
 * is commented with the measured contrast that justified it. See DESIGN.md §11.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#080F1F",
        },
        navy: {
          DEFAULT: "#1E3A8A",
          light: "#2949A8",
          soft: "#EEF2FF",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        rose: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        sky: {
          50: "#F0F9FF",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
        },

        /* ---- Pixel world surfaces (reference palette, verified) ---- */
        pixel: {
          line: "#2B2B2B", // --outline: all borders and text on light panels (10:1)
          sky: "#87CEEB", // --sky: hero / open-air sections
          "sky-deep": "#5DADE2", // --sky-deep: sky gradient end
          grass: "#4CAF50", // --grass: decorative strips only
          "grass-deep": "#2E6B33", // adapted: white text 6.43:1 (reference #357A38 only 5.26)
          dirt: "#8B4513", // --dirt: citizen-report ground
          "dirt-dark": "#5E2F0D",
          sun: "#FFD700", // --sun: active nav, chips, highlights
          "sun-dark": "#E0B400",
          wood: "#B98249", // --wood: decorative frames only
          "wood-cta": "#8A5A2B", // adapted: cream button text 5.45:1 (reference #B98249 only 3.07)
          "wood-dark": "#7A4E28",
          "wood-darker": "#4E342E",
          panel: "#D6D9DD", // --panel: default pixel panel
          "panel-dark": "#9AA0A8", // --panel-dark: inset shade
          cream: "#FFF6E0", // --cream: paper sections
          "cream-deep": "#F4EFE3", // adapted: denser paper for tables
          ink: "#3E2723", // --ink: body text on light pixels
          blue: "#1D5FA8", // adapted: white secondary button 6.45:1 (reference #4A90D9 only 3.34)
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: [
          '"Plus Jakarta Sans Variable"',
          '"Plus Jakarta Sans"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono Variable"',
          '"JetBrains Mono"',
          "ui-monospace",
          "monospace",
        ],
        /* Press Start 2P — display labels, nav, buttons, badges. Max 5 words.
           Family names with spaces must be quoted or browsers drop the rule. */
        pixel: ['"Press Start 2P"', "ui-monospace", "monospace"],
        /* VT323 — short intros, quotes, form labels. Max 3 lines. */
        retro: ['"VT323"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        /* Pixel geometry: zero radius. Kept as tokens so intent is explicit. */
        pixel: "0px",
        "pixel-sm": "2px",
      },
      boxShadow: {
        /* Layered block shadows: 3 depth levels, never blurred. */
        panel:
          "6px 6px 0 #2B2B2B, inset -4px -4px 0 #9AA0A8, inset 4px 4px 0 #FFFFFF",
        card: "5px 5px 0 #2B2B2B",
        chip: "2px 2px 0 #2B2B2B",
        "btn-wood":
          "5px 5px 0 #2B2B2B, inset -4px -4px 0 #4E342E, inset 4px 4px 0 rgba(255,255,255,0.35)",
        "btn-blue":
          "5px 5px 0 #2B2B2B, inset -4px -4px 0 #143F6E, inset 4px 4px 0 rgba(255,255,255,0.3)",
        "btn-sun":
          "5px 5px 0 #2B2B2B, inset -4px -4px 0 #E0B400, inset 4px 4px 0 rgba(255,255,255,0.5)",
        "btn-pressed": "2px 2px 0 #2B2B2B",
        plaque: "5px 5px 0 #2B2B2B",
        "inset-field": "inset 3px 3px 0 rgba(43,43,43,0.14)",
        /* Retained for the few data surfaces that need separation without a frame. */
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -12px rgba(15, 23, 42, 0.12)",
        lifted:
          "0 2px 4px rgba(15, 23, 42, 0.04), 0 24px 48px -16px rgba(15, 23, 42, 0.18)",
        glow: "0 0 0 6px rgba(245, 158, 11, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        stepUp: {
          "0%": { transform: "translateY(8px)" },
          "100%": { transform: "translateY(0)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s steps(3, end) both",
        "step-up": "stepUp 0.24s steps(4, end) both",
        "sheet-up": "sheet-up 0.26s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.16s steps(3, end) both",
      },
      backgroundImage: {
        "pixel-tiles":
          "linear-gradient(90deg, rgba(43,43,43,0.13) 0 2px, transparent 2px 40px), linear-gradient(0deg, rgba(43,43,43,0.13) 0 2px, transparent 2px 40px)",
        "pixel-clouds":
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.85) 0 26px, transparent 27px)",
        "pixel-grid":
          "linear-gradient(to right, rgba(43,43,43,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,43,43,0.10) 1px, transparent 1px)",
      },
      backgroundSize: {
        tiles: "40px 40px",
        grid: "8px 8px",
        "data-grid": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
