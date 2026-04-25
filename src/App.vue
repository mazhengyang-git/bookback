<template>
  <!--<div class="global-wave-bg"></div>-->
  <!-- 星途科幻图书电商平台 - 根组件 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 根组件 - 无业务逻辑，仅承载路由
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  background-color: white !important;
}
/* 这里**绝对不能加 scoped**！不加才是全局生效，覆盖全项目所有样式 */
/* ========== 根治右侧粉色竖边 全局终极样式 ========== */
/* 覆盖浏览器所有滚动条，消除粉色背景 */
::-webkit-scrollbar {
  width: 8px;
  background-color: #ffffff !important;
}
::-webkit-scrollbar-thumb {
  background-color: #c9c9c9 !important;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background-color: #ffffff !important;
  background-image: none !important;
}
::-webkit-scrollbar-corner {
  background-color: #ffffff !important;
}

/* 兜底清除页面所有默认边距、溢出留白 */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: #fff !important;
}
</style>
