import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Separate from vite.config.ts on purpose.
 *
 * The dev/build config carries the React Compiler babel pass and the Tailwind
 * plugin; neither changes component behaviour, and both cost time on every test
 * run. Tests assert what the component renders and does, which is identical
 * either way.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
