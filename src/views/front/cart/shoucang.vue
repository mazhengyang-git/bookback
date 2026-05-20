
<template>
  <div class="favorite-container" v-cloak>
    <!-- 顶部区域 -->
    <div class="top-bar">
      <el-button class="nav-btn" @click="$router.push('/home')">
        ← 返回首页
      </el-button>

      <el-button class="nav-btn user-btn" @click="$router.push('/user')">
        👤 个人中心
      </el-button>
    </div>

    <!-- 标题区域 -->
    <div class="favorite-header">
      <div class="header-icon">📖</div>
      <div>
        <h2 class="favorite-title">我的收藏</h2>
        <p class="favorite-subtitle">收藏每一本心动的书籍</p>
      </div>
    </div>

    <!-- loading -->
    <div v-if="loading" class="loading-box">
      <div class="loader"></div>
      <p>正在加载收藏内容...</p>
    </div>

    <!-- 收藏列表 -->
    <div class="favorite-grid" v-else-if="shoucangStore.currentShoucang.length > 0">
      <div
        class="favorite-card"
        v-for="item in shoucangStore.currentShoucang"
        :key="item.shoucangId"
      >
        <!-- 收藏标签 -->
        <div class="favorite-badge">已收藏</div>

        <!-- 选择 -->
        <div class="check-wrap">
          <el-checkbox
            :model-value="checkedIds.includes(item.shoucangId)"
            @change="(val: any) => handleItemCheck(item.shoucangId, val)"
          />
        </div>

        <!-- 封面 -->
        <div class="cover-wrap" @click="handleBookClick(item)">
         <!--@vue-ignore--> <img
            :src="item.cover || '/default-book.png'"
            class="book-cover"
            alt="图书封面"
            @error="(e) => (e.target.src = '/default-book.png')"
          />
        </div>

        <!-- 内容 -->
        <div class="book-content">
          <h3 class="book-name">
            {{ item.name || '未知图书' }}
          </h3>

          <div class="book-meta">
  <!-- 价格区域 -->
  <template v-if="hasDiscount(item)">
    <span class="original-price">原价¥{{ formatPrice(item.price) }}</span>
    <div class="discount-line">
      <span class="discount-price">优惠价¥{{ formatPrice(getDiscountPrice(item)) }}</span>
      <el-tag type="danger" size="small" class="discount-tag">
        {{ getDynamicDiscountRate(item) }}
      </el-tag>
    </div>
  </template>
  <span v-else class="normal-price">¥{{ formatPrice(item.price || 0) }}</span>

  <!-- 规格标签 -->
  <span class="spec-label">📚 {{ item.spec || '平装版' }}</span>
</div>
        </div>

        <!-- 按钮 -->
        <div class="card-actions">
          <button class="view-btn" @click="handleBookClick(item)">
            查看详情
          </button>

          <button class="delete-btn" @click="handleDelete(item.shoucangId)">
            移除收藏
          </button>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-toolbar">
        <div class="toolbar-left">
          已收藏
          <span class="highlight">{{ shoucangStore.currentShoucang.length }}</span>
          本图书
        </div>

        <div class="toolbar-right">
          <button class="explore-btn" @click="handlePay">
            📖 去浏览图书
          </button>

          <button class="clear-btn" @click="handleClear">
            🗑 清空收藏夹
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-box" v-else>
      <div class="empty-animation">📚</div>

      <h3>你的收藏夹还是空的</h3>
      <p>快去发现喜欢的图书吧～</p>

      <button class="discover-btn" @click="go('/books')">
        去浏览图书
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useShoucangStore } from '@/store/shoucang'
import { useUserStore } from '@/store/user'
import { getShoucangList, deleteShoucangItem, clearShoucang } from '@/api/front/shoucang'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'

const shoucangStore = useShoucangStore()
const userStore = useUserStore()
const router = useRouter()

const loading = ref(true)
const checkedIds = ref<number[]>([])
const isAllChecked = ref(false)

// 全局统一的价格工具函数
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}

const getDiscountPrice = (item: any) => Number(item.discount_price ?? item.price) || 0

const hasDiscount = (item: any) => {
  //优惠价非空且优惠价<原价
  return item.discount_price !== null 
    && item.discount_price !== undefined 
    && Number(item.discount_price) < Number(item.price)
}

const getDynamicDiscountRate = (item: any) => {
  if (!hasDiscount(item)) return ''
  // 优先用后端返回的折扣率，没有则自动计算
  if (item.discount_rate) return item.discount_rate + '折'
  const rate = (Number(item.discount_price) / Number(item.price)) * 10
  return rate.toFixed(1) + '折'
}

function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10)
}

// 单选收藏项
const handleItemCheck = (shoucangId: number, checked: boolean) => {
  if (checked) {
    checkedIds.value.push(shoucangId)
  } else {
    checkedIds.value = checkedIds.value.filter((id) => id !== shoucangId)
  }
  isAllChecked.value = checkedIds.value.length === shoucangStore.currentShoucang.length
}

// 图书点击跳转
const handleBookClick = (item: any) => {
  // 根据source设置book_type
  const bookType = item.source === 'seller' ? 2 : item.source === 'new' ? 1 : 0
  const path = `/book/${item.id}?book_type=${bookType}`
  
  if (router.currentRoute.value.path.startsWith('/book/')) {
    window.location.href = path
  } else {
    router.push(path)
  }
}

// 加载收藏数据
const loadShoucangData = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    loading.value = false
    return
  }

  try {
    const shoucangRes = await getShoucangList()

    if (shoucangRes.code === 200 && shoucangRes.data) {
      shoucangStore.clearShoucang()
 
      shoucangRes.data.forEach(item => {
        shoucangStore.addToShoucang(item)
      })

      checkedIds.value = shoucangStore.currentShoucang.map(item => item.shoucangId)
      isAllChecked.value = true
    }
  } catch (error) {
    console.error('加载收藏失败', error)
  } finally {
    loading.value = false
  }
}

// 删除单个收藏
const handleDelete = async (shoucangId: number) => {
  try {
    await deleteShoucangItem(shoucangId)
    shoucangStore.deleteItem(shoucangId)
    checkedIds.value = checkedIds.value.filter(id => id !== shoucangId)
    ElMessage.success('已移除收藏')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 清空收藏
const handleClear = async () => {
  try {
    await clearShoucang()
    shoucangStore.clearShoucang()
    checkedIds.value = []
    ElMessage.success('收藏夹已清空')
  } catch (error) {
    ElMessage.error('清空收藏夹失败')
  }
}

// 去浏览图书
const handlePay = () => {
  router.push('/books')
}

onMounted(() => {
  loadShoucangData()
})
</script>

<style scoped>
.book-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 39.4%;
  align-items: flex-start;
}
</style>

<style>
.loading-box {
  width: 100%;
  padding: 100px 0;
  text-align: center;
  color: #666;
}

.loader {
  width: 45px;
  height: 45px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b81;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style scoped>
.book-meta {
 
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 14px;
  user-select: none;
}

.discount-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.discount-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
  user-select: none;
}

.normal-price {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  user-select: none;
}

.discount-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.spec-label {
  color: #777;
  font-size: 13px;
  user-select: none;
  margin-top: 2px;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 页面背景 */
.favorite-container {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top right, #e4f5ff 0%, transparent 25%),
    radial-gradient(circle at bottom left, #d8f5ff 0%, transparent 30%),
    linear-gradient(135deg, #faebcd, #f3f6ff);
}

/* 顶部 */
.top-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  background-color: #e4e2e2;
  height: 60px;
  padding-top: 10px;
  margin-top: -24.5px;
  padding-bottom: 10px;
  width: 100vw;
  padding-left: 16px;
  margin-left: -23px;
}

.nav-btn {
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(202, 202, 202, 0.8);
  color: #444;
  height: 40px;
  font-weight: 600;
  padding-top: 10px;
  padding-bottom: 10px;
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  
}

.nav-btn:hover {
  background: #bec39f63;
  transform: translateY(-2px);
}

.user-btn {
  color: #000000;
}

/* 标题 */
.favorite-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.header-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ff6b81, #ffb199);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  box-shadow: 0 10px 30px rgba(255, 107, 129, 0.3);
}

.favorite-title {
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 800;
  color: #2b2b2b;
}

.favorite-subtitle {
  margin-top: 8px;
  color: #777;
  font-size: 15px;
}

/* 卡片布局 */
.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

/* 卡片 */
.favorite-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  padding: 22px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.favorite-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
}

/* 收藏标签 */
.favorite-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: linear-gradient(135deg, #ff6b81, #ff9472);
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
}

/* checkbox */
.check-wrap {
  margin-bottom: 12px;
}

/* 封面 */
.cover-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
  cursor: pointer;
}

.book-cover {
  width: 160px;
  height: 220px;
  object-fit: cover;
  border-radius: 14px;
  transition: transform 0.3s ease;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.favorite-card:hover .book-cover {
  transform: scale(1.05);
}

/* 内容 */
.book-content {
  text-align: center;
}

.book-name {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  line-height: 1.5;
  margin-bottom: 10px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  color: #ff6b00;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 14px;
}

.book-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  color: #777;
  font-size: 13px;
}

/* 按钮 */
.card-actions {
  margin-top: 22px;
  display: flex;
  gap: 12px;
}

.view-btn,
.delete-btn {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
}

.view-btn {
  background: linear-gradient(135deg, #7f7fd5, #86a8e7);
  color: white;
}

.view-btn:hover {
  transform: translateY(-2px);
}

.delete-btn {
  background: linear-gradient(135deg, #ff758c, #ff5252);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
}

/* 底部工具栏 */
.bottom-toolbar {
  grid-column: 1/-1;
  margin-top: 20px;
  padding: 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);

  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.toolbar-left {
  font-size: 18px;
  color: #444;
}

.highlight {
  color: #ff6b81;
  font-size: 28px;
  font-weight: bold;
  margin: 0 6px;
}

.toolbar-right {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.explore-btn,
.clear-btn {
  border: none;
  height: 46px;
  padding: 0 22px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.25s ease;
}

.explore-btn {
  background: linear-gradient(135deg, #ffb347, #ffcc33);
  color: #222;
}

.clear-btn {
  background: linear-gradient(135deg, #ff6b81, #ff5252);
  color: white;
}

.explore-btn:hover,
.clear-btn:hover {
  transform: translateY(-2px);
}

/* 空状态 */
.empty-box {
  margin-top: 80px;
  text-align: center;
}

.empty-animation {
  font-size: 90px;
  margin-bottom: 24px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  50% {
    transform: translateY(-10px);
  }
}

.empty-box h3 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.empty-box p {
  color: #777;
  margin-bottom: 26px;
}

.discover-btn {
  height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  color: #222;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.discover-btn:hover {
  transform: translateY(-3px);
}

/* 移动端 */
@media (max-width: 768px) {
  .favorite-header {
    flex-direction: column;
    text-align: center;
  }

  .bottom-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    width: 100%;
  }

  .explore-btn,
  .clear-btn {
    flex: 1;
  }
}
</style>





