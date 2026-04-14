<template>
  <div class="page-container">
    <h2 style="text-align: center; margin: 30px 0">{{ title }}</h2>
    <p style="text-align: center; color: #999">页面骨架已创建，后续补充业务逻辑 ✨</p>
  </div>
</template>

<script setup lang="ts">
const title = '我的订单' // 如「科幻图书列表」「我的购物车」等
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
