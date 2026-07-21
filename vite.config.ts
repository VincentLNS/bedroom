import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Mini Déco — Chambre de Louise',
        short_name: 'Mini Déco',
        description: 'Apprends à décorer une chambre en 3D',
        theme_color: '#7ec8b3',
        background_color: '#fff6e8',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        lang: 'fr',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        // Kenney OBJ/MTL stay network-first (too many / large for precache).
        runtimeCaching: [
          {
            urlPattern: /\/models\/kenney\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kenney-models',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/@react-three')) return 'r3f'
          if (id.includes('node_modules/zustand')) return 'zustand'
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
