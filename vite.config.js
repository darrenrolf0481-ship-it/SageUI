import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',           // Required for Capacitor — relative paths
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined  // Single bundle for WebView performance
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
  }
});
