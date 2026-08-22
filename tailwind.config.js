/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      // Bumped from the default 1024px: the one-page bento grid needs real
      // width per tile (see .orbit-grid in globals.css, same breakpoint).
      // A genuinely cramped window falls back to the stacked, scrolling
      // mobile layout instead of forcing content into too-tight tiles.
      lg: "1152px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        paper: {
          50: "#FFFFFF",
          100: "#FAF9F6",
          200: "#F2F1EC",
          300: "#E8E6DD",
        },
        ink: {
          900: "#181A20",
          700: "#3A3D46",
          500: "#6B6F7B",
          400: "#9498A3",
        },
        coral: {
          600: "#E8451F",
          500: "#FF5A36",
          400: "#FF7A5C",
          100: "#FFE4DA",
        },
        violet: {
          600: "#5B3EE0",
          500: "#7C5CFC",
          400: "#9C84FD",
          100: "#EBE5FF",
        },
        mint: {
          600: "#0D9488",
          500: "#14B8A6",
          400: "#4FD1C5",
          100: "#D9F7F1",
        },
        sun: {
          500: "#FFB020",
          100: "#FFF2D9",
        },
      },
      fontFamily: {
        display: ["'Lato'", "system-ui", "sans-serif"],
        body: ["'Lato'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(24,26,32,0.04), 0 8px 24px -8px rgba(24,26,32,0.08)",
        pop: "0 2px 6px rgba(24,26,32,0.06), 0 16px 32px -12px rgba(24,26,32,0.14)",
        glass: "0 1px 1px rgba(255,255,255,0.6) inset, 0 8px 32px -12px rgba(88,60,180,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
