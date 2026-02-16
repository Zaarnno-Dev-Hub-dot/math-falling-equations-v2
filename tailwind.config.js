/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          dark: '#EE5A5A',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          dark: '#3DBDB4',
        },
        tertiary: '#FFE66D',
        sky: {
          top: '#87CEEB',
          bottom: '#E0F6FF',
        },
        ground: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
        },
        text: {
          dark: '#2C3E50',
          medium: '#5D6D7E',
          light: '#95A5A6',
        },
        success: '#27AE60',
        error: '#E74C3C',
        warning: '#F39C12',
      },
      fontFamily: {
        display: ['Nunito', 'Comic Neue', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 107, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(255, 107, 107, 0.2)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-8px)' },
          '80%': { transform: 'translateX(8px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
