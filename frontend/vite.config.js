import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:5000'

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    // Base path for GitHub Pages: /Customer-Segmentation-Project/
    base: mode === 'production' ? '/Customer-Segmentation-Project/' : '/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    define: {
      __API_BASE__: JSON.stringify(apiBase),
    },
  }
})
