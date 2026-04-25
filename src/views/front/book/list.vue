<template>
  <!-- 顶部导航栏 -->
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo1 sci-fi-title1">星途科幻图书</h2>
    </div>
    <div class="nav-center1">
      <div class="sejb">
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <!-- 未登录：显示登录、注册 -->
      <div v-if="!userStore.isLogin">
        <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
      </div>

      <!-- 已登录：显示 -->
      <div v-else class="login-bar">
        <span
          style="
            user-select: none !important;
            -webkit-user-select: none !important;
            color: green;
            font-size: 22px;
            position: relative;
            left: 10px;
          "
          >欢迎：{{ userStore.user?.username }}</span
        >
        <el-button link @click="$router.push('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button link @click="$router.push('/cart')"
          ><img style="width: 24px; height: auto" src="/img/购物车.png" />购物车</el-button
        >
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>
  </div>

  <!-- 筛选栏 -->
  <div class="filter-bar">
    <el-select
      v-model="selectedCategory"
      placeholder="请选择分类"
      style="width: clamp(160px, 15vw, 200px)"
      @change="loadBookList"
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
      style="width: clamp(104px, 15vw, 130px)"
      @change="loadBookList"
      popper-append-to-body
      :popper-style="{ width: '' }"
    >
      <el-option label="全部作者" value="全部" />

      <el-option label="刘慈欣" value="刘慈欣" />
      <el-option label="[美]艾萨克·阿西莫夫" value="[美]艾萨克·阿西莫夫" />
      <el-option label="[波]斯坦尼斯瓦夫·莱姆" value="[波]斯坦尼斯瓦夫·莱姆" />
      <el-option label="[美]安迪•威尔" value="[美]安迪•威尔" />
      <el-option label="[美]特德·姜" value="[美]特德·姜" />
      <el-option label="[韩]金草叶" value="[韩]金草叶" />
      <el-option label="" value="" />
    </el-select>

    <el-input
      v-model="searchKeyword"
      placeholder="输入图书名称搜索（如：三体）"
      style="width: clamp(240px, 25vw, 280px)"
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

    <el-button class="lx" type="primary" @click="loadBookList">刷新列表</el-button>
  </div>

  <!-- 图书列表容器 -->
  <div class="book-list-container">
    <div class="book-card-list">
      <el-card v-for="book in showBooks" :key="book.id" class="book-card">
        <div class="book-card-content">
          <!--@vue-ignore-->
          <img
            :src="book.cover || '/img/default-book.jpg'"
            referrerpolicy="no-referrer"
            alt="图书封面"
            class="book-cover"
            @click="$router.push(`/book/${book.id}`)"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <div class="book-info">
            <h3 class="book-name">
              {{ book.name || '未知图书' }}
            </h3>
            <p class="book-author">作者：{{ book.author || '未知作者' }}</p>
            <p class="book-category">分类：{{ book.category || '未知分类' }}</p>
            <p class="book-price">¥{{ formatPrice(book.price) }}</p>
            <p class="book-desc">简介：{{ book.desc || '暂无简介' }}</p>
            <el-button
              type="primary"
              size="large"
              class="add-cart-btn"
              @click.stop="$router.push(`/book/${book.id}`)"
            >
              查看详情
            </el-button>
          </div>
        </div>
        <div style="position: absolute; left: 646px; top: 10px; width: 86%">
          <bookping :book-id="book.id" />
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

    <!-- 豆瓣同款底部分页栏（强制显示+完整布局+适配主题） -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
        :prev-text="'上一页'"
        :next-text="'下一页'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import bookping from '@/views/front/book/抽离评价.vue'
//@ts-ignore
let timeleave: NodeJS.Timeout | null = null
const showhover = ref(false)
function mouseleve() {
  timeleave = setTimeout(() => {
    if (showhover.value === true) {
      showhover.value = false
    }
  }, 750)
}
function mouseshow() {
  if (timeleave) clearTimeout(timeleave)
  showhover.value = true
}
function go(path: string) {
  setTimeout(() => {
    router.push(path)
  }, 10)
}

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const allImagesLoaded = ref(false)

// 价格格式化
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}
const selectedAAuthor = ref('全部')
const selectedCategory = ref('全部')
const selectedAuthor = ref('')
const allBooks = ref<Book[]>([]) // 原始全部图书数据

const searchKeyword = ref('')
// 存储【筛选+一次性随机打乱】后的完整列表（切换页码不改动）
const filteredBooks = ref<Book[]>([])
const showBooks = ref<Book[]>([]) // 当前页面展示的图书

// ====================== 分页核心变量 ======================
const currentPage = ref(1) // 当前页码，默认第1页
const pageSize = ref(6) // 每页只显示6本图书
const total = ref(0) // 筛选之后的总图书数量

// 自动计算总页数
const totalPage = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})
// 加载图书列表（筛选 + 随机打乱 → 只执行一次）
const loadBookList = async () => {
  try {
    //selectedAuthor.value = ''
    const res = await getBookListApi('全部')

    //@ts-ignore
    allBooks.value = res.code === 200 ? res.data || [] : [] //@ts-ignore

    // 加载完数据重置页码到第1页
    currentPage.value = 1
    // 筛选 + 仅此处执行一次随机打乱
    doFilterAndShuffle()
  } catch (error) {
    allBooks.value = []

    filteredBooks.value = []

    showBooks.value = []

    total.value = 0
  }
}

// 筛选 + 一次性随机打乱（刷新/初始化调用）
const doFilterAndShuffle = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  // 1. 筛选数据
  let filtered = allBooks.value.filter((book) => {
    const matchName = keyword ? (book.name?.toLowerCase() || '').includes(keyword) : true
    const matchCategory =
      selectedCategory.value === '全部' || book.category === selectedCategory.value
    const matchAuthor = !selectedAuthor.value || book.author === selectedAuthor.value
    const matchAAuthor = selectedAAuthor.value === '全部' || book.author === selectedAAuthor.value

    return matchName && matchCategory && matchAuthor && matchAAuthor
  })

  // 2. 随机打乱（执行一次！切换页码不再打乱）
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[filtered[i], filtered[j]] = [filtered[j], filtered[i]]
  }

  // 3. 存储打乱后的完整列表
  filteredBooks.value = filtered

  total.value = filtered.length
  // 4. 分页切片
  doPaginationSlice()
}

// 分页切片（切换页码调用）
const doPaginationSlice = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  showBooks.value = filteredBooks.value.slice(startIndex, endIndex)
}

// 搜索（重新筛选+打乱）
const handleSearch = () => {
  currentPage.value = 1
  doFilterAndShuffle()
}

// 页码切换事件（切片）
const handlePageChange = () => {
  doPaginationSlice()
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  doFilterAndShuffle()
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

onMounted(() => {
  // 接收路由参数（分类+搜索关键词）
  const cat = route.query.category as string
  const keyword = route.query.keyword as string
  const author = route.query.author as string
  const aauthor = route.query.aauthor as string
  if (cat) selectedCategory.value = cat
  if (keyword) searchKeyword.value = keyword
  if (author) selectedAuthor.value = author
  if (aauthor) selectedAAuthor.value = aauthor
  // 加载列表
  loadBookList()
  // 页面加载完成关闭遮罩
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.1)
})
// 监听路由变化（点击标签跳转时，自动更新筛选）
import { watch } from 'vue'
watch(
  () => route.query,
  (newQuery) => {
    // 路由变了，重新赋值参数
    selectedCategory.value = (newQuery.category as string) || '全部'
    searchKeyword.value = (newQuery.keyword as string) || ''
    selectedAuthor.value = (newQuery.author as string) || ''

    // 重新加载筛选
    doFilterAndShuffle()
  },
  { deep: true },
)
</script>
<style scoped>
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
/* 遮罩样式 */
.black-mask {
  position: fixed;
  inset: 0;
  background: #eae8e8;
  z-index: 19999;
}
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
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
  display: inline-flex;
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
  background: linear-gradient(0deg, #ffffff 0%, #022d8a 100%);
  border: 1px solid rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  border-radius: 0.375rem;
  padding: 0.375rem 0.875rem;
  align-items: center;
  justify-content: center;
}

.syses {
  color: rgb(255, 255, 255);
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  @media (max-width: 768px) {
    justify-content: center;
    padding: 0.9375rem;
  }
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
* {
  transform: scale(0.98);
}
</style>
