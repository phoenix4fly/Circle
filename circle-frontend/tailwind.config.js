/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'helvetica': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'sans': ['Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff1f0',
          100: '#ffe0dc',
          200: '#ffc6be',
          300: '#ff9f92',
          400: '#ff6b55',
          500: '#ff4025',  // Основной красно-оранжевый
          600: '#ed2710',
          700: '#c81e0a',
          800: '#a51b0c',
          900: '#881d10',
        },
        accent: {
          50: '#fff4ed',
          100: '#ffe6d4',
          200: '#ffc9a8',
          300: '#ffa371',
          400: '#ff7538',
          500: '#ff5212',  // Дополнительный оранжевый
          600: '#f0370b',
          700: '#c7280c',
          800: '#9e2312',
          900: '#7f2012',
        },
      },
    },
  },
  plugins: [],
} 