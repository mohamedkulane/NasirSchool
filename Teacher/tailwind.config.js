/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4E1F00',
        secondary: '#74512D',
        accent: '#FEBA17',
        background: '#F8F4E1'
      }
    },
  },
  plugins: [],
}