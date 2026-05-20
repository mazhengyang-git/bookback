<template>
  <div class="seller-layout">
    <div class="seller-header">
      <h2 class="logo1">星途科幻 · 卖家中心</h2>
      <div class="seller-nav">
        <el-button link @click="$router.push('/seller/selleruser')">个人中心</el-button>
        <el-button link type="primary" @click="$router.push('/seller/profile')">店铺资料</el-button>
        <el-button link type="primary" @click="$router.push('/seller/apply')">发布图书</el-button>
        <el-button link type="primary" @click="$router.push('/seller/apply-list')">申请管理</el-button>
        <el-button link type="primary" @click="$router.push('/seller/orders')">订单管理</el-button>
        <el-button link type="primary" @click="$router.push('/seller/book-list')">已上架图书</el-button>
        <el-button link type="danger" @click="handleLogout">退出</el-button>
      </div>
    </div>
    <div class="seller-body">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
/* 1. logo */
.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  white-space: nowrap;
  line-height: 1.75rem;
  user-select: none !important;
  -webkit-user-select: none !important;
  flex-shrink: 0; /* logo不随窗口缩小 */
}

.seller-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 24px;
}

/* 2. 导航栏容器：可换行的弹性布局 */
.seller-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 导航整体换行 */
  gap: 16px; /* logo和导航之间的间距 */
  margin-bottom: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 3. 导航按钮容器：自动换行+均匀间距 */
.seller-nav {
  display: flex;
  flex-wrap: wrap; /* 按钮空间不足时自动换行 */
  align-items: center;
  gap: 12px; /* 换行后间距均匀 */
}

/* 4. 按钮样式优化*/
.seller-nav .el-button {
  font-weight: 600;
  white-space: nowrap; /* 按钮文字不换行 */
  flex-shrink: 0; /* 按钮不被压缩 */
}

.seller-body {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  min-height: 60vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 5. 小屏幕适配 */
@media (max-width: 768px) {
  .seller-header {
    padding: 12px 16px;
  }
  .seller-nav {
    gap: 8px;
  }
  .seller-nav .el-button {
    font-size: 14px;
    padding: 0 12px;
  }
}
</style>