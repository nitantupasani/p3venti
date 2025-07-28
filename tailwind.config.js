/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#4f46e5', // A vibrant indigo
          'light': '#6366f1',
        },
        'secondary': '#1f2937', // A dark, rich gray for text
        'accent': '#10b981',   // A fresh green for accents
        'neutral': {
          100: '#f3f4f6', // Light gray for page background
          200: '#e5e7eb', // Slightly darker gray for borders, dividers
        },
        'base-100': '#ffffff', // Card and page background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-10px)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        fadeOut: 'fadeOut 0.3s ease-in forwards',
      }
    },
  },
  plugins: [],
}
