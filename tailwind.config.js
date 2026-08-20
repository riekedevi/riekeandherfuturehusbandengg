/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff5f8',
          100: '#ffe4ee',
          200: '#ffc9dd',
          300: '#ff9dc1',
          400: '#ff6fa3',
          500: '#ec407a',
          600: '#d6336c',
          700: '#b02a57',
        },
        ink: '#2d1a26',
        cream: '#fff5f8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
