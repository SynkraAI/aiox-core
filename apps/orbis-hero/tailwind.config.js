/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Anton', 'sans-serif'],
        condiment: ['Condiment', 'cursive'],
      },
      colors: {
        cream: '#EFF4FF',
        neon: '#6FFF00',
      },
    },
  },
  plugins: [],
};
