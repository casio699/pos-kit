/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
          light: '#60a5fa',
        },
        accent: '#10b981',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '0.9rem',
      },
    },
  },
  plugins: [],
}
