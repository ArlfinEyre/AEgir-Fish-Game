import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@pixi-spine") || id.includes("node_modules/pixi-spine")) {
            return "spine-vendor";
          }

          if (id.includes("node_modules/@pixi") || id.includes("node_modules/pixi.js")) {
            return "pixi-vendor";
          }
        },
      },
    },
  },
});
