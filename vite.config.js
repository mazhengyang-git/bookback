import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动导入（保留不动）
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),

    // ==============================
    // 【优化版】生产构建预加载数据
    // 👉 开发环境完全不加载，彻底减轻Windsurf负担
    // ==============================
    ...(process.env.NODE_ENV === 'production'
      ? [
          {
            name: 'build-preload-home-data',
            async buildStart() {
              console.log('🚀 构建时预加载首页数据...');
              const apiBase = 'http://localhost:3002/api';
              let staticData = { bookList: [], lunbo: [], notice: [], hotBooks: [], newBooks: [] };

              try {
                // 图书列表
                const bookRes = await axios.get(`${apiBase}/book/front/book/list`, {
                  params: { category: '全部' },
                  timeout: 8000
                });
                const bookList = bookRes.data?.data || [];

                // 新书列表
                let newBooks = [];
                try {
                  const newBookRes = await axios.get(`${apiBase}/front/newbook/list`, { timeout: 8000 });
                  newBooks = newBookRes.data?.data || [];
                } catch (newErr) {
                  console.warn('⚠️ 新书接口请求失败:', newErr.message);
                }

                // 写入数据
                staticData = {
                  bookList,
                  lunbo: [],
                  notice: [],
                  hotBooks: bookList.slice(0, 10),
                  newBooks: newBooks.slice(0, 6)
                };

                const filePath = path.resolve(__dirname, 'public/home-static.json');
                fs.writeFileSync(filePath, JSON.stringify(staticData, null, 2));
                console.log('✅ 首页静态数据生成完成');
              } catch (err) {
                console.error('❌ 预加载失败，使用空数据:', err.message);
                const emptyData = { bookList: [], lunbo: [], notice: [], hotBooks: [], newBooks: [] };
                fs.writeFileSync(path.resolve(__dirname, 'public/home-static.json'), JSON.stringify(emptyData, null, 2));
              }
            },
          },
        ]
      : []), // 👈 开发环境直接不加载这个插件，大幅减轻IDE压力
  ],

  resolve: { alias: { '@': path.resolve(__dirname, './src') } },

  // ==============================
  // 【关键！根治Windsurf崩溃】
  // 优化热更新 + 关闭耗性能功能
  // ==============================
  server: {
    port: 3000,
    host: true,
    // 🔥 核心：优化HMR热更新，防止内存爆炸
    hmr: {
      overlay: false, // 关闭页面报错遮罩（减少DOM渲染，不卡IDE）
    },
    // 🔥 忽略大量文件监听，Vite不扫无用文件，IDE瞬间流畅
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/public/**',
        '**/*.json',
        '**/.git/**'
      ]
    },
    // 代理（保留不动）
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },

  // ==============================
  // 【构建优化】防止打包时崩溃
  // ==============================
  build: {
    chunkSizeWarningLimit: 1500, // 关闭大包警告
    minify: 'esbuild', // 极速压缩
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'], // 拆分大组件包
        }
      }
    }
  },
});