// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    backgroundOpacity: true,
  },
  theme: {
    extend: {
      colors: {
        primary: 'gray-900',
        main: '#10B981',
      }
    },
  },
  plugins: [],
}


