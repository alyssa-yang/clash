import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { build } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  plugins: [tsconfigPaths(), react()],
  css: {
    modules: {
      hashPrefix: 'prefix'
    },

    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    sourcemap: true
  }
})
