import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "WanderWords – English Travel Crossword",
        short_name: "WanderWords",
        description:
          "เกม crossword ฝึกคำศัพท์อังกฤษสำหรับการท่องเที่ยว เล่นได้แม้ออฟไลน์",
        lang: "th",
        start_url: "/pwa-cross-word-game/",
        scope: "/pwa-cross-word-game/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#dceeff",
        theme_color: "#2588dc",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  base: "/pwa-cross-word-game/",
});

