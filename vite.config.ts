import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '63BSA (Old 65B) Certificate Generator',
        short_name: 'BSA63',
        display: 'standalone',
        theme_color: '#1e293b',
        background_color: '#ffffff',
      },
    }),
  ],
  worker: { format: 'es' },
  test: { environment: 'node' },
})
