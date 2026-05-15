import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import fs from 'fs'
// 使用 axios 进行构建时的 API 请求（需要执行 npm install axios）
import axios from 'axios'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),

    // ==============================
    // 生产构建时：从后端 API 预取真实数据，写入 public/home-static.json
    // ==============================
    {
      name: 'build-preload-home-data',
      async buildStart() {
        // 仅在 production 构建时执行（开发环境跳过，走代理）
        if (process.env.NODE_ENV !== 'production') return

        console.log('🚀 构建时预加载首页数据...')

        // 后端 API 基础地址（构建时需确保后端服务可访问，或配置为线上地址）
        const apiBase = 'http://localhost:3002/api'

        // 定义默认空数据结构（防止请求失败时完全没数据）
        let staticData = {
          bookList: [],
          lunbo: [],
          notice: [],
          hotBooks: [],
          newBooks: []
        }

        try {
          // 1. 获取普通图书列表（用于热门图书）
          const bookRes = await axios.get(`${apiBase}/book/front/book/list`, {
            params: { category: '全部' },
            timeout: 8000
          })
          const bookList = bookRes.data?.data || []
          console.log(`📚 获取到普通图书 ${bookList.length} 本`)

          // 2. 获取新书列表（如果后端有 /front/newbook/list 接口）
          let newBooks: any[] = []
          try {
            const newBookRes = await axios.get(`${apiBase}/front/newbook/list`, {
              timeout: 8000
            })
            newBooks = newBookRes.data?.data || []
            console.log(`🆕 获取到新书 ${newBooks.length} 本`)
          } catch (newErr: any) {
            console.warn('⚠️ 新书接口请求失败（将使用空列表）:', newErr.message)
          }

          // 3. 可选：轮播图、公告等接口（根据实际后端调整，此处留空并提示）
          // 如果您后端有轮播图接口，可类似添加请求：
          // let lunbo = []
          // try { const lunboRes = await axios.get(`${apiBase}/banner/list`); lunbo = lunboRes.data?.data || [] } catch(e) {}

          // 组装最终静态数据
          staticData = {
            bookList: bookList,
            lunbo: [],           // 如需轮播图请自行扩展
            notice: [],          // 如需公告请自行扩展
            hotBooks: bookList.slice(0, 10),   // 取前10本作为热门推荐
            newBooks: newBooks.slice(0, 6)     // 取前6本作为新书展示
          }

          // 写入 public 目录（构建时会自动复制到 dist）
          const filePath = path.resolve(__dirname, 'public/home-static.json')
          fs.writeFileSync(filePath, JSON.stringify(staticData, null, 2))
          console.log(`✅ 首页静态数据预加载完成，写入文件: ${filePath}`)
          console.log(`   - 普通图书: ${bookList.length} 本，热门图书: ${staticData.hotBooks.length} 本`)
          console.log(`   - 新书: ${newBooks.length} 本，展示: ${staticData.newBooks.length} 本`)
        } catch (err: any) {
          // 请求失败时写入空数据，避免构建中断，同时打印错误方便排查
          console.error('❌ 预加载失败，将使用空数据（首页会走后端兜底）:', err.message)
          const emptyData = {
            bookList: [],
            lunbo: [],
            notice: [],
            hotBooks: [],
            newBooks: []
          }
          fs.writeFileSync(
            path.resolve(__dirname, 'public/home-static.json'),
            JSON.stringify(emptyData, null, 2)
          )
        }
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    host: true,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
       '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
    },
  },
})