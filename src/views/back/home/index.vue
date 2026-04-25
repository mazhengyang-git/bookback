<template>
  <div class="admin-container">
    <!-- 装饰 -->
    <div class="decor decor-line-1"></div>
    <div class="decor decor-line-2"></div>
    <div class="decor decor-line-3"></div>
    <div class="decor decor-line-4"></div>
    <div class="decor decor-card-1"></div>
    <div class="decor decor-card-2"></div>
    <div class="decor decor-icon-1">📚</div>
    <div class="decor decor-icon-2">💻</div>
    <div class="decor decor-icon-3">📊</div>
    <div class="decor decor-icon-4">🔍</div>
    <div class="decor decor-icon-5">📝</div>
    <div class="decor decor-icon-6">🔐</div>
    <div class="decor decor-corner-1"></div>
    <div class="decor decor-corner-2"></div>
    <div class="decor decor-glow"></div>
    <div class="decor decor-glow-2"></div>

    <!-- 高级动态装饰 -->
    <div class="decor decor-rotate-light"></div>
    <!-- 旋转流光 -->
    <div class="decor decor-pulse-dot"></div>
    <!-- 脉冲光晕 -->
    <div class="decor decor-float-particle"></div>
    <!-- 浮动粒子 -->
    <div class="decor decor-grid-line"></div>
    <!-- 渐变网格 -->
    <div class="decor decor-gradient-bar"></div>
    <!-- 流动渐变条 -->
    <div class="decor decor-shine-border"></div>
    <!-- 边框扫光 -->

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
    <div class="guanli按钮">
      <button style="-webkit-user-select: none" @click="switchTab('notice')">公告管理</button>
      <button style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('user')">
        用户信息
      </button>
      <button style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('bookguan')">
        商品管理
      </button>
      <button style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('orderguan')">
        订单管理
      </button>
      <button style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('bookpaihang')">
        图书排行
      </button>
      <button style="-webkit-user-select: none; margin-top: 20px" @click="switchTab('newbook')">
        新书速递
      </button>
      <button
        link
        @click="switchTab('useradmin')"
        style="
          color: black;
          -webkit-user-select: none;
          margin-top: 20px;
          padding: 9px;
          width: 84px;
          margin-left: -3px;
        "
      >
        <img
          style="width: 18px; height: auto; position: relative; top: 5px"
          src="/img/个人中心.png"
        />个人中心
      </button>
    </div>

    <!-- 管理显示区域 -->
    <div class="guanli显示区域">
      <div class="sub-page-container notice-container" v-if="activeTab === 'notice'">
        <notice />
      </div>
      <div class="sub-page-container user-container" v-if="activeTab === 'user'">
        <userment />
      </div>
      <div class="sub-page-container bookguan" v-if="activeTab === 'bookguan'">
        <bookdetail />
      </div>
      <div class="sub-page-container bookguan" v-if="activeTab === 'useradmin'">
        <useradmin />
      </div>
      <div class="sub-page-container bookguan" v-if="activeTab === 'orderguan'">
        <orderadmin />
      </div>
      <div class="sub-page-container bookguan" v-if="activeTab === 'bookpaihang'">
        <bookpai />
      </div>
      <div class="sub-page-container bookguan" v-if="activeTab === 'newbook'">
        <newbook />
      </div>
    </div>

    <div class="router-view-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import notice from '@/views/back/notice/index.vue'
import userment from '@/views/back/userment/index.vue'
import bookdetail from '@/views/back/book/index.vue'
import newbook from '@/views/back/book/newbook.vue'
import orderadmin from '@/views/back/order/index.vue'
import useradmin from '@/views/back/user/index.vue'
import bookpai from '@/views/back/book/bookpaihang.vue'
const title = '后台首页'
const userStore = useUserStore()
const router = useRouter()

const activeTab = ref('notice')

const switchTab = (
  tab: 'notice' | 'user' | 'bookguan' | 'useradmin' | 'orderguan' | 'bookpaihang' | 'newbook',
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
.admin-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  overflow: visible;
  background-color: #f8f9fa;
  min-height: 100vh;
  height: 1400px;
}

/*
顶部导航栏
*/
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px 120px;
  margin-bottom: 20px;
  width: 100%;
  /* 高级蓝紫渐变背景 */
  background: linear-gradient(180deg, #4e73df 10%, #224abe 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(78, 115, 223, 0.2);
  position: relative;
  overflow: hidden;
  -webkit-user-select: none;
}
/* 导航栏文字白色+阴影 */
.admin-header h2 {
  color: #ffffff !important;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}
/* 导航栏柔光装饰 */
.admin-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: headerShine 6s infinite linear;
  z-index: 1;
}
@keyframes headerShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.guanli按钮 {
  position: absolute;
  left: 20px;
  top: 100px;
  width: 90px;
  flex: none;
  display: grid;
  background: linear-gradient(180deg, #e8e9ed 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  height: auto;
  padding: 12px 6px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.guanli按钮 button {
  width: 80px;
  padding: 10px 6px;
  border: none;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  font-size: clamp(12px, 1vw, 14px);
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}
.guanli按钮 button:hover {
  background-color: #4e73df;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 115, 223, 0.3);
}

.el-button {
  box-shadow: 0 2px 6px rgba(78, 115, 223, 0.15) !important;
  transition: all 0.3s ease !important;
  z-index: 2;
  position: relative;
}
.el-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(78, 115, 223, 0.25) !important;
}

.guanli显示区域 {
  background: linear-gradient(-135deg, #dfdede 25%, #e9ecef 50%, #f3f3f3 25%);
  border-radius: 12px;
  position: absolute;
  left: 120px;
  top: 100px;
  overflow: hidden;
  z-index: 5;
  height: 1300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.sub-page-container {
  width: 1000px;
  height: 100%;
  overflow-x: hidden;
  padding: 20px;
  z-index: 10;
  background: linear-gradient(-135deg, #dfdede 25%, #e9ecef 50%, #f3f3f3 25%);
  border-radius: 8px;
  align-items: flex-start;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.sub-page-container::-webkit-scrollbar {
  width: 8px;
}
.sub-page-container::-webkit-scrollbar-thumb {
  background: #86909c;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.sub-page-container::-webkit-scrollbar-thumb:hover {
  background: #4e5969;
}
.sub-page-container::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.router-view-container {
  margin-top: 620px;
  margin-left: 120px;
  width: clamp(800px, 70vw, 800px);
  min-height: 200px;
  z-index: 1;
}

.bookguan {
}

/* 基础装饰 */
.admin-container::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(78, 115, 223, 0.03) 0%, transparent 70%);
  top: 150px;
  right: 50px;
  z-index: 1;
  pointer-events: none;
}
.admin-container::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(69, 165, 255, 0.03) 0%, transparent 70%);
  bottom: 100px;
  left: 100px;
  z-index: 1;
  pointer-events: none;
}

.guanli按钮::before {
  content: '';
  width: 60%;
  height: 3px;
  background: #4e73df;
  border-radius: 3px;
  margin: 0 auto 8px;
  opacity: 0.8;
}

.guanli显示区域::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.05) 0%, transparent 50%);
  border-bottom-right-radius: 12px;
  z-index: 6;
  pointer-events: none;
}

/* 
原有装饰样式
*/
.decor {
  position: absolute;
  pointer-events: none;
  z-index: 40;
}

.decor-line-1 {
  top: 95px;
  left: 120px;
  width: 200px;
  height: 3px;
  background: linear-gradient(90deg, rgba(78, 115, 223, 0.3), transparent);
  border-radius: 2px;
}
.decor-line-2 {
  top: 95px;
  right: 120px;
  width: 200px;
  height: 3px;
  background: linear-gradient(-90deg, rgba(69, 165, 255, 0.3), transparent);
  border-radius: 2px;
}
.decor-line-3 {
  bottom: 95px;
  left: 120px;
  width: 200px;
  height: 3px;
  background: linear-gradient(90deg, rgba(78, 115, 223, 0.3), transparent);
  border-radius: 2px;
}
.decor-line-4 {
  bottom: 95px;
  right: 120px;
  width: 200px;
  height: 3px;
  background: linear-gradient(-90deg, rgba(69, 165, 255, 0.3), transparent);
  border-radius: 2px;
}

.decor-card-1 {
  left: 130px;
  top: 150px;
  width: 80px;
  height: 80px;
  background: rgba(78, 115, 223, 0.06);
  border-radius: 10px;
  transform: rotate(-15deg);
}
.decor-card-2 {
  right: 80px;
  top: 100px;
  width: 70px;
  height: 70px;
  background: rgba(69, 165, 255, 0.06);
  border-radius: 10px;
  transform: rotate(10deg);
}

.decor-icon-1 {
  top: 105px;
  left: 130px;
  font-size: 24px;
  color: rgba(78, 115, 223, 0.4);
  animation: floatIcon 3s ease-in-out infinite;
}
.decor-icon-2 {
  top: 105px;
  right: 133px;
  font-size: 22px;
  color: rgba(69, 165, 255, 0.4);
  animation: floatIcon 4s ease-in-out infinite reverse;
}
.decor-icon-3 {
  top: 150px;
  right: 130px;
  font-size: 24px;
  color: rgba(78, 115, 223, 0.4);
  animation: floatIcon 3.5s ease-in-out infinite;
}
.decor-icon-4 {
  bottom: 150px;
  left: 130px;
  font-size: 22px;
  color: rgba(69, 165, 255, 0.4);
  animation: floatIcon 4.5s ease-in-out infinite reverse;
}
.decor-icon-5 {
  bottom: 150px;
  left: 180px;
  font-size: 22px;
  color: rgba(78, 115, 223, 0.4);
  animation: floatIcon 3.8s ease-in-out infinite;
}
.decor-icon-6 {
  bottom: 150px;
  right: 130px;
  font-size: 20px;
  color: rgba(69, 165, 255, 0.4);
  animation: floatIcon 4.2s ease-in-out infinite reverse;
}

.decor-corner-1 {
  top: 0;
  left: 120px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(78, 115, 223, 0.08) 0%, transparent 50%);
  border-bottom-right-radius: 12px;
}
.decor-corner-2 {
  top: 0;
  right: 80px;
  width: 60px;
  height: 60px;
  background: linear-gradient(-135deg, rgba(78, 115, 223, 0.08) 0%, transparent 50%);
  border-bottom-left-radius: 12px;
}

.decor-glow {
  left: 120px;
  bottom: 100px;
  width: 1000px;
  height: 250px;
  background: radial-gradient(ellipse, rgba(78, 115, 223, 0.03) 0%, transparent 70%);
  border-radius: 50%;
}
.decor-glow-2 {
  left: 120px;
  top: 100px;
  width: 1000px;
  height: 250px;
  background: radial-gradient(ellipse, rgba(69, 165, 255, 0.03) 0%, transparent 70%);
  border-radius: 50%;
}

.guanli显示区域::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 20px;
  background: linear-gradient(90deg, transparent, rgba(78, 115, 223, 0.1), transparent);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 40;
  pointer-events: none;
  animation: lightMove 4s linear infinite;
}

@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
@keyframes lightMove {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.guanli按钮::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4px;
  background: #4e73df;
  border-radius: 3px;
  z-index: 40;
  pointer-events: none;
}

.admin-container::before {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(78, 115, 223, 0.04) 0%, transparent 70%);
  z-index: 40;
}
.admin-container::after {
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(69, 165, 255, 0.04) 0%, transparent 70%);
  z-index: 40;
}

/*
高级CSS动态装饰
*/
/* 1. 旋转流光环 */
.decor-rotate-light {
  top: 105px;
  right: 240px;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(78, 115, 223, 0.1);
  border-left-color: #4e73df;
  border-radius: 50%;
  animation: rotate 8s linear infinite;
}
/* 2. 脉冲呼吸光晕 */
.decor-pulse-dot {
  bottom: 100px;
  left: 200px;
  width: 60px;
  height: 60px;
  background: rgba(69, 165, 255, 0.1);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}
/* 3. 缓慢浮动粒子 */
.decor-float-particle {
  top: 400px;
  left: 150px;
  width: 12px;
  height: 12px;
  background: #4e73df;
  border-radius: 50%;
  opacity: 0.4;
  animation: floatParticle 6s ease-in-out infinite;
}
/* 4. 渐变网格线条 */
.decor-grid-line {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background-image:
    linear-gradient(rgba(78, 115, 223, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(78, 115, 223, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}
/* 5. 横向流动渐变条 */
.decor-gradient-bar {
  top: 80px;
  left: 120px;
  width: 900px;
  height: 4px;
  background: linear-gradient(90deg, #4e73df, #f8f8f8, #4e73df);
  border-radius: 2px;
  animation: gradientFlow 4s linear infinite;
}
/* 6. 角落扫光边框 */
.decor-shine-border {
  bottom: 50px;
  right: 50px;
  width: 100px;
  height: 100px;
  border: 2px solid transparent;
  background: linear-gradient(45deg, transparent, rgba(188, 194, 209, 0.53)) border-box;
  border-radius: 8px;
  animation: shine 3s linear infinite;
}

/* 新增动画 */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
    width: 80px;
    height: 80px;
  }
  25% {
    width: 90px;
    height: 90px;
  }
  50% {
    width: 100px;
    height: 100px;
  }
  75% {
    width: 90px;
    height: 90px;
  }
  100% {
    width: 80px;
    height: 80px;
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}
@keyframes floatParticle {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-30px) translateX(15px);
  }
}
@keyframes gradientFlow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 900px 0;
  }
}
@keyframes shine {
  0% {
    background-position: 0 0;
  }
  25% {
    transform: translateX(-25%);
  }
  50% {
    transform: translateX(-37.5%);
  }
  75% {
    transform: translateX(-25%);
  }
  100% {
    background-position: 200% 200%;
    transform: translateX(0);
  }
}

/* 媒体查询（原有不变） */
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
