/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // important: true,
  //new color:  -#478CFF - #2e66ff
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        asun: "0 .46875rem 2.1875rem rgb(4 9 20/3%),0 .9375rem 1.40625rem rgb(4 9 20/3%),0 .25rem .53125rem rgb(4 9 20/5%),0 .125rem .1875rem rgb(4 9 20/3%)",
      },
      textShadow: {
        disabled: "rgba(0,0,0,.2) 0 0 0.5px",
      },
      colors: {
        dialog: "rgba(0, 0, 0, 0.35)",
        primary: "#007BE8",
        hoverPrimary: "#0069c5",
        borderPrimary: "#0069c5",
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
