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
      <el-option label="全部" value="全部" />
      <el-option label="硬科幻" value="硬科幻" />
      <el-option label="软科幻" value="软科幻" />
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
      <el-card
        v-for="book in showBooks"
        :key="book.id"
        class="book-card"
        @click="$router.push(`/book/${book.id}`)"
      >
        <div class="book-card-content">
          <!--@vue-ignore-->
          <img
            :src="book.cover || '/img/default-book.jpg'"
            referrerpolicy="no-referrer"
            alt="图书封面"
            class="book-cover"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <div class="book-info">
            <h3 class="book-name">{{ book.name || '未知图书' }}</h3>
            <p class="book-author">作者：{{ book.author || '未知作者' }}</p>
            <p class="book-category">分类：{{ book.category || '未知分类' }}</p>
            <p class="book-price">¥{{ formatPrice(book.price) }}</p>
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
      </el-card>
    </div>

    <div v-if="showBooks.length === 0" class="empty-tip">
      {{
        searchKeyword
          ? `未找到含「${searchKeyword}」的${selectedCategory === '全部' ? '' : selectedCategory + ' '}图书`
          : '暂无图书数据 😕'
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
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

const selectedCategory = ref('全部')
const allBooks = ref<Book[]>([])
const searchKeyword = ref('')
const showBooks = ref<Book[]>([])

// 加载图书列表
const loadBookList = async () => {
  try {
    const res = await getBookListApi(selectedCategory.value)
    //@ts-ignore
    allBooks.value = res.code === 200 ? res.data || [] : []
    handleSearch()
  } catch (error) {
    allBooks.value = []
    showBooks.value = []
  }
}

// 搜索逻辑
const handleSearch = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  let filtered = allBooks.value.filter((book) => {
    const matchName = keyword ? (book.name?.toLowerCase() || '').includes(keyword) : true
    const matchCategory =
      selectedCategory.value === '全部' || book.category === selectedCategory.value
    return matchName && matchCategory
  })

  // 随机打乱排序
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[filtered[i], filtered[j]] = [filtered[j], filtered[i]]
  }

  showBooks.value = filtered
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  handleSearch()
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

  if (cat) selectedCategory.value = cat
  if (keyword) searchKeyword.value = keyword

  // 加载列表
  loadBookList()
  // 遮罩逻辑
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.05)
})
</script>

<style scoped>
/*基础响应式配置*/
:root {
  font-size: 16px;
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
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 0.0625rem solid rgba(64, 158, 255, 0.2);
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
  background: linear-gradient(0deg, #5073c7 0%, #121a28 100%);
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
  color: #29a7ef;
}

/* 筛选栏 */
.filter-bar {
  width: 100%;
  max-width: 1200px;
  margin: 1.25rem auto;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0f2f5 25%, #e1d7ce 50%, #f0f2f5 25%);
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
  padding: 1.25rem 1.25rem 1.25rem 1.25rem;
  background-color: #d3d7dc;
  min-height: calc(100vh - 3.75rem - 80px);
  @media (max-width: 768px) {
    padding: 0 0.625rem 1.25rem;
  }
}

.book-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(300px, 45vw, 270px), 1fr));
  gap: 1.25rem;
}

.book-card {
  cursor: pointer;
  background: #fff !important;
  border: none !important;
  transition: all 0.3s;
}
.book-card:hover {
  background: #f4f2f2 !important;
  box-shadow: 0 4px 12px rgba(251, 73, 2, 0.3);
}

.book-card-content {
  display: flex;
  padding: clamp(0.75rem, 2vw, 0.9375rem);
}

.book-cover {
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
}

.book-author,
.book-category {
  user-select: none !important;
  -webkit-user-select: none !important;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: #666;
  margin-bottom: 0.25rem;
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
  width: 100%;
  background: #e6a23c !important;
  border-color: #e6a23c !important;
  font-size: clamp(1rem, 2vw, 1.125rem);
}

.empty-tip {
  text-align: center;
  font-size: clamp(1.125rem, 2vw, 1.25rem);
  color: #999;
  margin-top: 3.125rem;
}

:deep(.el-select) {
  z-index: 9996 !important;
}
</style>
