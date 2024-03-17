/** @type {import('tailwindcss').Config} */

console.log("tailwind.config.js __dirname", __dirname);
console.log("viteexpress using backend/tailwind.config.js");
export default {
  content: [
    "../frontend/pages/**/*.{html,js,ts,tsx}",
    "../frontend/components/**/*.{html,js,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
