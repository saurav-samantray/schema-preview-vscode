import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Specify the output directory
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.tsx'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    },
    minify: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['@stoplight/json-schema-merge-allof'],
  },
  resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },
});
