<template>
  <div class="home-new-books">
    <div v-if="newBooks.length === 0" class="empty-tip">
      <el-empty description="暂无新书数据" />
    </div>
    <div v-else class="new-books-list">
      <h2 class="sci-fi-title">新书速递</h2>
      <br />
      <div
        v-for="book in newBooks"
        :key="book.id"
        class="new-book-item"
        @click="go(`/book/${book.id}?source=new`)"
        v-loading="!book.id"
      >
        <!-- 左侧封面图 -->
        <img
          :src="book.cover || '/img/default-book.jpg'"
          alt="图书封面"
          class="new-book-cover"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
        <!-- 右侧文字信息区域 完全对标参考图排版顺序 -->
        <div class="new-book-info">
          <!-- 1. 蓝色书名 -->
          <h3 class="new-book-name">{{ book.name || '未知图书' }}</h3>

          <!-- 2. 星级评分 + 分数 -->
          <div class="book-score">
            <el-rate v-model="book.avg_score" disabled max="5" size="small" color="#ffb400" />
            <span class="score-num">{{ book.avg_score || 0.0 }}</span>
          </div>

          <!-- 3. 作者信息 -->
          <p class="new-book-author">作者：{{ book.author || '未知作者' }}</p>

          <!-- 4. 分类标签 + 上榜标签 -->
          <div class="book-tags">
            <span class="tag category-tag">{{ book.category || '未分类' }}</span>
            <span v-if="book.up_month" class="tag month-tag">连续上榜{{ book.up_month }}个月</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, useRouter } from 'vue-router'
import type { newBook } from '@/types/index'
import { useBookStore1 } from '@/store/newbook'
const router1 = useRouter()
const newBooks = ref<newBook[]>([])
const slidesLoaded1 = ref(false)
const bookStore1 = useBookStore1()

const router = useRouter()
// 直接跳转，无需任何延迟，性能更好
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}
// 价格格式化
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}
// 随机抽取图书
const getRandomnewBooks = (list: newBook[], count: number = 6): newBook[] => {
  if (!list || list.length === 0) return []
  const tempList = JSON.parse(JSON.stringify(list)) as newBook[]
  const result: newBook[] = []
  for (let i = 0; i < count && tempList.length; i++) {
    const randomIndex = Math.floor(Math.random() * tempList.length)
    result.push(tempList.splice(randomIndex, 1)[0])
  }
  return result
}
const getNewBooks = async () => {
  try {
    await bookStore1.fetchBookList()
    const fullList = bookStore1.bookList1 || []
    newBooks.value = getRandomnewBooks(fullList, 6)
    slidesLoaded1.value = true
  } catch (error) {
    newBooks.value = []
    slidesLoaded1.value = true
  }
}

const chuyu = ref(false)
onMounted(() => {
  if (!chuyu.value) {
    requestIdleCallback(() => {
      //预加载页面
      import('@/views/front/book/detail.vue')

      console.log('新书速递预加载成功')
    })
    chuyu.value = true
  }
  const bookjiazai = async () => {
    await getNewBooks()
  }
  bookjiazai()
})
</script>

<style scoped>
/* 新书速递 外层容器 */
.home-new-books {
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
  width: 100%;
  height: auto;
  max-width: 1000px;

  flex-wrap: nowrap;
}

/* 标题样式 完全继承你全站统一的科幻标题动画 */
.sci-fi-title {
  text-align: center;
  left: 271px;
  font-size: 22px;
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

/* 书籍列表容器：【核心修改】纵向单列，从上到下垂直排列 */
.new-books-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  flex-direction: column;
  gap: 60px; /* 每一条图书上下之间的间距，和参考图完全对齐 */
  width: 800px;

  position: relative;
  transform: scale(0.8);
}

/* 单本书 整体条目：左侧封面 + 右侧文字 左右横向布局 */
.new-book-item {
  display: flex;
  align-items: center; /* 封面和文字整体垂直居中对齐 */
  gap: 24px; /* 封面与文字区域的间距，和参考图对齐 */
  padding: 12px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 454px;
  margin-left: 9px;
  background-color: #eeebeb5b;
}
/* 鼠标悬浮hover效果 */
.new-book-item:hover {
  background-color: #f7f9fc;
}

/* 左侧图书封面 尺寸完全对标参考图 */
.new-book-cover {
  width: 180px;
  height: 240px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  flex-shrink: 0; /* 固定封面尺寸，绝对不会被文字挤压变形 */
}

/* 右侧文字信息容器：内部元素从上到下严格按参考图顺序排布 */
.new-book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px; /* 每个文字模块之间的上下间距 */
}

/* 1. 书名 蓝色字体、字号加粗 完全对标参考图 */
.new-book-name {
  font-size: 24px;
  font-weight: 600;
  color: #2b78e4;
  margin: 0;
  line-height: 1.3;
}

/* 2. 星级评分 + 分数一行布局 */
.book-score {
  display: flex;
  align-items: center;
  gap: 10px;
}
.score-num {
  font-size: 18px;
  color: #ff9800;
  font-weight: 500;
}

/* 3. 作者信息 */
.new-book-author {
  font-size: 18px;
  color: #333;
  margin: 0;
}

/* 4. 标签行（分类+上榜标签，圆角白底标签样式） */
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

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}
</style>
