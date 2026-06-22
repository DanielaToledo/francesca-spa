import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer' // 1. Importa el plugin

export default defineConfig({
  plugins: [
    react(),
    visualizer({           // 2. Añade el plugin a la lista
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})