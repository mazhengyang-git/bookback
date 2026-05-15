<template>
  <div class="editor-recommend-wrapper">
    <h2 class="sci-fi-title">编辑推荐</h2>
    <div v-loading="loading" class="skeleton-placeholder"><img v-loading="loading" class="skeleton-placeholder" style="width: 100%;height: 180px;margin-top: -20px;" src="../../../../public/img/bj.jfif" alt=""></div>

    <div v-if="!loading && recommendBooks.length === 0" class="empty-tip">
      <el-empty description="暂无推荐图书" />
    </div>

    <div v-else class="recommend-list">
      <div
        v-for="(book, index) in recommendBooks"
        :key="book.id"
        class="recommend-item"
        @click="go(`/book/${book.id}?source=editor`)"
      >
        <div class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
        <!--@vue-ignore--><img
          :src="book.cover || '/img/default-book.jpg'"
          alt="图书封面"
          class="recommend-cover"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
        <div class="recommend-info">
          <h3 style="font-weight: 600;" class="recommend-name">{{ book.name || '未知图书' }}</h3>
          <p style="font-weight: 600;" class="recommend-author">作者：{{ book.author || '未知作者' }}</p>
          <p style="font-weight: 550;font-size: 13px;" class="recommend-desc">{{ book.desc || '暂无简介' }}</p>
          <div class="recommend-meta">
            <span class="category-tag">{{ book.category || '未分类' }}</span>
            <span class="price-tag">¥{{ book.price || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/store/book'
import type { Book } from '@/types/index'

const router = useRouter()
const bookStore = useBookStore()
const loading = ref(true)
const recommendBooks = ref<Book[]>([])

// 随机抽取图书
function getRandomBooks(list: Book[], count: number = 3) {
  if (!list || list.length === 0) return []
  const arr = JSON.parse(JSON.stringify(list)) as Book[]
  const result: Book[] = []
  for (let i = 0; i < count && arr.length; i++) {
    const idx = Math.floor(Math.random() * arr.length)
    result.push(arr.splice(idx, 1)[0])
  }
  return result
}

// 获取推荐图书
const fetchRecommendBooks = async () => {
  loading.value = true
  try {
    await bookStore.fetchBookList()
    recommendBooks.value = getRandomBooks(bookStore.bookList as Book[], 3)
  } catch (error) {
    console.error('获取推荐图书失败:', error)
    recommendBooks.value = []
  } finally {
    loading.value = false
  }
}

const go = (path: string) => {
  const pathStr = path as string
  if (router.currentRoute.value.path.startsWith('/book/')) {
    window.location.href = pathStr
  } else {
    router.push(path)
  }
}

onMounted(() => {
  fetchRecommendBooks()
})
</script>

<style scoped>
.editor-recommend-wrapper {
  width: 100%;
  max-width: 800px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  top:-2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  font-size: 25px;
  font-weight: 600;
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 20px rgba(237, 254, 2, 0.4);
  animation: titlePulse 2s infinite alternate;
}

@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(236, 218, 218, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(120, 121, 121, 0.768);
  }
}

.skeleton-placeholder {
  min-height: 150px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.recommend-item:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(64, 158, 255, 0.2);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateX(4px);
}

.rank-num {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  z-index: 1;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.recommend-item:not(.rank-1):not(.rank-2):not(.rank-3) .rank-num {
  background: linear-gradient(135deg, #909399 0%, #73767a 100%);
}

.recommend-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-left: 24px;
  margin-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-author {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
}

.recommend-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.recommend-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 4px;
}

.price-tag {
  font-size: 13px;
  color: #f56c6c;
  font-weight: 600;
}
</style>
