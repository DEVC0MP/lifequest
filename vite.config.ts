import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      manifest: {
        name: "LifeQuest — Arkusz Rozwoju Osobistego",
        short_name: "LifeQuest",
        description: "Lokalny panel celów, tygodnia, codziennych mikroakcji, nawyków i bezpiecznych kopii danych.",
        lang: "pl",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#101318",
        theme_color: "#ddad45",
        categories: ["lifestyle", "productivity"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,xml,txt}"],
        globIgnores: ["pwa-*.png", "maskable-icon-*.png"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
