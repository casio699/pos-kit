import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        manualChunks: undefined,
      }
    },
  },

  // Base path for serving
  base: '/',

  // Development server
  server: {
    port: 1420,
    strictPort: true,
    fs: {
      strict: false
    }
  },

  // Preview server
  preview: {
    port: 1420,
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // CSS configuration
  css: {
    postcss: {
      plugins: [],
    },
  },

  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'lucide-react',
      'framer-motion',
      'sonner',
      'next-themes'
    ],
    force: true
  },
})
