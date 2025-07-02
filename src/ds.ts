import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 关键：让 @ 指向项目根目录（根据你实际结构调整，若 img 在根目录，就这么配）
      '@': '/',
    },
  },
})
