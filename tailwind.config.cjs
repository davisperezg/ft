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
      },
    },
  },
  plugins: [],
};
