/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}', // Add this if using the /app directory in Next.js 13+
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

