/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        chamber: {
          navy: '#0f172a',    /* Deep trusted blue */
          gold: '#b45309',    /* Prestige accent */
          light: '#f8fafc',   /* Clean background */
        }
      }
    },
  },
  plugins: [],
}
