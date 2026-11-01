import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  // Relative asset paths work on GitHub Pages project sites (/REPO/) and subfolders.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': projectRoot },
  },
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
