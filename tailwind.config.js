/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        'pizza-red': '#d32f2f',
        'pizza-dark-red': '#8b0000',
        'pizza-orange': '#ffc107',
        'pizza-dark-orange': '#ff9800',
        'pizza-green': '#43a047',
        'pizza-dark-green': '#2e7d32',
        'light-bg': '#fafafa',
        'dark-bg': '#121212',
        'text-light': '#f1f1f1',
        'text-dark': '#2c2c2c',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.2)',
        'card-hover': '0 12px 28px rgba(0,0,0,0.3)',
        'button-glow': '0 0 15px rgba(255,193,7,0.6)',
        'modal': '0 15px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        slideInUp: 'slideInUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        slideInLeft: 'slideInLeft 0.7s ease-out',
        pulseGlow: 'pulseGlow 1.5s infinite ease-in-out',
        shine: 'shine 3s infinite linear',
        glow: 'glow 2s infinite ease-in-out alternate',
        toastIn: 'toastIn 0.6s ease-out',
        toastOut: 'toastOut 0.6s 3s forwards',
        toastProgress: 'toastProgress 3s linear forwards',
      },
      keyframes: {
        fadeIn: { 'from': { opacity: 0 }, 'to': { opacity: 1 } },
        slideInUp: { 'from': { opacity: 0, transform: 'translateY(30px)' }, 'to': { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { 'from': { opacity: 0, transform: 'translateX(-30px)' }, 'to': { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow: { '0%, 100%': { opacity: 0.7 }, '50%': { opacity: 1 } },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        glow: { 'from': { textShadow: 'none' }, 'to': { textShadow: '0 0 12px rgba(211,47,47,0.8)' } },
        toastIn: { 'from': { transform: 'translateX(120%)', opacity: 0 }, 'to': { transform: 'translateX(0)', opacity: 1 } },
        toastOut: { 'to': { transform: 'translateX(120%)', opacity: 0 } },
        toastProgress: { 'from': { width: '100%' }, 'to': { width: '0' } },
      },
      backgroundImage: {
        'shine-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}