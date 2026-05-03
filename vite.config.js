import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";

const pages = Object.fromEntries(
  globSync("src/**/index.html").map(file => {
    const name = file
      .replace(/^src\//, "")
      .replace(/\/index\.html$/, "") || "index";

    return [name, resolve(__dirname, file)];
  })
);

export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: "../dist", // Relative to root defined above ^
    emptyOutDir: true,
    rollupOptions: {
      input: pages,
      output: {
        assetFileNames: "assets/[hash][extname]",
        // Keep JS next to hashed assets so import.meta.url + relative PNG paths stay under /assets/.
        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
      },
    },
  }
});