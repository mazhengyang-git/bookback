<template>
  <div class="monthly-hot-books">
    <!-- 模块标题 -->
    <h2 class="section-title">每月热门图书榜</h2>

    <!-- 加载中 -->
   <!--@vue-ignore--> <div v-if="bookStore?.loading" class="loading-tip">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空数据兜底 -->
    <div v-else-if="!finalBooks.length" class="empty-tip">
      <el-empty description="暂无榜单数据" />
    </div>

    <!-- 榜单列表 -->
    <div v-else class="hot-books-list">
      <div
        v-for="(book, index) in finalBooks"
        :key="book.id"
        class="book-item"
        @click="go(`/book/${book.id}`)"
      >
        <!-- 排名序号 -->
        <span class="rank" :class="{ 'top-three': index < 3 }">{{ book.rank }}</span>

        <!-- 图书封面 -->
       <!--@vue-ignore--> <img
          :src="book.cover || '/img/default-book.jpg'"
          referrerpolicy="no-referrer"
          alt="图书封面"
          class="book-cover"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />

        <!-- 图书信息 -->
        <div class="book-info">
          <h3 class="book-name">{{ book.name || '未知图书' }}</h3>
          <p class="book-author">作者：{{ book.author || '未知作者' }}</p>
          <p class="book-price">¥{{ formatPrice(book.price) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElEmpty, ElSkeleton } from 'element-plus'
import { useBookStore } from '@/store/book'
import type { Book } from '@/types/index'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { getSystemConfig } from '@/api/back/config'

const router = useRouter()
const route = useRoute()
const bookStore = useBookStore()

// 置顶图书ID 
const topBookIds = ref<(number | string)[]>([])
const configLoading = ref(true)

const loadTopBookIds = async () => {
  try {
    const res = await getSystemConfig('home_top_book_ids')
    //@ts-ignore
    if (res.code === 200 && res.data) {
      //@ts-ignore
      topBookIds.value = res.data.config_value || [1, 3, 5, 7, 8]
    }
  } catch (error) {
    console.error('加载排行榜配置失败，使用默认值')
    topBookIds.value = [1, 3, 5, 7, 8]
  } finally {
    configLoading.value = false
  }
}

export interface MonthlyHotBookItem extends Book {
  rank: number
  [key: string]: any
}

const props = defineProps<{
  books?: MonthlyHotBookItem[]
  topIds?: (number | string)[]
}>()

const emit = defineEmits<{
  click: [book: MonthlyHotBookItem]
}>()

const defaultBooks: MonthlyHotBookItem[] = [
  {
    id: 21,
    rank: 1,
    name: '三体',
    author: '刘慈欣',
    price: 99.0,
    category: '',
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 22,
    rank: 2,
    name: '流浪地球',
    author: '刘慈欣',
    price: 45.0,
    category: '',
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 23,
    rank: 3,
    name: '北京折叠',
    author: '郝景芳',
    price: 35.0,
    category: '',
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 24,
    rank: 4,
    name: '深渊上的火',
    author: '弗诺·文奇',
    price: 58.0,
    category: '',
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 25,
    rank: 5,
    name: '星船伞兵',
    author: '罗伯特·海因莱因',
    price: 42.0,
    category: '',
    cover: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
]

const finalTopIds = computed(() => (props.topIds?.length ? props.topIds : topBookIds.value))

const storeBooks = computed<MonthlyHotBookItem[]>(() => {
  if (!bookStore?.bookList?.length) return []

  const allBooks = JSON.parse(JSON.stringify(bookStore.bookList)) as Book[]
  const topBooks: MonthlyHotBookItem[] = []
  const topIdSet = new Set(finalTopIds.value.map((id) => String(id)))

  finalTopIds.value.forEach((topId, index) => {
    const strTopId = String(topId)
    const book = allBooks.find((b) => String(b.id) === strTopId)
    if (book) {
      topBooks.push({ ...book, rank: index + 1 })
    }
  })

  const remainingBooks = allBooks.filter((b) => !topIdSet.has(String(b.id)))
  const randomBooks: MonthlyHotBookItem[] = []
  if (remainingBooks.length > 0) {
    for (let i = remainingBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[remainingBooks[i], remainingBooks[j]] = [remainingBooks[j], remainingBooks[i]]
    }
  }
  remainingBooks.slice(0, Math.max(0, 5 - topBooks.length)).forEach((book, index) => {
    randomBooks.push({ ...book, rank: topBooks.length + index + 1 })
  })

  return [...topBooks, ...randomBooks]
})

const finalBooks = computed(() => {
  if (props.books?.length) return props.books
  if (storeBooks.value.length) return storeBooks.value
  return defaultBooks
})

const formatPrice = (price: unknown): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}


// 新书速递跳转逻辑

const go = (path: string) => {
  if (router.currentRoute.value.path.startsWith('/book/')) {
    router.replace(path)
    location.reload()
  } else {
    router.push(path)
  }
}

const chuyu = ref(false)

const loadData = async () => {
  await loadTopBookIds()
  if (!bookStore?.bookList?.length) {
    bookStore?.fetchBookList?.().catch(() => {})
  }
}

onMounted(() => {
  if (!chuyu.value) {
    requestIdleCallback(() => {
      import('@/views/front/book/detail.vue')
      console.log('排行榜预加载成功')
    })
    chuyu.value = true
  }
  loadData()
})

watch(
  () => route.path,
  () => {
    loadData()
  },
)
</script>
<style scoped>
.monthly-hot-books {
  width: 115%;
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;

  border-radius: clamp(8px, 1vw, 12px);
  box-sizing: border-box;
}

/* 标题样式 */
.section-title {
  text-align: center;
  font-size: clamp(21px, 2.5vw, 25px);
  font-weight: 600;
  color: #409eff;
  margin: 0 0 clamp(25px, 3vw, 30px);
  padding-bottom: clamp(8px, 1vw, 10px);
  position: relative;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(120px, 15vw, 150px);
  height: 2px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
}

/* 加载/空数据提示 */
.loading-tip,
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}

/* 榜单列表容器 */
.hot-books-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  width: 100%;
  max-width: 1200px;
  min-height: 300px;
  margin: 0 auto;
}

/* 单条图书卡片 */
.book-item {
  display: flex;
  align-items: center;
  gap: clamp(15px, 2vw, 20px);
  padding: clamp(15px, 2vw, 20px);
  background: #ffffff;
  border-radius: clamp(12px, 1.5vw, 16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.126);
  cursor: pointer;

  transition: all 0.3s ease;
  box-sizing: border-box;
}
.book-item:hover {
  transform: translateX(5px);
}

/* 排名数字 */
.rank {
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
  color: #999;
  min-width: clamp(40px, 4vw, 50px);
  text-align: center;
  line-height: 1;
  transition: color 0.3s;
}
/* 前三名高亮 */
.rank.top-three {
  color: #409eff;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

/* 图书封面样式 */
.book-cover {
  width: clamp(60px, 6vw, 80px);
  height: clamp(90px, 9vw, 120px);
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

/* 图书信息区域 */
.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 0.8vw, 8px);
}

.book-name {
  font-size: clamp(19px, 1.8vw, 23px);
  font-weight: 600;
  color: #333333;
  margin: 0;
}
.book-author {
  font-size: clamp(16px, 1.2vw, 17px);
  color: #666666;
  margin: 0;
}
.book-price {
  font-size: clamp(17px, 1.5vw, 19px);
  font-weight: 700;
  color: #e6a23c;
  margin: clamp(4px, 0.5vw, 6px) 0 0;
}
</style>

<style scoped>
.section-title {
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
  animation: titleGlow 2s infinite alternate;
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
  }
  100% {
    text-shadow: 0 0 15px rgba(64, 158, 255, 0.5);
  }
}

/* 卡片效果 */
.book-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.book-item:hover {
  transform: translateY(-3px) translateX(5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 排名效果 */
.rank {
  position: relative;
}

.rank.top-three::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.2) 0%, rgba(64, 158, 255, 0) 70%);
  border-radius: 50%;
}

/* 封面效果 */
.book-cover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.book-item:hover .book-cover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* 价格效果 */
.book-price {
  background: linear-gradient(90deg, #e6a23c, #fbbf24);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
