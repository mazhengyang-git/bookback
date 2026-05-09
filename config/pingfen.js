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
      style=" font-weight: 600;"
        v-model="selectedCategory"
        placeholder="请选择分类"
        class="filter-control"
        @change="doFilterAndShuffle"
      >
        <el-option  label="全部类别" value="全部" />
        <el-option  style=" font-weight: 600;" label="太空歌剧" value="太空歌剧" />
        <el-option  style=" font-weight: 600;" label="赛博朋克" value="赛博朋克" />
        <el-option  style=" font-weight: 600;" label="时间旅行" value="时间旅行" />
        <el-option  style=" font-weight: 600;" label="智能纪元" value="智能纪元" />
        <el-option  style=" font-weight: 600;" label="外星文明" value="外星文明" />
        <el-option  style=" font-weight: 600;" label="末世废土" value="末世废土" />
        <el-option  style=" font-weight: 600;" label="星际灾厄" value="星际灾厄" />
        <el-option  style=" font-weight: 600;" label="虚幻惊悚" value="虚幻惊悚" />
        <el-option  style=" font-weight: 600;" label="星系攻略" value="星系攻略" />
        <el-option  style=" font-weight: 600;" label="次元交互" value="次元交互" />
        <el-option  style=" font-weight: 600;" label="梦灵空间" value="梦灵空间" />
        <el-option  style=" font-weight: 600;" label="自然谜团" value="自然谜团" />
        <el-option  style=" font-weight: 600;" label="平行宇宙" value="平行宇宙" />
        <el-option  style=" font-weight: 600;" label="意识陷落" value="意识陷落" />
      </el-select>

      <el-select
       style=" font-weight: 600;"
        v-model="selectedAAuthor"
        placeholder="请选择作者"
        class="filter-control"
        @change="doFilterAndShuffle"
        popper-append-to-body
      >
        <el-option  style=" font-weight: 600;" label="全部作者" value="全部" />
        <el-option  style=" font-weight: 600;" label="刘慈欣" value="刘慈欣" />
        <el-option  style=" font-weight: 600;" label="[美]艾萨克·阿西莫夫" value="[美]艾萨克·阿西莫夫" />
        <el-option  style=" font-weight: 600;" label="[波]斯坦尼斯瓦夫·莱姆" value="[波]斯坦尼斯瓦夫·莱姆" />
        <el-option  style=" font-weight: 600;" label="[美]安迪.威尔" value="[美]安迪.威尔" />
        <el-option  style=" font-weight: 600;" label="[美]特德·姜" value="[美]特德·姜" />
        <el-option  style=" font-weight: 600;" label="[韩]金草叶" value="[韩]金草叶" />
      </el-select>

      <el-input
       style=" font-weight: 600;"
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
         style=" font-weight: 600;"
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
         style=" font-weight: 600;"
          class="lx refresh-btn"
          type="primary"
          :class="{ refreshing: isRefreshing }"
          @click="refreshAllData"
          >刷新列表</el-button
        >
      </div>

      <div class="tag-filter">
        <span  style=" font-weight: 800;" class="tag-label">热门分类：</span>
        <el-checkbox-group v-model="selectedTags" @change="doFilterAndShuffle">
          <el-checkbox  style=" font-weight: 550;" v-for="tag in availableTags" :key="tag" :label="tag">{{ tag }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="sort-btns">
      <span  style=" font-weight: 600;" class="sort-btn" :class="{ active: showType === 'normal' }" @click="showNormalBooks"
        >默认图书</span
      >
      <span  style=" font-weight: 600;" class="sort-btn" :class="{ active: showType === 'new' }" @click="showNewBooks"
        >新书速览</span
      >
      <span
       style=" font-weight: 600;"
        class="sort-btn"
        :class="{ active: sortBy === 'price' && currentSortDirection === 'asc' }"
        @click="handleSort('asc')"
        >价格从低到高</span
      >
      <span
       style=" font-weight: 600;"
        class="sort-btn"
        :class="{ active: sortBy === 'price' && currentSortDirection === 'desc' }"
        @click="handleSort('desc')"
        >价格从高到低</span
      >
      <span  style=" font-weight: 600;" class="sort-btn" :class="{ active: sortBy === 'rating' }" @click="handleRatingSort"
        >评分最高</span
      >
    </div>
  </div>

  <!-- 图书列表区域 -->
  <div v-if="!loading" class="book-list-container"    v-cloak>
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
 <div v-if="!loading" v-cloak> <div class="page-footer">
    <div class="footer-content">
      <div class="footer-left">
        <h3 class="footer-title">星途科幻图书</h3>
        <p class="footer-slogan">探索宇宙的无限可能</p>
      </div>
      <div class="footer-center">
        <div class="footer-links">
          <a href="/books" class="footer-link">图书一览</a>
          <span class="footer-separator">|</span>
          <a href="/huodong" class="footer-link">热门活动</a>
          <span class="footer-separator">|</span>
          <a href="/user" class="footer-link">个人中心</a>
          <span class="footer-separator">|</span>
          <a href="/cart" class="footer-link">购物仓库</a>
        </div>
      </div>
      <div class="footer-right">
        <p class="footer-copyright">© 2010-2026 xtkh.com 版权所有</p>
        <p class="footer-contact">联系我们：contact@xingtu.com</p>
      </div>
    </div>
    <div class="footer-legal">
      <p class="legal-text">互联网图书服务资格证书:(中)-经营性-2026-0209 中公网安备 33010002000126号</p>
      <p class="legal-text">出版物网络交易平台服务经营备案证:新出发中备字第2017001号 信息网络传播视听许可证:110936a号</p>
      <p class="legal-text">互联网违法和不良信息举报中心:0571-81683755 blxx@list.alixingxin-inc.com</p>
    </div>
  </div></div></template>

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
import footere from '@/views/front/biaoqian/footer.vue'
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

// ✅ 【修复】获取图书评分 - 添加调试日志
const getBookAvgScore = (book: Book) => {
  const score = Number((book as any).avg_score ?? (book as any).avgScore ?? 0)
  return score
}

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

// ✅ 【修复】评分排序
const handleRatingSort = () => {
  if (sortBy.value === 'rating') {
    sortBy.value = ''
    shouldShufflePage.value = true
  } else {
    sortBy.value = 'rating'
    shouldShufflePage.value = false  // ✅ 关键：评分排序时不随机打乱
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

// ✅ 【核心修复】筛选+排序+分页 - 排序在全局筛选阶段进行
const doFilterAndShuffle = () => {
  const sourceList = showType.value === 'new' ? [...newBookList.value] : [...allBooks.value]
  const keyword = searchKeyword.value.trim().toLowerCase()

  // 第一步：筛选
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

  // ✅ 第二步：对全部筛选结果进行排序（关键修复）
  let sortedFiltered = [...filtered]

  if (sortBy.value === 'rating') {
    // 按评分从高到低排序
    console.log('🔄 执行评分排序，排序前数据量:', sortedFiltered.length)
    sortedFiltered.sort((a, b) => {
      const scoreA = getBookAvgScore(a)
      const scoreB = getBookAvgScore(b)
      return scoreB - scoreA
    })
    console.log('✅ 评分排序完成，前3本书评分:', sortedFiltered.slice(0, 3).map(b => ({
      name: b.name,
      score: getBookAvgScore(b)
    })))
  } else if (sortBy.value === 'price') {
    // 按价格排序
    if (currentSortDirection.value === 'asc') {
      sortedFiltered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else {
      sortedFiltered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }
  } else if (shouldShufflePage.value) {
    // ✅ 只在没有排序时才随机打乱
    sortedFiltered.sort(() => Math.random() - 0.5)
  }

  if (isDefaultFilterState() && defaultListSnapshot.value && !shouldShufflePage.value) {
    restoreDefaultSnapshot()
    return
  }

  filteredBooks.value = sortedFiltered
  total.value = filteredBooks.value.length
  currentPage.value = 1  // ✅ 排序后重置到第一页
  doPaginationSlice()
  shouldShufflePage.value = false
}

// ✅ 【修复】分页切片 - 只负责分页，不再排序
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  // ✅ 直接从已排序的 filteredBooks 中切片
  const pageItems = filteredBooks.value.slice(start, start + pageSize.value)
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