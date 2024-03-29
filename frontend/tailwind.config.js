/** @type {import('tailwindcss').Config} */

console.log("tailwind.config.js __dirname", __dirname);
export default {
  content: [
    "./pages/**/*.{html,js,ts,tsx}",
    "./components/**/*.{html,js,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
