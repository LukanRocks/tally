import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          500: '#4f63d2',
          600: '#3d50c0',
          700: '#2e3ea8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
