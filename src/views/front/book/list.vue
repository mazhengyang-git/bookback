<template>
  <!-- 和商城一样的平滑加载控制 → 已删除黑遮罩 -->

  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo1 sci-fi-title1">星途科幻图书</h2>
    </div>
    <div class="nav-center1">
      <div class="sejb">
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        </div>
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/huodong')">活动资讯</el-button>
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <div v-if="!userStore.isLogin">
        <el-button
          style="color: black; font-weight: 600; font-size: 20px"
          type="primary"
          link
          @click="$router.push('/login')"
          >登录</el-button
        >
        <el-button
          style="color: black; font-weight: 600; font-size: 20px"
          type="primary"
          link
          @click="$router.push('/register')"
          >注册</el-button
        >
      </div>
      <div v-else class="login-bar">
        <span
          class="welcome-text"
          style="
            user-select: none !important;
            -webkit-user-select: none !important;

            font-size: 24px;
            position: relative;
            left: 10px;
          "
          >欢迎：{{ userStore.user?.username }}</span
        >
        <el-button style="font-size: 17px; color: black" link @click="$router.push('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button style="font-size: 17px; color: red" link @click="$router.push('/cart')"
          ><img
            class="gwdh"
            style="width: 26px; height: auto; margin-right: 3px"
            src="/img/购物车.png"
          />购物车</el-button
        >
        <el-button
          style="color: white; background-color: red; position: relative; font-size: 15px"
          type="danger"
          link
          @click="handleLogout"
          >退出</el-button
        >
      </div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="filter-main">
      <el-select
        v-model="selectedCategory"
        placeholder="请选择分类"
        class="filter-control"
        @change="doFilterAndShuffle"
      >
        <el-option label="全部类别" value="全部" />
        <el-option label="太空歌剧" value="太空歌剧" />
        <el-option label="赛博朋克" value="赛博朋克" />
        <el-option label="时间旅行" value="时间旅行" />
        <el-option label="智能纪元" value="智能纪元" />
        <el-option label="外星文明" value="外星文明" />
        <el-option label="末世废土" value="末世废土" />
        <el-option label="星际灾厄" value="星际灾厄" />
        <el-option label="虚幻惊悚" value="虚幻惊悚" />
        <el-option label="星系攻略" value="星系攻略" />
        <el-option label="次元交互" value="次元交互" />
        <el-option label="梦灵空间" value="梦灵空间" />
        <el-option label="自然谜团" value="自然谜团" />
        <el-option label="平行宇宙" value="平行宇宙" />
        <el-option label="意识陷落" value="意识陷落" />
      </el-select>

      <el-select
        v-model="selectedAAuthor"
        placeholder="请选择作者"
        class="filter-control"
        @change="doFilterAndShuffle"
        popper-append-to-body
      >
        <el-option label="全部作者" value="全部" />
        <el-option label="刘慈欣" value="刘慈欣" />
        <el-option label="[美]艾萨克·阿西莫夫" value="[美]艾萨克·阿西莫夫" />
        <el-option label="[波]斯坦尼斯瓦夫·莱姆" value="[波]斯坦尼斯瓦夫·莱姆" />
        <el-option label="[美]安迪.威尔" value="[美]安迪.威尔" />
        <el-option label="[美]特德·姜" value="[美]特德·姜" />
        <el-option label="[韩]金草叶" value="[韩]金草叶" />
      </el-select>

      <el-input
        v-model="authorSearch"
        placeholder="按作者搜索"
        class="filter-control"
        @keyup.enter="doFilterAndShuffle"
        @clear="doFilterAndShuffle"
        clearable
      />

      <el-input
        v-model="searchKeyword"
        placeholder="按图书名称搜索（如：三体）"
        class="filter-control"
        @keyup.enter="handleSearch"
        @clear="handleClearSearch"
        clearable
      >
        <template #suffix>
          <el-icon class="search-icon" @click="handleSearch">
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <div class="filter-bottom">
      <div class="price-refresh">
        <div class="price-filter">
          <el-input
            v-model.number="minPrice"
            type="number"
            placeholder="最低价"
            style="width: 110px"
            @input="doFilterAndShuffle"
            @clear="handlePriceClear"
            clearable
            min="0"
          />
          <span class="price-divider">-</span>
          <el-input
            v-model.number="maxPrice"
            type="number"
            placeholder="最高价"
            style="width: 110px"
            @input="doFilterAndShuffle"
            @clear="handlePriceClear"
            clearable
            min="0"
          />
        </div>
        <el-button
          class="lx refresh-btn"
          type="primary"
          :class="{ refreshing: isRefreshing }"
          @click="refreshAllData"
          >刷新列表</el-button
        >
      </div>

      <div class="tag-filter">
        <span class="tag-label">我的分类：</span>
        <el-checkbox-group v-model="selectedTags" @change="doFilterAndShuffle">
          <el-checkbox v-for="tag in availableTags" :key="tag" :label="tag">{{ tag }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="sort-btns">
      <span class="sort-btn" :class="{ active: showType === 'normal' }" @click="showNormalBooks"
        >默认图书</span
      >
      <span class="sort-btn" :class="{ active: showType === 'new' }" @click="showNewBooks"
        >新书速览</span
      >
      <span
        class="sort-btn"
        :class="{ active: sortBy === 'price' && currentSortDirection === 'asc' }"
        @click="handleSort('asc')"
        >价格从低到高</span
      >
      <span
        class="sort-btn"
        :class="{ active: sortBy === 'price' && currentSortDirection === 'desc' }"
        @click="handleSort('desc')"
        >价格从高到低</span
      >
      <span class="sort-btn" :class="{ active: sortBy === 'rating' }" @click="handleRatingSort"
        >评分最高</span
      >
    </div>
  </div>

  <!-- 图书列表区域 -->
  <div v-if="!loading" class="book-list-container">
    <div class="book-card-list">
      <el-card v-for="book in showBooks" :key="book.id" class="book-card">
        <div class="book-card-content">
          <img
            :src="book.cover || '/img/default-book.jpg'"
            referrerpolicy="no-referrer"
            alt="图书封面"
            class="book-cover"
            @click="handleBookClick(book)"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <div class="book-info">
            <h3 class="book-name">{{ book.name || '未知图书' }}</h3>
            <p class="book-author">作者：{{ book.author || '未知作者' }}</p>
            <p class="book-category">分类：{{ book.category || '未知分类' }}</p>
            <p class="book-price">¥{{ formatPrice(book.price) }}</p>
            <p class="book-desc">简介：{{ book.desc || '暂无简介' }}</p>
            <el-button
              type="primary"
              size="large"
              class="add-cart-btn"
              @click.stop="handleBookClick(book)"
            >
              查看详情
            </el-button>
          </div>
        </div>
        <!--  v-if 防止列表渲染时星星闪烁 -->
        <div style="position: absolute; left: 646px; top: 10px; width: 86%">
          <bookping v-if="book.id != null" :book-id="book.id" />
        </div>
      </el-card>
    </div>

    <div v-if="showBooks.length === 0" class="empty-tip">
      {{
        searchKeyword
          ? `未找到含「${searchKeyword}」的${selectedCategory === '全部' ? '' : selectedCategory + ' '}图书`
          : '暂无图书数据 😕'
      }}
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else class="loading-tip">加载中...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import bookping from '@/views/front/book/抽离评价.vue'
import { useBookStore1 } from '@/store/newbook'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const bookStore1 = useBookStore1()

// 图书点击 —— 极速跳转
const handleBookClick = (book: Book) => {
  const path = `/book/${book.id}?source=${showType.value}`
  if (router.currentRoute.value.path.startsWith('/book/')) {
    router.replace(path)
    location.reload()
  } else {
    router.push(path)
  }
}

// 加载状态（和详情页完全一致）
const loading = ref(true)

const paixu = ref('')
const sortBy = ref<'price' | 'rating' | ''>('')
const currentSortDirection = ref<'asc' | 'desc'>('asc')
const selectedAAuthor = ref('全部')
const authorSearch = ref('')
const selectedTags = ref<string[]>([])
const availableTags = ref<string[]>([
  '太空歌剧',
  '赛博朋克',
  '时间旅行',
  '智能纪元',
  '外星文明',
  '自然谜团',
])
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const selectedCategory = ref('全部')
const searchKeyword = ref('')
const allBooks = ref<Book[]>([])
const newBookList = ref<Book[]>([])
const filteredBooks = ref<Book[]>([])
const showBooks = ref<Book[]>([])
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const showType = ref('normal')
const shouldShufflePage = ref(false)
const hasRandomizedInitialPage = ref(false)
const defaultListSnapshot = ref<{
  filteredBooks: Book[]
  showBooks: Book[]
  currentPage: number
} | null>(null)

const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}

const normalizePrice = (value: any): number | null => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const getBookAvgScore = (book: Book) =>
  Number((book as any).avg_score ?? (book as any).avgScore ?? 0)

const restoreDefaultSnapshot = (): boolean => {
  if (!defaultListSnapshot.value) return false
  filteredBooks.value = [...defaultListSnapshot.value.filteredBooks]
  showBooks.value = [...defaultListSnapshot.value.showBooks]
  currentPage.value = defaultListSnapshot.value.currentPage
  total.value = filteredBooks.value.length
  shouldShufflePage.value = false
  return true
}

const isDefaultFilterState = () => {
  const keyword = searchKeyword.value.trim()
  const sanitizedMinPrice = normalizePrice(minPrice.value)
  const sanitizedMaxPrice = normalizePrice(maxPrice.value)
  return (
    selectedCategory.value === '全部' &&
    selectedAAuthor.value === '全部' &&
    !authorSearch.value &&
    !keyword &&
    selectedTags.value.length === 0 &&
    sanitizedMinPrice === null &&
    sanitizedMaxPrice === null &&
    !sortBy.value
  )
}

const handlePriceClear = () => {
  if (!Number.isFinite(minPrice.value as number)) {
    minPrice.value = null
  }
  if (!Number.isFinite(maxPrice.value as number)) {
    maxPrice.value = null
  }
  currentPage.value = 1
  if (isDefaultFilterState() && restoreDefaultSnapshot()) {
    return
  }
  doFilterAndShuffle()
}

// 排序切换
const handleSort = (type: 'asc' | 'desc') => {
  if (sortBy.value === 'price' && currentSortDirection.value === type) {
    sortBy.value = ''
    paixu.value = ''
    shouldShufflePage.value = true
  } else {
    sortBy.value = 'price'
    currentSortDirection.value = type
    paixu.value = type
  }
  currentPage.value = 1
  doFilterAndShuffle()
}

// 评分排序
const handleRatingSort = () => {
  if (sortBy.value === 'rating') {
    sortBy.value = ''
    shouldShufflePage.value = true
  } else {
    sortBy.value = 'rating'
  }
  paixu.value = ''
  currentPage.value = 1
  doFilterAndShuffle()
}

// 切换默认图书
const showNormalBooks = () => {
  showType.value = 'normal'
  paixu.value = ''
  if (!sortBy.value) {
    shouldShufflePage.value = true
  }
  doFilterAndShuffle()
}

// 切换新书速览
const showNewBooks = () => {
  showType.value = 'new'
  paixu.value = ''
  if (!sortBy.value) {
    shouldShufflePage.value = true
  }
  doFilterAndShuffle()
}

const isRefreshing = ref(false)

const refreshAllData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true

  try {
    currentPage.value = 1
    defaultListSnapshot.value = null
    shouldShufflePage.value = true

    await Promise.all([loadBookList(false), loadNewBookList()])
    doFilterAndShuffle()
    ElMessage.success({ message: '刷新成功！', offset: 80 })
  } catch (err) {
    ElMessage.error({ message: '刷新失败', offset: 80 })
  } finally {
    isRefreshing.value = false
  }
}

// 加载普通图书
const loadBookList = async (showMask = true) => {
  try {
    const res = await getBookListApi('全部')
    allBooks.value = res.code === 200 ? res.data || [] : []
  } catch (error) {
    allBooks.value = []
  }
}

// 加载新书
const loadNewBookList = async () => {
  try {
    await bookStore1.fetchBookList()
    newBookList.value = bookStore1.bookList1 || []
  } catch (error) {
    newBookList.value = []
  }
}

// 筛选+排序+分页
const doFilterAndShuffle = () => {
  const sourceList = showType.value === 'new' ? [...newBookList.value] : [...allBooks.value]
  const keyword = searchKeyword.value.trim().toLowerCase()

  const filtered = sourceList.filter((book) => {
    const matchName = keyword ? book.name?.toLowerCase().includes(keyword) : true
    const matchCategory =
      selectedCategory.value === '全部' || book.category === selectedCategory.value
    const matchAAuthor = selectedAAuthor.value === '全部' || book.author === selectedAAuthor.value
    const matchAuthorSearch = authorSearch.value
      ? book.author?.toLowerCase().includes(authorSearch.value.trim().toLowerCase())
      : true
    const matchTags =
      selectedTags.value.length === 0 || selectedTags.value.includes(book.category || '')
    const bookPrice = Number(book.price) || 0
    const sanitizedMinPrice = normalizePrice(minPrice.value)
    const sanitizedMaxPrice = normalizePrice(maxPrice.value)
    const matchMinPrice = sanitizedMinPrice === null || bookPrice >= sanitizedMinPrice
    const matchMaxPrice = sanitizedMaxPrice === null || bookPrice <= sanitizedMaxPrice
    return (
      matchName &&
      matchCategory &&
      matchAAuthor &&
      matchAuthorSearch &&
      matchTags &&
      matchMinPrice &&
      matchMaxPrice
    )
  })

  if (isDefaultFilterState() && defaultListSnapshot.value && !shouldShufflePage.value) {
    restoreDefaultSnapshot()
    return
  }

  filteredBooks.value = shouldShufflePage.value
    ? [...filtered].sort(() => Math.random() - 0.5)
    : filtered
  total.value = filteredBooks.value.length
  doPaginationSlice()
  shouldShufflePage.value = false
}

// 分页切片
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  let pageItems = filteredBooks.value.slice(start, start + pageSize.value)

  if (sortBy.value === 'rating') {
    pageItems.sort((a, b) => getBookAvgScore(b) - getBookAvgScore(a))
  } else if (sortBy.value === 'price') {
    if (currentSortDirection.value === 'asc') {
      pageItems.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else {
      pageItems.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }
  }

  showBooks.value = pageItems

  if (isDefaultFilterState()) {
    defaultListSnapshot.value = {
      filteredBooks: [...filteredBooks.value],
      showBooks: [...showBooks.value],
      currentPage: currentPage.value,
    }
  }
}

const handleSearch = () => {
  currentPage.value = 1
  if (!sortBy.value && !isDefaultFilterState()) {
    shouldShufflePage.value = true
  }
  doFilterAndShuffle()
}

const handlePageChange = () => doPaginationSlice()

const handleClearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  if (isDefaultFilterState() && restoreDefaultSnapshot()) return
  doFilterAndShuffle()
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 初始化加载（和详情页完全统一）
onMounted(async () => {
  loading.value = true

  await Promise.all([loadBookList(), loadNewBookList()])

  const cat = route.query.category as string
  const keyword = route.query.keyword as string
  const aauthor = route.query.aauthor as string

  if (cat) selectedCategory.value = cat
  if (keyword) searchKeyword.value = keyword
  if (aauthor) selectedAAuthor.value = aauthor

  if (!hasRandomizedInitialPage.value) {
    shouldShufflePage.value = true
    hasRandomizedInitialPage.value = true
  }

  doFilterAndShuffle()

  loading.value = false
})

// 监听路由
watch(
  () => route.query,
  (newQuery) => {
    selectedCategory.value = (newQuery.category as string) || '全部'
    selectedAAuthor.value = (newQuery.aauthor as string) || '全部'
    searchKeyword.value = (newQuery.keyword as string) || ''
    doFilterAndShuffle()
  },
  { deep: true },
)

// 监听筛选
watch(
  [
    selectedCategory,
    selectedAAuthor,
    authorSearch,
    searchKeyword,
    selectedTags,
    minPrice,
    maxPrice,
  ],
  () => {
    if (!sortBy.value && !isDefaultFilterState()) {
      shouldShufflePage.value = true
    }
    doFilterAndShuffle()
  },
)

// 预加载保留
const chuyu = ref(false)
onMounted(() => {
  if (!chuyu.value) {
    requestIdleCallback(() => {
      import('@/views/front/book/detail.vue')
      import('@/views/front/user/index.vue')
      import('@/views/front/cart/index.vue')
      console.log('图书商城页预加载成功')
    })
    chuyu.value = true
  }
})
</script>

<style scoped>
.gwdh {
  animation: gwdh 2s infinite;
}
@keyframes gwdh {
  0%,
  100% {
    transform: scale(1) rotate3d(0, 0, 0, 0deg);
  }
  25% {
    transform: scale(1.1) rotate3d(0, 1, 0, 10deg);
  }
  50% {
    transform: scale(1.1) rotate3d(0, 1, 1, 12deg);
  }
  75% {
    transform: scale(1.1) rotate3d(0, 1, 0, 10deg);
  }
}
/*基础响应式配置*/
:root {
  font-size: 16px;
}
/* 简介：2行显示 + 末尾省略号 */
.book-desc {
  user-select: none !important;
  -webkit-user-select: none !important;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: #666;
  margin-bottom: 0.5rem;

  /* 核心：2行省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  line-height: 1.4;
  max-height: 2.8em;
}

/* 顶部导航栏 */
.home-top-nav {
  width: 100%;
  height: 3.75rem;
  opacity: 0.9;
  background: linear-gradient(
    180deg,
    rgba(215, 213, 213, 0.98) 0%,
    rgba(160, 158, 158, 0.612) 50%,
    rgba(215, 213, 213, 0.98) 100%
  );
  border-bottom: 1px solid rgba(5, 44, 84, 0.3);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 999 !important;
  @media (max-width: 768px) {
    height: auto;
    flex-wrap: wrap;
    padding: 0.625rem;
  }
}

.sejb {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  left: -9px;
  flex-direction: column;
  align-items: center;
  z-index: 9996 !important;
}

/* 子菜单容器 */
.acwy {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0px;
  z-index: 9996 !important;
}

/* 子菜单按钮 */
.ac1,
.ac2 {
  width: clamp(101px, 10vw, 109px) !important;
  padding: 9px 20px !important;
  height: auto !important;
  text-align: center;
  box-sizing: border-box;
  border-radius: 0;
  z-index: 9996 !important;
}
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  position: relative;
  left: 6px;
}
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px;
  position: relative;
  left: -5.95px;
}

.nav-left {
  width: 13.75rem;
  flex-shrink: 0;
  text-align: left;
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    margin-bottom: 0.625rem;
  }
}

.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  white-space: nowrap;
  line-height: 3.75rem;
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    line-height: 2.5rem;
  }
}

.nav-center1 {
  display: flex;
  gap: 1.5625rem;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: fit-content;
  position: relative;
  left: 6.1%;
  @media (max-width: 768px) {
    width: 100%;
    left: 0;
    gap: 0.9375rem;
    margin-bottom: 0.625rem;
  }
}

.nav-right1 {
  width: 23.75rem;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #ffffff;
  gap: 0.75rem;
  white-space: nowrap;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 0.625rem;
  }
}

.login-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
}

.login-bar span {
  white-space: nowrap;
  font-size: clamp(1rem, 2vw, 1.125rem);
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.syws {
  display: flex;
  background: #ffffff;
  border: 1px solid rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  border-radius: 0.375rem;
  padding: 0.375rem 0.875rem;
  align-items: center;
  justify-content: center;
}

.syses {
  color: rgb(0, 0, 0);
  font-size: clamp(1rem, 2vw, 1.125rem);
  text-decoration: none;
  line-height: 1.2;
}
.syses:hover {
  color: #ec8f33;
  text-shadow: 0 0 8px rgba(220, 223, 226, 0.5);
}

/* 筛选栏 */
.filter-bar {
  width: 100%;
  max-width: 1200px;
  margin: 1.25rem auto;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0f2f5 25%, #dce1e3cd 50%, #f0f2f5 25%);
  border-radius: 0.5rem;
}

.filter-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem 1rem;
  align-items: center;
}

.filter-main > .lx {
  min-width: 120px;
  justify-self: end;
}

.filter-control {
  width: 100%;
  min-width: 160px;
  max-width: 280px;
}

.filter-bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.price-refresh {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  min-width: 116px;
}

.tag-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 260px;
}

.sort-btns {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  flex: 1;
}

.search-icon {
  cursor: pointer;
  color: #666;
  font-size: clamp(1.25rem, 2vw, 1.375rem);
  transition: color 0.2s;
}
.search-icon:hover {
  color: #e6a23c;
}

:deep(.el-button--primary) {
  --el-button-primary-bg-color: #e6a23c;
  --el-button-primary-border-color: #e6a23c;
}

/*  图书列表容器 */
.book-list-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 4rem 1.25rem; /* 底部加大内边距 */
  background-color: #eaeceec5;
  min-height: calc(100vh - 3.75rem - 80px);
  position: relative;
  margin-top: -30px;
  @media (max-width: 768px) {
    padding: 0 0.625rem 3rem;
  }
}

.book-card-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  width: 100%;
  gap: 1.25rem;
  margin-bottom: 1.5rem; /* 缩小卡片底部间距 */
  margin-bottom: 0px;
  margin-left: 40px;
}

.book-card {
  background: #fff !important;
  border: none !important;
  transition: all 0.3s;
  width: 1000px;
}
.book-card:hover {
  background: #f3f1f1 !important;
  box-shadow: 0 4px 12px rgba(227, 226, 226, 0.866);
}

.book-card-content {
  display: flex;
  padding: clamp(0.75rem, 2vw, 0.9375rem);
}

.book-cover {
  cursor: pointer;
  user-select: none !important;
  -webkit-user-select: none !important;
  width: clamp(80px, 15vw, 100px);
  height: clamp(120px, 20vw, 150px);
  object-fit: cover;
  margin-right: clamp(0.75rem, 2vw, 0.9375rem);
  border-radius: 0.25rem;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-name {
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: bold;
  color: #333;

  margin-bottom: 0.5rem;
  white-space: nowrop;
}

.book-author,
.book-category {
  user-select: none !important;
  -webkit-user-select: none !important;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: #666;
  margin-bottom: 0.25rem;
  white-space: nowrop;
  width: 215px;
}

.book-price {
  user-select: none !important;
  -webkit-user-select: none !important;
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  color: #e6a23c;
  font-weight: bold;
  margin: 0.5rem 0;
}

.add-cart-btn {
  cursor: pointer;
  width: 130px;
  background: #e6a23c !important;
  border-color: #e6a23c !important;
  font-size: clamp(1rem, 2vw, 1.125rem);
}

.empty-tip {
  text-align: center;
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  color: #999;
  margin-top: 3.125rem;
  margin-bottom: 2rem;
}

/* 分页栏样式（豆瓣同款+金色主题+居中强制展示） */
.pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
/* 页面全部金色按钮主题 */
:deep(.el-pagination) {
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-button-disabled-bg-color: #f5f5f5;
  --el-pagination-color: #e6a23c;
  --el-pagination-active-bg: #e6a23c;
  --el-pagination-active-border-color: #e6a23c;
  font-size: 15px;
}
/* 页码按钮加宽 */
:deep(.el-pagination .el-pager li) {
  min-width: 36px;
  height: 36px;
  line-height: 36px;
}

:deep(.el-select) {
  z-index: 9996 !important;
}
.lx {
  transition: all 0.2s ease;
}
.lx.refreshing,
.lx:active {
  background-color: rgba(6, 140, 212, 0.773) !important;
  border-color: #d48806 !important;
  color: #ffffff !important;
}
.lx:hover {
  background-color: rgba(6, 140, 212, 0.773) !important;
  border-color: #e6a23c !important;
}
.lx:disabled {
  opacity: 0.85;
  cursor: not-allowed;
}
.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.price-divider {
  color: #999;
  font-size: 1rem;
}
.tag-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.tag-label {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}
.tag-filter :deep(.el-checkbox) {
  margin-right: 10px;
}
* {
  transform: scale(0.98);
}

/* 价格文字排序按钮 */
.sort-btns {
  display: flex;
  gap: 12px;
  align-items: center;
}
.sort-btn {
  padding: 4px 10px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.25s;
  user-select: none;
}
.sort-btn:hover {
  color: #409eff;
  background-color: #f0f7ff;
}
/* 选中激活样式 */
.sort-btn.active {
  color: #409eff;
  font-weight: bold;
  background-color: #e6f4ff;
}
</style>
