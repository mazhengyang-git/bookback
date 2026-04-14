<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">星途科幻-后台管理</div>
      <el-menu
        default-active="/admin/home"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/admin/home">
          <el-icon><House /></el-icon>
          <span>后台首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/book">
          <el-icon><Books /></el-icon>
          <span>图书管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/order">
          <el-icon><ShoppingCart /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/notice">
          <el-icon><Message /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/system">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="header">
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
      <!-- 路由视图（显示子路由内容） -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus' //@ts-ignore
import { House, Books, User, ShoppingCart, Message, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 菜单切换
const handleMenuSelect = (index: string) => {
  router.push(index)
}

// 退出登录
const logout = () => {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 200px;
  background: #2e3b4e;
  color: #fff;
}
.sidebar-header {
  padding: 20px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #444;
}
.el-menu-vertical-demo {
  border-right: none;
  height: calc(100vh - 60px);
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.header {
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  background: #fff;
  text-align: right;
  border-bottom: 1px solid #eee;
}
</style>
