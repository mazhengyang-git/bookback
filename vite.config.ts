import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  // 路径别名（@ = src目录）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 跨域代理（对接毕设后端Node.js接口）
  server: {
    port: 3000,
    host: true,
    hmr: { protocol: 'ws', clientPort: 3000, timeout: 360000, overlay: false },
    watch: { usePolling: false, ignored: ['**/node_modules/**', '**/.git/**'] },

    headers: { 'Cache-Control': 'no-store' },
    proxy: {
      '/api': {
        target: 'http://localhost:3002', // 后端接口地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
