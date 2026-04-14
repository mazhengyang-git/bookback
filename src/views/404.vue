<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面走丢啦 😢</p>
    <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.not-found h1 {
  font-size: 80px;
  color: #409eff;
}

.not-found p {
  font-size: 20px;
  color: #666;
}
</style>
