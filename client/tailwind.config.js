/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'dark-purple': '#081A51',
        "light-white": "rgba(255,255,255,0.18)",
      },
    },
  },
  plugins: [],
}