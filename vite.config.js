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
      input: pages
    }
  }
});