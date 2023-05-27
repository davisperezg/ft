/** @type {import('tailwindcss').Config} */
module.exports = {
  // important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dialog: "rgba(0, 0, 0, 0.35)",
        primary: "#FF0000",
        secondary: "#030303",
        default: "#F2F2F2",
        hover: "#E5E5E5",
        borders: "#B4B4B4",
        bordersAux: "#E3E4E6",
        textDefault: "#213547",
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
  plugins: [],
};
