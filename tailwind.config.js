/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eeff',
          100: '#c0d2ff',
          200: '#9bb5ff',
          300: '#7598ff',
          400: '#507cff',
          500: '#2a5fff',
          600: '#0F52BA', // Primary blue
          700: '#0a3da8',
          800: '#042996',
          900: '#001584',
        },
        secondary: {
          50: '#e7f9f9',
          100: '#c5efee',
          200: '#a3e5e2',
          300: '#80dbd7',
          400: '#5ed1cb',
          500: '#3cc7c0',
          600: '#20B2AA', // Secondary teal
          700: '#159f98',
          800: '#0b8c86',
          900: '#007974',
        },
        accent: {
          50: '#fffbe6',
          100: '#fff5bf',
          200: '#ffee99',
          300: '#ffe773',
          400: '#ffe04d',
          500: '#ffda26',
          600: '#FFD700', // Accent gold
          700: '#e6c000',
          800: '#cca800',
          900: '#b39000',
        },
        success: {
          50: '#eaf9ec',
          100: '#c9efd0',
          200: '#a8e6b4',
          300: '#86dc98',
          400: '#65d27c',
          500: '#44c860',
          600: '#2bb049', // Success green
          700: '#239d41',
          800: '#1c8a38',
          900: '#14772f',
        },
        warning: {
          50: '#fff8e6',
          100: '#ffecbf',
          200: '#ffe099',
          300: '#ffd373',
          400: '#ffc74d',
          500: '#ffba26',
          600: '#eea800', // Warning amber
          700: '#cc9200',
          800: '#a97b00',
          900: '#866400',
        },
        error: {
          50: '#fee7e7',
          100: '#fcc5c5',
          200: '#fa9e9e',
          300: '#f87777',
          400: '#f65151',
          500: '#f42a2a',
          600: '#e01212', // Error red
          700: '#c20f0f',
          800: '#a30c0c',
          900: '#850a0a',
        },
        neutral: {
          50: '#f9f9f9',
          100: '#f0f0f0',
          200: '#e4e4e4',
          300: '#d1d1d1',
          400: '#b4b4b4',
          500: '#989898',
          600: '#6c6c6c',
          700: '#555555',
          800: '#333333',
          900: '#1a1a1a',
        },
           // Adding custom colors
           vibrantBlue: 'rgb(11, 125, 175)', // Vibrant blue
           customOrange: 'rgb(255, 165, 0)', // Orange
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
};