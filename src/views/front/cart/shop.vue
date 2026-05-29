<template>
  <div class="shop-follow-page" v-cloak>
    <!-- 顶部导航 -->
    <div class="shop-top-bar">
      <el-button class="back-btn" @click="$router.push('/home')">
        ← 返回
      </el-button>
      <div class="title-center">🏪 我的关注</div>
      <el-button class="user-center-btn" @click="$router.push('/user')">
        个人中心
      </el-button>
    </div>

    <!-- 头部标题 -->
    <div class="shop-header">
      <div class="header-icon-box">🏪</div>
      <div class="header-text">
        <h1>我的关注店铺</h1>
        <p>你关注的优质商家都在这里</p>
      </div>
    </div>

    <!-- loading -->
    <div v-if="loading" class="shop-loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 店铺列表 -->
    <div class="shop-grid" v-else-if="followList.length > 0">
      <div
        class="shop-card"
        v-for="shop in followList"
        :key="shop.follow_id"
      >
        <div class="follow-tag">已关注</div>

        <!-- 店铺头像 -->
        <div class="shop-avatar-box" @click="goToShop(shop.shop_id)">
          <img
            :src="shop.shop_avatar || '/img/default-avatar.png'"
            class="shop-avatar"
            alt="店铺头像"
          />
        </div>

        <!-- 信息 -->
        <div class="shop-info">
          <h2 class="shop-name">{{ shop.shop_name || '未知店铺' }}</h2>
          <div class="shop-meta">
            <!-- <span>ID：{{ shop.shop_id }}</span> -->
            <span>{{ formatTime(shop.create_time) }}</span>
          </div>
        </div>

        <!-- 操作 -->
        <div class="shop-actions">
          <button class="enter-btn" @click="goToShop(shop.shop_id)">
            进入店铺
          </button>
          <button class="unfollow-btn" @click="handleDelete(shop.follow_id)">
            取消关注
          </button>
        </div>
      </div>

      <!-- 底部栏 -->
      <div class="shop-bottom-bar">
        <div class="total-info">
          共关注 <span>{{ followList.length }}</span> 家店铺
        </div>
        <div class="action-buttons">
          <button class="discover-btn" @click="$router.push('/seller')">
            发现更多店铺
          </button>
          <button class="clear-all-btn" @click="handleClear">
            清空全部关注
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">🏪</div>
      <h3>暂无关注店铺</h3>
      <p>关注喜欢的商家，不错过上新</p>
      <button class="go-discover" @click="$router.push('/books2')">
        去发现店铺
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(true)
const followList = ref([])

const formatTime = (time) => {
  if (!time) return '未知时间'
  return time.substring(0, 10)
}

const goToShop = (shopId) => {
  router.push(`/shop/${shopId}`)
}

const loadFollowShop = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    loading.value = false
    return
  }

  try {
    const res = await request.get('/api/shop/list')
    if (res.code === 200) followList.value = res.data
  } catch (err) {
    console.error(err)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (followId) => {
  try {
    await request.post('/api/shop/delete', { follow_id: followId })
    followList.value = followList.value.filter(s => s.follow_id !== followId)
    ElMessage.success('已取消关注')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleClear = async () => {
  try {
    await request.post('/api/shop/clear')
    followList.value = []
    ElMessage.success('已清空')
  } catch (e) {
    ElMessage.error('清空失败')
  }
}

onMounted(() => loadFollowShop())
</script>

<style scoped>
/* ============================== */
/* 【店铺关注页 - 全新独立视觉】 */
/* 与收藏夹完全区分开 */
/* ============================== */

/* 页面容器 */
.shop-follow-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F7FF 0%, #E8F1FF 100%);
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

/* 顶部栏 */
.shop-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #D1E5FF;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn,
.user-center-btn {
  background: #F4F7FF;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 500;
  color: #165DFF;
  cursor: pointer;
}

.title-center {
  font-size: 18px;
  font-weight: bold;
  color: #165DFF;
}

/* 头部 */
.shop-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px 24px;
}

.header-icon-box {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #165DFF, #409EFF);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: #fff;
}

.header-text h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1D2129;
  margin: 0;
}

.header-text p {
  color: #666;
  margin: 4px 0 0;
}

/* 加载 */
.shop-loading {
  text-align: center;
  padding: 80px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E6EEFF;
  border-top: 3px solid #165DFF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* 卡片网格 */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
 
  gap: 24px;
  padding: 0 24px 40px;
}

/* 店铺卡片 */
.shop-card {
  
  transform: scale(0.8);
  background: #ffffff;
  border-radius: 24px;
  padding: 28px;
  position: relative;
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #E6EEFF;
}

.shop-card:hover {
  transform: translateY(-6px) scale(0.83);
  box-shadow: 0 16px 32px rgba(22, 93, 255, 0.14);
}

.follow-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #165DFF;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
}

/* 店铺头像 */
.shop-avatar-box {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  cursor: pointer;
}

.shop-avatar {
  width: 140px;
  height: 140px;
 
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #E6EEFF;
  transition: 0.3s;
}

.shop-card:hover .shop-avatar {
  transform:translateY(-6px) scale(0.83);
  border-color: #165DFF;
}

/* 信息 */
.shop-info {
  text-align: center;

  margin-bottom: 20px;
}

.shop-name {
  font-size: 23px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 8px;
}

.shop-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  color: #888;
  font-size: 13px;
}

/* 按钮 */
.shop-actions {
  display: flex;
  gap: 12px;
  font-size: 18px;
}

.enter-btn,
.unfollow-btn {
  flex: 1;
  height: 44px;
  border-radius: 14px;
  font-size: 18px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
}

.enter-btn {
  background: linear-gradient(135deg, #165DFF, #409EFF);
  color: white;
}

.unfollow-btn {
  background: #F2F3F5;
  color: #666;
}

.enter-btn:hover {
  transform: translateY(-2px);
}
.unfollow-btn:hover {
  background: #FFE6E6;
  color: #FF4444;
}

/* 底部栏 */
.shop-bottom-bar {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 20px;
  padding: 20px 24px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.06);
}

.total-info {
  font-size: 16px;
  color: #333;
}
.total-info span {
  color: #165DFF;
  font-weight: bold;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.discover-btn,
.clear-all-btn {
  padding: 0 18px;
  height: 42px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.discover-btn {
  background: #E6EEFF;
  color: #165DFF;
}

.clear-all-btn {
  background: #FFF1F0;
  color: #FF4444;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 90px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  50% { transform: translateY(-10px); }
}

.empty-state h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px;
}

.empty-state p {
  color: #888;
  margin-bottom: 24px;
}

.go-discover {
  padding: 12px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, #165DFF, #409EFF);
  color: white;
  border: none;
  font-size: 15px;
  cursor: pointer;
}

/* 移动端 */
@media (max-width: 768px) {
  .shop-bottom-bar {
    flex-direction: column;
    gap: 16px;
  }
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>