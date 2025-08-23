import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    })
  ],
  build: {
    minify: 'terser',
    target: 'es2022',
    sourcemap: false
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
});
