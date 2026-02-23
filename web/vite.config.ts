import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2022',
    // WASM support – Vite handles .wasm files with ?init or ?url imports
    assetsInlineLimit: 0,
  },
  server: {
    port: 3001,
    // Allow .wasm MIME type
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
