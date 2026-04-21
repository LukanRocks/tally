import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/files': 'http://localhost:3001',
    },
  },
});
