/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0e14",
          900: "#10151d",
          800: "#161d28",
          700: "#1f2836",
          600: "#2a3648",
        },
        mist: {
          400: "#7c8aa0",
          300: "#a3aec0",
          200: "#c7cfdc",
          100: "#e7ebf2",
        },
        ember: {
          500: "#ff8b5e",
          400: "#ffa580",
        },
        moss: {
          500: "#6bbf8e",
          400: "#8fd4ab",
        },
        dusk: {
          500: "#8b7cf6",
          400: "#a89af8",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
