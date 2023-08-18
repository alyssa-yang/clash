import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { build } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://clash-server.echoyore.tech'
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
    polyfillModulePreload: true, // 是否自动注入 module preload 的 polyfill
    outDir: 'dist', // 指定输出路径
    assetsDir: 'assets', // 指定生成静态文件目录
    sourcemap: true // 构建后是否生成 source map 文件
  }
})
