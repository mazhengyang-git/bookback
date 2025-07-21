import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuesetup from 'vite-plugin-vue-setup-extend'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), vuesetup()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@img': fileURLToPath(new URL('./src/img', import.meta.url)),
    },
  },

  // 确保没有排除图片格式（默认已包含常见图片格式）
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.jpg'],
})
