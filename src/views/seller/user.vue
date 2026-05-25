<template>
  <div class="page-container">
    <div>

      <el-card class="user-info-card" shadow="hover">
        <template #header>
          <div
                  v-if="showUser.is_seller_banned == 1"
                  style="margin-top: 8px; color: #f53f3f; font-weight: 600; font-size: 15px;white-space: nowrap;position: absolute;margin-left: 120px;"
                >
                  申诉电话29931901310
                </div>
          <span class="card-title">欢迎您!</span>
        </template>

        <div class="user-info-content">
          <p>
            <span style="display: flex; align-items: center; margin-bottom: 20px">
              <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
                <el-avatar :src="showUser.avatar" size="80" />
                <div v-if="isMySelf" class="avatar-upload-btn" @click="openAvatarDialog">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>

              <div>
                <h2 style="margin: 0">{{ showUser.username }}</h2>

                <!-- 红色警告提示 -->
                <div
                  v-if="showUser.is_seller_banned == 1"
                 class="xzwy" style="margin-top: 8px; color: #f53f3f; font-weight: 600; font-size: 15px;white-space: nowrap;position: absolute;"
                >
                  ⚠️ 您的账户已被管理员限制,新增或编辑图书权限已受限
                </div>
               
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

        <!-- 卖家统计 -->
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
          <div
            class="action-card"
            @click="handleApply"
            :style="{ opacity: showUser.is_seller_banned == 1 ? 0.5 : 1, cursor: showUser.is_seller_banned == 1 ? 'not-allowed' : 'pointer' }"
          >
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
      <el-upload class="avatar-uploader" :http-request="customUpload" :show-file-list="false" :before-upload="beforeAvatarUpload">
        <el-avatar v-if="previewAvatar" :src="previewAvatar" size="120" />
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, DocumentAdd, List, Reading, DocumentChecked } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { uploadAvatar, getUserPublicInfo } from '@/api/front/user'
import { getSellerStats } from '@/api/seller/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const targetUsername = ref('')
const stats = ref({ bookCount: 0, pendingCount: 0, sales: 0, orderCount: 0 })
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

// 每 2.5 秒自动拉取最新用户状态（实时同步限制）
let refreshTimer: number | null = null
const AUTO_REFRESH_INTERVAL = 2500

const isMySelf = computed(() => !targetUsername.value || targetUsername.value === userStore.user?.username)

const showUser = computed(() => {
  if (isMySelf.value) {
    return {
      ...userStore.user,
      username: userStore.user?.username || '未知用户',
      role: userStore.userRole || 'buyer',
      is_seller_banned: userStore.user?.is_seller_banned || 0
    }
  }
  return userStore.user || {}
})

// 点击发布图书
const handleApply = () => {
  if (showUser.value.is_seller_banned == 1) {
    ElMessage.error('您的账户已被限制，无法发布图书')
    return
  }
  router.push('/seller/apply')
}

// 加载统计
const loadSellerStats = async () => {
  try {
    const res = await getSellerStats()
    if (res.code === 200) stats.value = res.data
  } catch (e) { ElMessage.error('暂无统计数据') }
}

// 后端拉最新用户状态
const refreshUserInfo = async () => {
  try {
    const res = await getUserPublicInfo(userStore.user.username)
    if (res.code === 200) {
      const oldStatus = userStore.user.is_seller_banned
      userStore.user.is_seller_banned = res.data.is_seller_banned

      // 状态变化时提示
      if (oldStatus !== res.data.is_seller_banned) {
        if (res.data.is_seller_banned == 1) {
          ElMessage.warning('您的账户已被管理员限制')
        } else {
          ElMessage.success('您的账户限制已解除')
        }
      }
    }
  } catch (e) {
    console.error('刷新用户信息失败', e)
  }
}

// 自动轮询后端状态
onMounted(async () => {
  if (route.query.username) targetUsername.value = route.query.username

  // 进入页面先拉一次
  await refreshUserInfo()
  await loadSellerStats()

  // 每 2.5 秒自动同步一次
  refreshTimer = window.setInterval(async () => {
    await refreshUserInfo()
  }, AUTO_REFRESH_INTERVAL)

  
})
// 页面销毁清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
// 头像逻辑
const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type.includes('image')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能上传图片')
  if (!isLt2M) ElMessage.error('不能超过 2MB')
  return isImg && isLt2M
}
const customUpload = async (options) => {
  try {
    const res = await uploadAvatar(options.file)
    if (res.code === 200) {
      ElMessage.success('上传成功')
      userStore.user.avatar = res.data.url
      showAvatarDialog.value = false
    }
  } catch (e) { ElMessage.error('上传失败') }
}
</script>


<style scoped>
.xzwy{

}
@media (max-width:768px) {
  .xzwy{
    left: 42px;
    z-index: 9;
  transform: translateY(-29px);
  }

}
.jsjianju{ position: relative; margin-left: 100px;}
@media (max-width:768px) {
  .jsjianju{margin-left: 0px;}
}
.jsjianju1{ position: relative; }
.page-container {
  width: 100%; max-width: 1280px; margin: 0 auto; padding: 24px; min-height: 100vh;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.45), transparent 22%),
              radial-gradient(circle at bottom left, rgba(255,255,255,0.1), transparent 25%),
              linear-gradient(135deg, rgba(255,255,255,0.45), #c7c5c5);
  color: #e0e1e2; overflow-x: hidden;
}
.user-info-card {
  min-height: 626px;
   border-radius: 24px;
  
 
  box-shadow: 0 20px 45px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,183,0,0.7);
}
.card-title { font-size: 26px; font-weight: 800; color: #111827; }
.user-info-content {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr));
  gap: 18px; height: 120px; margin-left: 6px; line-height: 3.2; color: #1f2937;
}
.user-info-content p {
  min-height: 90px; padding: 18px; max-width: 390px; border-radius: 18px;
  background: rgba(237,206,200,0.56); border: 1px solid rgba(64,158,255,0.08);
}
.seller-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin: 20px 0; padding: 0 18px; }
@media (max-width:768px) {
  .seller-stats-grid{
    position: relative;
    left: -19px;
    z-index: 9;
  transform: translateY(69px);
  }
  
}

.stat-card { background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; text-align: center; }
.stat-value { font-size: 24px; font-weight: 700; color: #165DFF; margin-bottom: 4px; }
.stat-label { font-size: 14px; color: #666; }
.quick-actions { display: flex; justify-content: space-around; margin-top: 24px; padding: 0 18px; }
@media (max-width:768px) {
  .quick-actions {
    position: relative;
    left: -16px;
    z-index: 9;
  transform: translateY(29px);
  }
  
}
.action-card {
  display: flex; flex-direction: column; align-items: center; padding: 16px 24px;
  background: rgba(22,93,255,0.05); border-radius: 12px; cursor: pointer;
}
.action-card:hover { background: rgba(22,93,255,0.1); transform: translateY(-2px); }
.action-icon { font-size: 24px; color: #165DFF; margin-bottom: 8px; }
:deep(.el-tag) { border-radius: 999px; padding: 0 14px; font-weight: 700; }
.avatar-wrapper { position: relative; cursor: pointer; }
.avatar-upload-btn {
  position: absolute; right: -5px; bottom: -5px; width: 20px; height: 20px;
  background: #409eff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px;
}
.avatar-uploader { display: flex; justify-content: center; }
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9; border-radius: 50%; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.upload-icon { font-size: 32px; color: #c0c4cc; }
</style>