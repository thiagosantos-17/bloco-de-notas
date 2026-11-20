import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-*.png'],
      manifest: {
        name: 'Bloco de Notas',
        short_name: 'Notas',
        description: 'Um app de notas moderno, offline-first, instalável no celular e desktop',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Nova Nota',
            short_name: 'Nova',
            description: 'Criar uma nova nota',
            url: '/?new=true',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});