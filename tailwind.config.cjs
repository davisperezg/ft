/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      textShadow: {
        disabled: "rgba(0,0,0,.2) 0 0 0.5px",
      },
      colors: {
        dialog: "rgba(0, 0, 0, 0.35)",
        primary: "#478CFF",
        hoverPrimary: "#2e66ff",
        borderPrimary: "#2e66ff",
        danger: "#FF0000",
        secondary: "#5A626F",
        default: "#172336", //#1723360A - #F2F2F2
        bgDefault: "#1723360A", //# - rgb(244, 244, 244)
        bgDefaultAux: "#F1F2F3",
        borders: "#B4B4B4",
        bordersAux: "#E3E4E6",
        bgDisabled: "#f5f5f5",
        textDisabled: "rgba(0,0,0,.25)",
        selected: "#e2e2e2",
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
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
  ],
};
