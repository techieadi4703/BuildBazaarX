import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // REQUIRED for class-based dark mode
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === BBX BRAND TOKENS ===
        bbx: {
          // Background layers
          "base": "#F7F5F1",
          "surface": "#F0EDE7",
          "card": "#FFFFFF",
          "mortar": "#E4DDD4",
          "plaster": "#D0C8BE",

          // Text
          "carbon": "#1D1B17",
          "dust": "#746D65",
          "chalk": "#A49D97",

          // Blueprint Navy (primary accent)
          "navy": "#1A3D7C",
          "navy-hover": "#15326A",
          "navy-mid": "#4B84D8",
          "navy-faint": "#EBF0FA",

          // Brass (warm accent / CTA)
          "brass": "#BF7930",
          "brass-hover": "#A8671F",
          "brass-mid": "#D4893A",
          "brass-faint": "#FEF3E2",

          // Semantic
          "success": "#2D7A4F",
          "success-faint": "#E8F5EE",
          "warning": "#C47D1A",
          "warning-faint": "#FFF4E0",
          "error": "#C1292E",
          "error-faint": "#FDEAEA",

          // === DARK MODE SURFACES ===
          "dark-base": "#0C1119",
          "dark-surface": "#131C27",
          "dark-card": "#1A2535",
          "dark-border": "#1F2E40",
          "dark-border-strong": "#263547",
          "dark-text": "#EDE8DF",
          "dark-muted": "#8A8680",
          "dark-faint": "#5C5854",
          "dark-navy": "#4B84D8",
          "dark-navy-faint": "#1A2D4A",
          "dark-brass": "#D4893A",
          "dark-brass-faint": "#2C1E0A",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "600" }],
        "display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-md": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "label-lg": ["0.75rem", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600" }],
        "label-md": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.07em", fontWeight: "600" }],
      },
      backgroundImage: {
        // THE SIGNATURE ELEMENT — Blueprint grid texture
        "blueprint-grid": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%231A3D7C' stroke-width='0.6' opacity='0.06'/%3E%3C/svg%3E")`,
        "blueprint-grid-dark": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%234B84D8' stroke-width='0.6' opacity='0.09'/%3E%3C/svg%3E")`,
      },
      boxShadow: {
        "bbx-sm": "0 1px 3px rgba(29,27,23,0.08), 0 1px 2px rgba(29,27,23,0.04)",
        "bbx-md": "0 4px 16px rgba(29,27,23,0.10), 0 2px 6px rgba(29,27,23,0.05)",
        "bbx-lg": "0 8px 32px rgba(29,27,23,0.12), 0 4px 12px rgba(29,27,23,0.06)",
        "bbx-navy": "0 4px 16px rgba(26,61,124,0.22)",
        "bbx-brass": "0 4px 16px rgba(191,121,48,0.25)",
        // Dark mode shadows
        "bbx-dark-sm": "0 1px 3px rgba(0,0,0,0.25)",
        "bbx-dark-md": "0 4px 16px rgba(0,0,0,0.35)",
        "bbx-dark-lg": "0 8px 32px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        "xs": "2px",
        "sm": "4px",
        "md": "6px",
        "lg": "10px",
        "xl": "14px",
        "2xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
