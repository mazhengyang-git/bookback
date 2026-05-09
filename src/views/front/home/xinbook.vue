<template>
  <div class="new-book-wrapper">
    <div class="home-new-books">
      <div v-loading="loading" class="skeleton-placeholder"></div>

      <div v-if="!loading && finalRandomBooks.length === 0" class="empty-tip">
        <el-empty description="暂无新书数据" />
      </div>

      <div v-else class="new-books-list">
        <h2 class="sci-fi-title">新书速递</h2>
        <br />

        <!-- 图书列表 -->
        <div
          v-for="book in currentPageBooks"
          :key="book.id"
          class="new-book-item"
          @click="go(`/book/${book.id}?source=new`)"
        >
          <img
            :src="book.cover || '/img/default-book.jpg'"
            alt="图书封面"
            class="new-book-cover"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <div class="new-book-info">
            <h3 class="new-book-name">{{ book.name || '未知图书' }}</h3>
            <div class="book-score">
              <el-rate v-model="book.avg_score" disabled max="5" size="small" color="#ffb400" />
              <span class="score-num">{{ book.avg_score || 0.0 }}</span>
            </div>
            <p class="new-book-author">作者：{{ book.author || '未知作者' }}</p>
            <div class="book-tags">
              <span class="tag category-tag">{{ book.category || '未分类' }}</span>
              <span v-if="book.up_month" class="tag month-tag"
                >连续上榜{{ book.up_month }}个月</span
              >
            </div>
          </div>
        </div>

        <!-- 分页：改成你要的 <上一页 1 2 3 下一页> 样式 -->
        <div class="pagination-box">
          <button @click="prevPage" :disabled="currentPage === 1" class="page-btn text-btn">
            上一页
          </button>

          <template v-for="p in 3" :key="p">
            <button
              @click="goToPage(p)"
              :class="{ active: currentPage === p }"
              class="page-btn num-btn"
            >
              {{ p }}
            </button>
          </template>

          <button @click="nextPage" :disabled="currentPage === 3" class="page-btn text-btn">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { newBook } from '@/types/index'
import { useBookStore1 } from '@/store/newbook'

const router = useRouter()
const loading = ref(true)
const bookStore1 = useBookStore1()

// 分页
const currentPage = ref(1)
const finalRandomBooks = ref<newBook[]>([])

// 每页4本，共3页 = 12本
const currentPageBooks = computed(() => {
  const start = (currentPage.value - 1) * 4
  return finalRandomBooks.value.slice(start, start + 4)
})

// 跳转
const go = (path: string) => {
  if (router.currentRoute.value.path.startsWith('/book/')) {
    router.replace(path)
    location.reload()
  } else {
    router.push(path)
  }
}

// 随机取12本不重复
function getRandomUnique(list: newBook[], count: number): newBook[] {
  const copy = [...list]
  const result: newBook[] = []
  const need = Math.min(count, copy.length)
  for (let i = 0; i < need; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

// 翻页逻辑
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < 3) currentPage.value++
}
const goToPage = (p: number) => {
  currentPage.value = p
}

// 获取数据
const getNewBooks = async () => {
  try {
    await bookStore1.fetchBookList()
    const all = bookStore1.bookList1 || []
    finalRandomBooks.value = getRandomUnique(all, 12)
  } catch (e) {
    finalRandomBooks.value = []
  } finally {
    loading.value = false
  }
}

const chuyu = ref(false)
onMounted(() => {
  if (!chuyu.value) {
    requestIdleCallback(() => import('@/views/front/book/detail.vue'))
    chuyu.value = true
  }
  getNewBooks()
})
</script>

<style scoped>
.new-book-wrapper {
  width: 1000px;
  max-width: 1000px;
  padding-bottom: 800px;
  position: relative;
  margin: 30px 0;
  margin-left: 80px;
}

.skeleton-placeholder {
  width: 100%;
  height: 800px;
}

.home-new-books {
  position: relative;
  top: 0;
  left: 0;
  width: 1000px;
 
  transform: scale(0.8);
  transform-origin: top left;
}

.sci-fi-title {
  text-align: center;
  position: relative;
  font-size: 22px;
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 20px rgba(237, 254, 2, 0.4);
  animation: titlePulse 2s infinite alternate;
  margin-bottom: 20px;
  left: 259px;
}
@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(236, 218, 218, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(120, 121, 121, 0.768);
  }
}

.new-books-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px;
  width: 1000px;
  margin: 0 auto;
  position: relative;
}

.new-book-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 454px;
  background-color: #eeebeb5b;
}
.new-book-item:hover {
  background-color: #f7f9fc;
}

.new-book-cover {
  width: 180px;
  height: 240px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.new-book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.new-book-name {
  font-size: 24px;
  font-weight: 600;
  color: #2b78e4;
  margin: 0;
  line-height: 1.3;
}

.book-score {
  display: flex;
  align-items: center;
  gap: 10px;
}
.score-num {
  font-size: 18px;
  color: #ff9800;
  font-weight: 50;
}

.new-book-author {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.book-tags {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.tag {
  padding: 6px 18px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
}

.empty-tip {
  text-align: center;
  padding: 60px 0;
}

/* 分页样式：上一页 + 1/2/3 + 下一页 */
.pagination-box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
 top:750px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}
.page-btn {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 上一页/下一页按钮 */
.page-btn.text-btn {
  background: transparent;
  color: #666;
  font-size: 18px;
  font-weight: bolder;
  padding: 0 8px;
}
.page-btn.text-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}
/* 数字按钮 */
.page-btn.num-btn {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #fff;
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid #409eff;
}
.page-btn.num-btn.active {
  background: #409eff;
  color: #fff;
}
</style>
