import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    cors: true,
    hmr: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2015', // Better mobile compatibility
    polyfillModulePreload: true,
  },
  preview: {
    host: true,
    port: 3000,
    cors: true,
  }
});