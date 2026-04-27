import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.BASE_PATH || "./",
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        game: resolve(__dirname, "game.html"),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/@pixi-spine") ||
            id.includes("node_modules/pixi-spine") ||
            id.includes("node_modules/@pixi") ||
            id.includes("node_modules/pixi.js")
          ) {
            return "pixi-vendor";
          }
        },
      },
    },
  },
});
