import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: "/buzz-note-v3/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        selectHive: resolve(__dirname, "selectHive.html"),
        frames: resolve(__dirname, "frames.html"),
        past: resolve(__dirname, "past/index.html"),
        inspectionDetail: resolve(__dirname, "past/inspectionDetail.html"),
        search: resolve(__dirname, "search.html"),
        hives: resolve(__dirname, "hives/index.html"),
        manageHive: resolve(__dirname, "hives/manage.html"),
        endOfInspection: resolve(__dirname, "end.html")
      },
    },
  },
  plugins: [VitePWA({
    registerType: "autoUpdate",
      injectRegister: "auto",

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Buzznote',
      short_name: 'buzznote',
      description: '',
      theme_color: '#f2a007',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      ignoreURLParametersMatching: [/^year$/, /^inspectionId$/, /^sentFrom$/, /^hiveId$/, /^utm_/, /^fbclid$/],
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})
