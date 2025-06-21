/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/nativewind/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          400: '#FB923C',
          500: '#F97316',
        },
        gray: {
          50: '#F9FAFB',
          700: '#374151',
        },
      },
    },
  },
  plugins: [],
};
