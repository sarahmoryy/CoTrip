/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#10B981",
        accent: "#4ade80",
        bg: "#080c0a",
        surface: "#111827",
      },
    },
  },
  plugins: [],
};
