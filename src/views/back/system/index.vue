<template>
  <div class="admin-container">
    <div class="admin-header">
      <h2>{{ title }}</h2>
      <el-button type="primary" @click="$router.push('/home')">返回前台</el-button>
    </div>
    <div class="admin-content">
      <p style="color: #999; text-align: center; margin-top: 50px">
        后台{{ title }}页面骨架，后续补充业务逻辑 ✨
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const title = '系统设置' // 比如「图书管理」「用户管理」等
</script>

<style scoped>
.admin-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
</style>
