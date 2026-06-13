/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef3f8',
          100: '#d9e5f0',
          200: '#b8cde1',
          300: '#8fabcd',
          400: '#6688b8',
          500: '#476f9f',
          600: '#345986',
          700: '#2b486d',
          800: '#243d5d',
          900: '#1f3864',
          950: '#13203a',
        },
        secondary: {
          50: '#eef7fc',
          100: '#d8edf8',
          200: '#b6def1',
          300: '#85c8e7',
          400: '#4da9d8',
          500: '#2e86c1',
          600: '#266eaa',
          700: '#245a89',
          800: '#254d71',
          900: '#23415f',
        },
        ink: colors.slate,
      },
    },
  },
  plugins: [],
}
