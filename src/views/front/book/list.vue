<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="book-list-container">
    <div class="filter-bar">
      <el-select
        v-model="selectedCategory"
        placeholder="请选择分类"
        style="width: 200px; margin-right: 20px"
        @change="loadBookList"
      >
        <el-option label="全部" value="全部" />
        <el-option label="硬科幻" value="硬科幻" />
        <el-option label="软科幻" value="软科幻" />
      </el-select>

      <el-input
        v-model="searchKeyword"
        placeholder="输入图书名称搜索（如：三体）"
        style="width: 280px; margin-right: 20px"
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
      <el-button class="lx1" type="primary" @click="$router.push('/home')">返回首页</el-button>
      <!-- 登录状态 -->
      <div v-if="!userStore.isLogin">
        <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
      </div>
      <div v-else class="login-bar">
        <span style="color: green; font-size: 22px; margin-right: 5px; -webkit-user-select: none">
          欢迎：{{ userStore.user?.username }}
        </span>
        <el-button link @click="$router.push('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button link @click="$router.push('/cart')"
          ><img style="width: 24px; height: auto" src="/img/购物车.png" />购物车</el-button
        >
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="book-card-list">
      <el-card
        v-for="book in showBooks"
        :key="book.id"
        class="book-card"
        @click="$router.push(`/book/${book.id}`)"
      >
        <div class="book-card-content">
          <!-- 封面图容错 -->
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
            <!-- 价格格式化 -->
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
//导入API
import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const allImagesLoaded = ref(false)

//价格格式化函数
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
    //调用API，传递分类参数
    const res = await getBookListApi(selectedCategory.value) //@ts-ignore
    allBooks.value = res.code === 200 ? res.data || [] : []
    handleSearch()
  } catch (error) {
    //ElMessage.error('加载图书失败，请重试')
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
  // 接收路由参数：分类+搜索关键词
  const cat = route.query.category as string
  const keyword = route.query.keyword as string

  if (cat) selectedCategory.value = cat
  if (keyword) searchKeyword.value = keyword

  // 加载列表并自动搜索
  loadBookList()
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.1) // 3秒后无论如何都隐藏遮罩
})
</script>
<style scoped>
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
}
.login-bar span {
  white-space: nowrap;
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}
/* 遮罩淡出动画 */
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
.book-list-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #d3d7dc;
  min-height: 100vh;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #f0f2f5 25%, #e1d7ce 50%, #f0f2f5 25%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  top: 19.1px;
  z-index: 10;
  position: sticky;
}

.search-icon {
  cursor: pointer;
  color: #666;
  font-size: 22px;
  margin-right: 2px;
  transition: color 0.2s;
}
.search-icon:hover {
  color: #e6a23c;
}

:deep(.el-button--primary) {
  --el-button-primary-bg-color: #e6a23c;
  --el-button-primary-border-color: #e6a23c;
}

.book-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-card {
  cursor: pointer;
  background: #fff !important;
  border: none !important;
  transition: box-shadow 0.3s;
}

.book-card:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.book-card-content {
  display: flex;
  padding: 15px;
}

.book-cover {
  width: 100px;
  height: 150px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.book-author,
.book-category {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.book-price {
  font-size: 18px;
  color: #e6a23c;
  font-weight: bold;
  margin: 8px 0;
}

.add-cart-btn {
  width: 100%;
  background: #e6a23c !important;
  border-color: #e6a23c !important;
}

.empty-tip {
  text-align: center;
  font-size: 18px;
  color: #999;
  margin-top: 50px;
}
:deep(.el-select) {
  z-index: 11111 !important;
}
.lx1 {
  position: relative;
  left: -25px;
  margin-right: -30px;
}
.lx {
  position: relative;
  left: -9px;
}
</style>
