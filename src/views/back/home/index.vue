<template>
  <div class="admin-container">
    <!-- 装饰 -->
    <div class="bg-decoration">
      <div class="blur-circle blur-1"></div>
      <div class="blur-circle blur-2"></div>
      <div class="grid-bg"></div>

    
    </div>

    <!-- 顶部导航栏 -->
    <div class="admin-header">
      <span
        style="
          position: relative;
          color: white;
          font-size: 20px;
          white-space: nowrop;
          font-weight: 700;
          z-index: 3000 !important;
          position: absolute;
          display: block;
          right: 10px;
        "
        >欢迎：管理员 {{ userStore.user?.username }}</span
      >
      <h2>{{ title }}</h2>
      <el-button style="position: absolute; left: 20px" type="primary" @click="goToFront"
        >返回前台</el-button
      >
    </div>

    <!-- 管理按钮 -->
     <div class="anniugj">
    <div class="guanli按钮">
      <button :class="{active: activeTab === 'notice'}" class="an1" style="-webkit-user-select: none" @click="switchTab('notice')">公告管理</button>
      <button :class="{active: activeTab === 'user'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('user')">
        用户信息
      </button>
      <button :class="{active: activeTab === 'bookguan'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('bookguan')">
        商品管理
      </button>
      <button :class="{active: activeTab === 'orderguan'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('orderguan')">
        订单管理
      </button>
      <button :class="{active: activeTab === 'bookpaihang'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('bookpaihang')">
        图书排行
      </button>
      <button :class="{active: activeTab === 'newbook'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('newbook')">
        新书速递
      </button>
      <button :class="{active: activeTab === 'huodongzixun'}" class="an1" style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('huodongzixun')">
        活动资讯
      </button>
      <button
        link
        @click="switchTab('useradmin')"
        style="
        
          -webkit-user-select: none;
          margin-top: 20px;
          padding: 9px;
          width: 86px;
          margin-left: -3.6px;
          padding-right:3px;
          "
          class="an1"
        :class="{active: activeTab === 'useradmin'}"
      >
        <img
          style="width: 18px; height: auto; position: relative; top: 5px"
          src="/img/个人中心.png"
        />个人中心
      </button>
    </div>
</div>
    <!-- 管理显示区域 -->
    <div class="guanli显示区域">
      <div class="sub-page-container notice-container" v-show="activeTab === 'notice'">
        <notice />
      </div>
      <div class="sub-page-container user-container" v-show="activeTab === 'user'">
        <userment />
      </div>
      <div class="sub-page-container bookguan" v-show="activeTab === 'bookguan'">
        <bookdetail />
      </div>
      <div class="sub-page-container bookguan" v-show="activeTab === 'useradmin'">
        <useradmin />
      </div>
      <div class="sub-page-container bookguan" v-show="activeTab === 'orderguan'">
        <orderadmin />
      </div>
      <div class="sub-page-container bookguan" v-show="activeTab === 'bookpaihang'">
        <bookpai />
      </div>
      <div class="sub-page-container bookguan" v-show="activeTab === 'newbook'">
        <newbook />
      </div>
       <div class="sub-page-container bookguan" v-show="activeTab === 'huodongzixun'">
        <huodongzx />
      </div>
    </div>

    <div class="router-view-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElDialog } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 引入组件
import notice from '@/views/back/notice/index.vue'
import userment from '@/views/back/userment/index.vue'
import bookdetail from '@/views/back/book/index.vue'
import newbook from '@/views/back/book/newbook.vue'
import orderadmin from '@/views/back/order/index.vue'
import useradmin from '@/views/back/user/index.vue'
import bookpai from '@/views/back/book/bookpaihang.vue'
import huodongzx from '@/views/back/huodongzx/huodongzx.vue'

// 全局禁用 Dialog 滚动锁定 + 强制解锁 body 滚动
onMounted(() => {
  // 1. 禁用 Dialog 默认的滚动锁定
  ElDialog.props.lockScroll.default = false;
  // 2. 强制移除 Element 遮罩层的滚动锁定样式
  document.body.style.overflow = 'auto';
  // 3. 监听 Dialog 打开/关闭事件，确保始终解锁
  const observer = new MutationObserver(() => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0'; 
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
});


const title = '后台首页'
const userStore = useUserStore()
const router = useRouter()
const activeTab = ref('notice')

const switchTab = (
  tab: 'notice' | 'user' | 'bookguan' | 'useradmin' | 'orderguan' | 'bookpaihang' | 'newbook' | 'huodongzixun',
) => {
  activeTab.value = activeTab.value === tab ? '' : tab
}

const goToFront = () => {
  try {
    userStore.logout()
    ElMessage.success('已退出管理员账号，返回前台')
    router.push('/home')
  } catch (err) {
    console.error('退出登录失败：', err)
    ElMessage.error('退出失败，强制返回前台')
    router.push('/home')
  }
}
</script>
<style scoped>
.anniugj{
  position: fixed;
  z-index: 100;
}
/* 全局基础样式 */
* {
  box-sizing: border-box;
}
.an1{
  font-weight: 700;
}
.an1.active{
 background: linear-gradient(135deg, #4e73df, #6ea8ff) !important;
  color: #fff !important;
  box-shadow: 0 10px 25px rgba(78, 115, 223, 0.28) !important;
}
.an1:hover {
  transform: translateX(4px);
  background: rgba(78, 115, 223, 0.08) !important;
  color: #4e73df !important;
  box-shadow: none !important;
}
/* 容器 */
.admin-container {
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  overflow: visible;
  /* 参考代码玻璃渐变背景 */
  background: radial-gradient(circle at top right, rgba(78, 115, 223, 0.15), transparent 22%),
              radial-gradient(circle at bottom left, rgba(94, 95, 95, 0.1), transparent 25%),
              linear-gradient(135deg, #f4f7ff, #eef3ff);
  margin-bottom: 3px;
  padding-bottom: 20px;
  height: 1420px;
}

/* 背景动态装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}
.blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}
.blur-1 {
  top: -120px;
  right: -120px;
  width: 300px;
  height: 300px;
  background: rgba(93, 94, 95, 0.18);
}
.blur-2 {
  left: -100px;
  bottom: -100px;
  width: 260px;
  height: 260px;
  background: rgba(125, 128, 129, 0.12);
}
.grid-bg {
  position: absolute;
  inset: 0;
  opacity: 0.25;
  background-image: linear-gradient(rgba(89, 90, 93, 0.452) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(12, 14, 20, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}
.floating {
  position: absolute;
  font-size: 34px;
  opacity: 0.2;
  animation: float 5s ease-in-out infinite;
}
.floating-book {
  top: 140px;
  left: 120px;
}
.floating-lock {
  right: 120px;
  bottom: 140px;
}
.floating-star {
  top: 300px;
  right: 220px;
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

/*顶部导航栏*/
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px 120px;
  margin-bottom: 20px;
  width: 110%;
  margin-left: -5%;
  /* 玻璃拟态样式 */
  background: rgba(247, 239, 228, 0.72);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 35px rgba(22, 22, 22, 0.205), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
  -webkit-user-select: none;
  border-radius: 24px;
}
.admin-header h2 {
  color: #1f2937 !important;
  margin: 0;
  font-weight: 600;
  position: relative;
  z-index: 2;
}
.admin-header span {
  color: #111827 !important;
}

/* 左侧菜单按钮 */
.guanli按钮 {
  position: absolute;
  left: -18.5px;
  top: 0px;
  width: 90px;
  flex: none;
  display: grid;
  /* 玻璃拟态 */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(18px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  z-index: 10;
  height: auto;
  padding: 12px 6px;
  border-radius: 24px;
  transition: all 0.3s ease;
}
.guanli按钮 button {
  width: 80px;
  padding: 10px 6px;
  border: none;
  border-radius: 16px;
  background: rgba(245, 247, 255, 0.9);
  cursor: pointer;
  white-space: nowrap;
  font-size: clamp(12px, 1vw, 14px);
  color: #374151;
  transition: all 0.25s ease;
}

/* Element按钮样式 */
.el-button {
  border: none !important;
  background: linear-gradient(135deg, #4e73df, #6ea8ff) !important;
  box-shadow: 0 8px 22px rgba(78, 115, 223, 0.25) !important;
  transition: all 0.25s ease !important;
  z-index: 2;
  position: relative;
}
.el-button:hover {
  transform: translateY(-2px) !important;
}
:deep(.el-button--primary) {
  border: none !important;
}

/* 内容显示区域 */
.guanli显示区域 {
  /* 玻璃拟态 */
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  position: absolute;
  left: 120px;
  top: 100px;
  overflow: hidden;
  z-index: 5;
  height: 1300px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* 子页面容器 */
.sub-page-container {
  width: 1060px;
  height: 100%;
  overflow-x: hidden;
  padding: 20px;
  z-index: 10;
  /* 玻璃渐变背景 */
  background: linear-gradient(135deg, rgba(244, 247, 255, 0.85), rgba(255, 255, 255, 0.95));
  border-radius: 8px;
  align-items: flex-start;
}
/* 滚动条样式 */
.sub-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(78, 115, 223, 0.45);
  height: 12px;
}
.sub-page-container::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(78, 115, 223, 0.45);
}
.sub-page-container::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 路由容器 */
.router-view-container {
  margin-top: 620px;
  margin-left: 120px;
  width: clamp(800px, 70vw, 800px);
  min-height: 200px;
  z-index: 1;
}

/* 响应式缩放逻辑 */
@media (max-width: 1200px) {
  .guanli显示区域 {
    justify-content: flex-start;
  }
  .sub-page-container {
    transform: scale(0.9);
    margin-left: -50px;
    margin-top: -80px;
  }
}
@media (max-width: 1100px) {
  .sub-page-container {
    transform: scale(0.8);
    margin-left: -90px;
    margin-top: -130px;
  }
}
@media (max-width: 1050px) {
  .sub-page-container {
    transform: scale(0.75);
    margin-left: -120px;
    margin-top: -160px;
  }
}
@media (max-width: 1000px) {
  .guanli显示区域 {
    width: clamp(1800px, 65vw, 1800px);
    left: 100px;
  }
  .sub-page-container {
    transform: scale(0.75);
    margin-left: -115px;
    margin-top: -160px;
  }
  .router-view-container {
    width: clamp(1800px, 65vw, 1800px);
    margin-left: 100px;
  }
}
@media (max-width: 900px) {
  .sub-page-container {
    transform: scale(0.7);
    margin-left: -138px;
    margin-top: -195px;
  }
}
@media (max-width: 870px) {
  .sub-page-container {
    transform: scale(0.65);
    margin-left: -165px;
    margin-top: -230px;
  }
}
@media (max-width: 820px) {
  .sub-page-container {
    transform: scale(0.6);
    margin-left: -185px;
    margin-top: -260px;
  }
}
@media (max-width: 760px) {
  .sub-page-container {
    transform: scale(0.59);
    margin-left: -200px;
    margin-top: -275px;
  }
}
@media (max-width: 690px) {
  .sub-page-container {
    transform: scale(0.55);
    margin-left: -220px;
    margin-top: -295px;
  }
}
@media (max-width: 600px) {
  .sub-page-container {
    transform: scale(0.5);
    margin-left: -240px;
    margin-top: -325px;
  }
}
@media (max-width: 576px) {
  .item {
    flex-direction: column;
    align-items: flex-start;
  }
  .btns {
    align-self: flex-end;
  }
}
</style>


