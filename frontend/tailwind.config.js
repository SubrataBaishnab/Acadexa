/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode toggling via a CSS class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#7c3aed',
        darkBg: '#0f172a', // Deep slate for a premium dark feel
        darkCard: '#1e293b',
      },
      animation: {
        'breathing-glow': 'glow 3s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { textShadow: '0 0 20px rgba(59, 130, 246, 0.9), 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}