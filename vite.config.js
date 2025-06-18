import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/hpt/', // base path for building at /hpt/
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: 'Hobby Part Tracker',
        short_name: 'HobbyTracker',
        description: 'Track your hobby parts with ease!',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/hpt/',
        scope: '/hpt/',
        icons: [
          {
            src: '/hpt/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/hpt/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/hpt/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [
          // Prevent SW from intercepting API calls
          /^\/hpt\/api\/.*$/,
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
