import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      manifest: {
        name: "ARGUS — catat limbah dapur",
        short_name: "ARGUS",
        description: "Catat timbang, lacak limpahan, dan buktikan pengelolaan limbah dapur SPPG.",
        lang: "id",
        start_url: "/catat",
        display: "standalone",
        background_color: "#f7f7f5",
        theme_color: "#f7f7f5",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,png}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/(sppg|facilities|menu\/items|parameters)(\/|\?|$)/,
            handler: "NetworkFirst",
            options: {
              cacheName: "argus-reference",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /basemaps\.cartocdn\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "argus-tiles",
              expiration: { maxEntries: 400, maxAgeSeconds: 2592000 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  build: {
    target: "es2023",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "query", test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: "forms", test: /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/ },
            { name: "map", test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/ }
          ]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.spec.{ts,tsx}"],
    restoreMocks: true,
    clearMocks: true,
    css: false,
    env: {
      VITE_API_URL: "http://localhost:3001/api/v1",
      VITE_APP_TITLE: "ARGUS",
      VITE_POLL_OPERATIONAL_MS: "60000",
      VITE_POLL_FLEET_MS: "30000",
      VITE_OUTBOX_SYNC_MS: "60000",
      VITE_SYNC_BATCH_MAX: "50",
      VITE_PHOTO_MAX_BYTES: "1048576",
      VITE_DEMO_MODE: "false",
      VITE_MEDIA_ORIGINS: ""
    }
  }
});