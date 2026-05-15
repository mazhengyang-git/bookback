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
      <span
        style=" font-weight: 600;"
        class="sort-btn"
        :class="{ active: sortBy === 'sales' }"
        @click="handleSalesSort"
        >销量最高</span
      >
    </div>
  </div>
  <el-button
         class="ziwy" style="position: absolute;  font-size: 17px; margin-left: 250px; top: 19px;z-index:10 "
          link
          @click="go('/shoucang')"
          ><img
            class="gwdh1"
            style="width: 32px; height: auto; margin-right: 3px;"
            src="/public/img/收藏夹.png"
          /><span style="color:red">收藏夹</span></el-button
        >
  <!-- 图书列表区域 -->
  <div v-if="!loading" class="book-list-container"    v-cloak>
    
    <div class="main-content-wrapper">
     
      <!-- 左侧图书列表 -->
      <div class="left-content">
        <div class="book-card-list">
          <el-card v-for="book in showBooks" :key="book.id" class="book-card">
            <div class="book-card-content">
             <!--@vue-ignore--> <img
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
               <li style="list-style:none"><el-button
                  type="primary"
                  size="large"
                  class="add-cart-btn"
                  @click.stop="handleBookClick(book)"
                >
                  查看详情
                </el-button>
                 <el-button
          type="primary"
          size="large"
          class="add-cart-btn2"
          @click="addToShoucang(book)"
          :disabled="!userStore.token"
        >
          {{ userStore.token ? '收藏图书' : '收藏图书? 请先登录' }}
        </el-button></li> 
              </div>
            </div>
            <!--  v-if 防止列表渲染时星星闪烁 -->
            <div style="position: absolute;  top: 10px; width: 86%;left: 560px;">
               <p class="xlwy">销量：{{ Number(book.sales_count) || 0 }}件</p><bookping v-if="book.id != null" :book-id="book.id" :source="showType"/>
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

      <!-- 右侧组件 -->
      <div class="right-content">
        <listright />
        
      </div>
      
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else class="loading-tip">加载中...</div>
 <div v-if="!loading" v-cloak>
   <div class="page-footer">
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
  //@ts-ignore
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import bookping from '@/views/front/book/抽离评价.vue'
import { useBookStore1 } from '@/store/newbook'
import { useShoucangStore } from '@/store/shoucang'
import request from '@/utils/request'  //@ts-ignore
const shoucangStore = useShoucangStore()
import listright from './listright.vue'
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
function go(path: string) {
  router.push(path)
}

// 加载状态
const loading = ref(true)

const paixu = ref('')
const sortBy = ref<'price' | 'rating' | 'sales' | ''>('')
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
const hasRandomizedInitialPage = ref(false)//@ts-ignore
const addToShoucang = async (book) => {
  // 用当前点击的 book
  if (!userStore.token) {
    ElMessage.warning({ 
      message: '请先登录后再收藏', 
      offset: 160 
    })
    return
  }

  try {
    // 直接用当前点击的图书信息
    const res = await request.post('/api/shoucang/add', {
      goodsId: book.id,
      num: 1,                  // 收藏默认 1
      spec: '平装版',
      source: 'normal',        // 固定普通来源
      bookName: book.name,
      bookCover: book.cover,
      bookPrice: book.price 
    })
//@ts-ignore
    if (res.code === 200) {
      ElMessage.success({ 
        message: '收藏成功', 
        offset: 160 
      })
    } else {
      // 显示后端返回的：该图书已在收藏夹中
      //@ts-ignore
      ElMessage.error({ //@ts-ignore
        message: res.msg, 
        offset: 160 
      })
    }

  } catch (err) {
    ElMessage.error({ //@ts-ignore
      message: err?.response?.data?.msg || '收藏失败，请稍后重试', 
      offset: 160 
    })
  }
}
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

const getBookSales = (book: Book) => Number(book.sales_count ?? 0)

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
    shouldShufflePage.value = false   
  }
  currentPage.value = 1
  doFilterAndShuffle()
}

// 销量排序（整表排序后分页切片，不打乱筛选结果）
const handleSalesSort = () => {
  if (sortBy.value === 'sales') {
    sortBy.value = ''
    shouldShufflePage.value = true
  } else {
    sortBy.value = 'sales'
    shouldShufflePage.value = false
  }
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
//@ts-ignore
const loadBookList = async (showMask = true) => {
  try {
    const res = await getBookListApi('全部')//@ts-ignore
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

const doFilterAndShuffle = () => {
  const sourceList = showType.value === 'new' ? [...newBookList.value] : [...allBooks.value]
  const keyword = searchKeyword.value.trim().toLowerCase()

  // 1. 筛选
  const filtered = sourceList.filter((book) => {
    const matchName = keyword ? book.name?.toLowerCase().includes(keyword) : true
    const matchCategory = selectedCategory.value === '全部' || book.category === selectedCategory.value
    const matchAAuthor = selectedAAuthor.value === '全部' || book.author === selectedAAuthor.value
    const matchAuthorSearch = authorSearch.value
      ? book.author?.toLowerCase().includes(authorSearch.value.trim().toLowerCase())
      : true
    const matchTags = selectedTags.value.length === 0 || selectedTags.value.includes(book.category || '')
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

  // 2. 随机打乱，排序在分页后对当前页执行
  let processedList = [...filtered]
  if (shouldShufflePage.value) {
    processedList.sort(() => Math.random() - 0.5)
  }

  filteredBooks.value = processedList
  total.value = filteredBooks.value.length
  currentPage.value = 1
  doPaginationSlice()
  shouldShufflePage.value = false
}
// 分页切片
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  // 切片后对当前页图书排序
  let pageBooks = [...filteredBooks.value.slice(start, start + pageSize.value)]

  if (sortBy.value === 'rating') {
    pageBooks.sort((a, b) => getBookAvgScore(b) - getBookAvgScore(a))
  } else if (sortBy.value === 'sales') {
    pageBooks.sort((a, b) => getBookSales(b) - getBookSales(a))
  } else if (sortBy.value === 'price') {
    if (currentSortDirection.value === 'asc') {
      pageBooks.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    } else {
      pageBooks.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }
  }

  showBooks.value = pageBooks

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

// 初始化加载
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
.xlwy {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 14px;
  color: #000000;
  font-size: px;
}
.ziwy{
   position: fixed !important;
  top: 49.5vh !important;
  right: 0 !important;
  z-index: 9999 !important;
  width: auto; 
  height: auto;
  background-color: #0000001e !important;
  border-radius: 12px 0 0 12px;
  transform: translateX(55px);
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 7px;
transition: all 0.25s ease;
}
.ziwy:hover{
  
  transform: translateX(0px);
  
  
}
.gwdh1 {
 
  animation: gwdh1 2s infinite;
}
@keyframes gwdh1 {
  0%,
  100% {
    transform: scale(1) rotate3d(0, 0, 0, 0deg);
  }
  25% {
    transform: scale(1.1) ;
  }
  50% {
    transform: scale(1.15);
  }
  75% {
    transform: scale(1.1) ;
  }
}

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
/* 简介：2行显示+末尾省略号 */
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
 margin-left: -40px;
 margin-right: 36px;
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
   background: #e5e3e1;
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
  max-width: 100vw;
  margin: 1.25rem auto;
  padding: 1rem 1.25rem;
  background: linear-gradient(180deg,  #ecd9bb80 75%, #f0f2f5 100%);
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
 
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
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
  width: 101.9%;

  left: -14px;
  max-width: 104vw;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 4rem 1.25rem; /* 底部内边距 */
  background-color: #eaeceec5;
  min-height: calc(100vh - 3.75rem - 80px);
  position: relative;
  margin-top: -30px;
  margin-bottom: -24.1px;
  @media (max-width: 768px) {
    padding: 0 0.625rem 3rem;
  }
}

/* 主内容包装器-两栏布局 */
.main-content-wrapper {
 
    display: flex;
  align-items: flex-start;

  gap: 20px;
  width: 100%;

}

/* 左侧内容区域 */
.left-content {
  flex: 1;
  min-width: 0;
}

/* 右侧内容区域 */
.right-content {
      position: relative;
      right: 150px;
top: -65px;
      width: 320px;
      height: fit-content;
    

      align-self: flex-start;
 
}
@media (max-width: 1470px) {
  .right-content {
  right: 120px;
  }
}
@media (max-width: 1440px) {
  .right-content {
 right: 80px;
  }
}
@media (max-width: 1400px) {
  .right-content {
 right: 25px;
  }
}
@media (max-width: 1350px) {
  .right-content {
 right: -15px;
  }
}
@media (max-width: 1300px) {
  .right-content {
 right: -75px;
  }
}@media (max-width: 1280px) {
  .right-content {
 right: -115px;
  }
}
@media (max-width: 1200px) {
  .right-content {
   right: -135px;
  }
}
@media (max-width: 1170px) {
  .right-content {
   right: -165px;
  }
}


@media (max-width: 1160px) {
  .right-content {
   right: -185px;
  
  }
}
@media (max-width: 1130px) {
  .right-content {
   right: -205px;
   
  }
}
@media (max-width: 1100px) {
  .right-content {
   right: -245px;
   
  }
}
@media (max-width: 1070px) {
  .right-content {
   right: -275px;
   
  }
}
@media (max-width: 1040px) {
  .right-content {
   right: -310px;
   
  }
}
@media (max-width: 1000px) {
  .right-content {
   right: -335px;
   
  }
}
@media (max-width: 980px) {
  .right-content {
  right: -370px;
   
  }
}
.book-card-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  width: 150%;
  gap: 1.25rem;
  margin-bottom: 1.5rem; /* 卡片底部间距 */
  margin-bottom: 0px;
  margin-left: 0;
}

.book-card {
  background: #fff !important;
  border: none !important;
  transition: all 0.3s;
   width: 1000px;
  max-width: 1000px;
}
.book-card:hover {
  background: rgba(226, 223, 223, 0.033) !important;
  box-shadow: 1px 4px 12px rgba(74, 6, 16, 0.277);
}

.book-card-content {
  display: flex;
  padding: clamp(0.75rem, 2vw, 0.9375rem);
}

.book-cover {
  cursor: pointer;
  user-select: none !important;
  -webkit-user-select: none !important;
  width: clamp(108px, 15vw, 113px);
  height: clamp(130px, 20vw, 155px);
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

/* 分页栏样式（豆瓣同款） */
.pagination-wrapper {
  width: 100%;
 
  display: flex;
  position: relative;
 left: 44px;
 margin-left: 18.2vw;
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
<style scoped>
.add-cart-btn2 {
 width: 130px;
 
  font-size: clamp(1rem, 2vw, 1.125rem);
  background-color: #e6a23c !important;
  border: none !important;
  margin-left: 16px;
  position: relative;
 
}
.add-cart-btn2:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
}
.page-footer {
  width: 103.95vw;
  min-width: 100%;
  background: linear-gradient(1.5deg, #333333 0%, #b2b0b0 100%);
  padding: 30px 0;
  position: absolute;
  left: -33px;
  right: 0;
top: -16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  white-space: nowrap;
}

.footer-left {
  flex-shrink: 0;
}

.footer-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  white-space: nowrap;
}

.footer-slogan {
  font-size: 14px;
  
  color: rgba(227, 224, 224, 0.9);
  margin: 0;
  white-space: nowrap;
}

.footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
}

.footer-link {
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffd700;
}

.footer-separator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-right {
  flex-shrink: 0;
  text-align: right;
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 5px 0;
  white-space: nowrap;
}

.footer-contact {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  white-space: nowrap;
}

.footer-legal {
  max-width: 1200px;
  min-width: 1200px;
  margin: 20px auto 0;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  text-align: center;
}

.legal-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 5px 0;
  white-space: nowrap;
}
</style>







