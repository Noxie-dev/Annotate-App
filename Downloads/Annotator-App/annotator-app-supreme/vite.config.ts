import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI Components - Radix UI
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],

          // PDF processing
          'pdf-vendor': ['pdfjs-dist', 'react-pdf'],

          // Canvas/Graphics
          'graphics-vendor': ['fabric'],

          // Animation
          'animation-vendor': ['framer-motion'],

          // Real-time collaboration
          'collaboration-vendor': ['yjs', 'y-websocket'],

          // WebRTC and communication
          'webrtc-vendor': ['webrtc-adapter', 'socket.io-client'],

          // Form handling
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Data fetching and state
          'data-vendor': ['@tanstack/react-query', 'zustand'],

          // User profile and authentication
          'profile-vendor': ['isomorphic-dompurify'],

          // Utilities and misc
          'utils-vendor': [
            'date-fns',
            'lucide-react',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'cmdk',
            'embla-carousel-react',
            'input-otp',
            'next-themes',
            'react-day-picker',
            'react-resizable-panels',
            'recharts',
            'sonner',
            'tailwindcss-animate',
            'vaul'
          ]
        }
      }
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000
  }
}))

