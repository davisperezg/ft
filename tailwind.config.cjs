/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  // important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      textShadow: {
        disabled: "rgba(0,0,0,.2) 0 0 0.5px"
      },
      colors: {
        dialog: "rgba(0, 0, 0, 0.35)",
        primary: "#FF0000",
        secondary: "#5A626F",
        default: "#F2F2F2",
        hover: "#E5E5E5",
        borders: "#B4B4B4",
        bordersAux: "#E3E4E6",
        textDefault: "#213547",
        blueAction: "#005EB8",
        disabled: "#f5f5f5",
        textDisabled: "rgba(0,0,0,.25)"
      },
      animation: {
        spin: "spin 2s linear infinite",
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
};
