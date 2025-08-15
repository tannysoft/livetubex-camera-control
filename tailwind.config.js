/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'camera-red': '#FF0000',
        'camera-orange': '#FF8C00',
        'camera-green': '#27ae60',
        'camera-dark': '#1a1a1a',
        'camera-card': '#2a2a2a',
        'camera-element': '#3a3a3a',
        'camera-border': '#4a4a4a'
      },
      animation: {
        'recording-pulse': 'recording-pulse 1.5s infinite',
        'recording-gradient': 'recording-gradient 2s infinite',
        'recording-item-pulse': 'recording-item-pulse 2s infinite'
      },
      keyframes: {
        'recording-pulse': {
          '0%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1.05)' }
        },
        'recording-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'recording-item-pulse': {
          '0%': { transform: 'scale(1.02)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1.02)' }
        }
      }
    },
  },
  plugins: [],
} 