import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.PORT || '8443'),
    strictPort: true,
    // The verification service (backend/) runs on port 8000.
    proxy: { '/api': 'http://localhost:8000' },
  },
  preview: {
    port: parseInt(process.env.PORT || '8443'),
  },
})
