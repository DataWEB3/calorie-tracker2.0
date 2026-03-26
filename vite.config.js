import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'es2015',
    minify: 'esbuild'
  },
  base: '/calorie-tracker2.0/'
})
