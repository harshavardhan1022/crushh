import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amore: {
          pink: '#F7B6D2',
          'soft-pink': '#FCE4EF',
          lavender: '#D9C8F2',
          'deep-purple': '#321442',
          'dark-bg': '#151022',
          'dark-card': '#1E1535',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(247, 182, 210, 0.15)',
        'pink-sm': '0 2px 10px rgba(247, 182, 210, 0.25)',
        'pink-md': '0 8px 25px rgba(247, 182, 210, 0.35)',
        'pink-lg': '0 12px 35px rgba(247, 182, 210, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;

