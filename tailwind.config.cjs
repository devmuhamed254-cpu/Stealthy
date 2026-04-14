/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgba(15, 23, 42, 0.95)',
        surface: 'rgba(30, 41, 59, 0.95)',
        border: 'rgba(51, 65, 85, 0.8)',
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
}