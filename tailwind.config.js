/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system tokens
        background: "#0e0e10",
        surface: "rgba(19, 19, 21, 0.88)",
        border: "#2a2a2e",
        primary: "#ffffff",
        muted: "#a0a0a8",
        dim: "#5a5a65",
        accent: "#d99753",
        "accent-light": "#f0b87a",
        danger: "#ff4d6d",
        // Original Material tokens kept for compat
        "on-error-container": "#ffdad6",
        "surface-container-highest": "#353437",
        "on-primary-fixed": "#3e0022",
        "surface-container-lowest": "#0e0e10",
        "surface-container-low": "#1c1b1d",
        "tertiary": "#efc200",
        "secondary": "#5de6ff",
        error: "#ffb4ab",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "border-pulse": {
          "0%, 100%": { borderColor: "#d99753" },
          "50%": { borderColor: "#f0b87a" },
        },
        "burn-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "60%": { opacity: "1" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease both",
        "slide-in": "slide-in 0.3s ease both",
        "scan": "scan 3s linear infinite",
        "blink": "blink 1s step-end infinite",
        "border-pulse": "border-pulse 2s ease-in-out infinite",
        "burn-in": "burn-in 0.6s ease both",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
