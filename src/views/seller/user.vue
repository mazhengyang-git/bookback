<template>
  <div class="page-container">
    <div>
      <el-card class="user-info-card" shadow="hover">
        <template #header>
          <span class="card-title">欢迎您!</span>
        </template>

        <div class="user-info-content">
          <p>
            <span style="display: flex; align-items: center; margin-bottom: 20px">
              <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
                <el-avatar :src="showUser.avatar" size="80" />
                <div
                  v-if="isMySelf"
                  class="avatar-upload-btn"
                  @click="openAvatarDialog"
                >
                  <el-icon><Plus /></el-icon>
                </div>
              </div>

              <div>
                <h2 style="margin: 0">{{ showUser.username }}</h2>
              </div>
            </span>
          </p>

          <p class="jsjianju">
            <strong>用户角色：</strong>
            <el-tag :type="showUser.role === 'admin' ? 'danger' : 'primary'">
              {{ showUser.role === 'admin' ? '管理员' : showUser.role === 'seller' ? '卖家' : '买家' }}
            </el-tag>
          </p>
        </div>

        <!-- 卖家统计卡片 -->
        <div class="seller-stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.bookCount }}</div>
            <div class="stat-label">已上架图书</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingCount }}</div>
            <div class="stat-label">待审核申请</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥{{ Number(stats.sales || 0).toFixed(2) }}</div>
            <div class="stat-label">本月销售额</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <div class="action-card" @click="$router.push('/seller/apply')">
            <el-icon class="action-icon"><DocumentAdd /></el-icon>
            <span>发布图书</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/apply-list')">
            <el-icon class="action-icon"><List /></el-icon>
            <span>申请管理</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/orders')">
            <el-icon class="action-icon"><DocumentChecked /></el-icon>
            <span>订单管理</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/book-list')">
            <el-icon class="action-icon"><Reading /></el-icon>
            <span>已上架图书</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 头像弹窗 -->
    <el-dialog v-if="isMySelf" v-model="showAvatarDialog" title="修改头像" width="500px">
      <el-upload
        class="avatar-uploader"
        :http-request="customUpload"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
      >
        <el-avatar v-if="previewAvatar" :src="previewAvatar" size="120" />
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, DocumentAdd, List, Reading, DocumentChecked } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { getSign, uploadAvatar, getUserPublicInfo } from '@/api/front/user'
import { getSellerStats } from '@/api/seller/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const targetUsername = ref('')
const targetUser = ref({
  username: '加载中...',
  role: 'buyer',
  avatar: '',
  sign: ''
})

// 统计数据
const stats = ref({
  bookCount: 0,
  pendingCount: 0,
  sales: 0,
  orderCount: 0
})

const isMySelf = computed(() => {
  if (!targetUsername.value) return true
  return targetUsername.value === userStore.user?.username
})

const showUser = computed(() => {
  if (isMySelf.value) {
    return {
      username: userStore.user?.username || '未知用户',
      role: userStore.userRole || 'buyer',
      avatar: userStore.user?.avatar || 'https://cube.elemecdn.com/0/5/0df5cf44e51f1197950fddc469d08jpeg.jpeg',
      sign: userStore.user?.sign || '暂无签名'
    }
  }
  return targetUser.value
})

// 加载统计
const loadSellerStats = async () => {
  try {
    const res = await getSellerStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (err) {
    ElMessage.error('加载统计数据失败')
    console.error(err)
  }
}

// 加载用户信息
const loadTargetUser = async (username: string) => {
  try {
    const res = await getUserPublicInfo(username)
    if (res.code === 200) {
      targetUser.value = res.data
    } else {
      ElMessage.error('用户不存在')
      router.back()
    }
  } catch (err) {
    ElMessage.error('获取失败')
  }
}

// 头像逻辑
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}

const beforeAvatarUpload = (file: any) => {
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png'|| file.type === 'image/webp'|| file.type === 'image/x-webp'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能 JPG/PNG/webp')
  if (!isLt2M) ElMessage.error('不能超过 2MB')
  return isImg && isLt2M
}

const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    if (res.code === 200) {
      ElMessage.success('上传成功')
      userStore.user.avatar = res.data.url
      showAvatarDialog.value = false
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

onMounted(async () => {
  if (route.query.username) {
    targetUsername.value = route.query.username as string
    if (!isMySelf.value) {
      await loadTargetUser(targetUsername.value)
    }
  }

  if (userStore.isLogin) {
    const res = await getSign()
    if (res.code === 200 && userStore.user) {
      userStore.user.sign = res.data.sign
    }
    await loadSellerStats()
  }
})
</script>



<style scoped>
.jsjianju{
  position: relative;
 
}
/*全局页面*/
.page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.447), transparent 22%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.1), transparent 25%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.447), #c7c5c5);
  color: #e0e1e2;
  overflow-x: hidden;
}

/* 卡片主体 */
.user-info-card {
  width: 70%;
  height: auto; /* 改成自适应高度 */
  min-height: 520px;
  overflow: hidden;
  border: none !important;
  border-radius: 24px !important;
  background: rgba(255, 255, 255, 0.78) !important;
  backdrop-filter: blur(10px);
  margin-left: 50%;
  transform: translateX(-50.8%);
  box-shadow:
    0 20px 45px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 183, 0, 0.7);
  transition: all 0.3s ease;
}

/* 卡片标题 */
.card-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
}

/* 用户信息 */
.user-info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  height: 120px;
  margin-left: 6px;
  line-height: 3.2;
  color: #1f2937;
}
@media (max-width:1058px){
  .user-info-content{
    margin-bottom: 130px !important;
  }
}
.user-info-content p {
  min-height: 90px;
  padding: 18px;
  max-width: 390px;
  border-radius: 18px;
  background: rgba(237, 206, 200, 0.56);
  border: 1px solid rgba(64, 158, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
}

/* 卖家数据卡片 */
.seller-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
  padding: 0 18px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #165DFF;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 14px;
  color: #666;
}

/* 快捷操作入口 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
  padding: 0 18px;
}
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  background: rgba(22, 93, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-card:hover {
  background: rgba(22, 93, 255, 0.1);
  transform: translateY(-2px);
}
.action-icon {
  font-size: 24px;
  color: #165DFF;
  margin-bottom: 8px;
}

/* 标签 */
:deep(.el-tag) {
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 700;
}

/* 头像容器 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

/* 头像加号按钮 */
.avatar-upload-btn {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 上传组件样式 */
.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-info-content {
    grid-template-columns: 1fr;
  }
  .seller-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .quick-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>