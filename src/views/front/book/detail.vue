<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>

  <!-- 纯CSS波浪流动背景（无SVG，无报错） -->
  <div class="wave-bg"></div>

  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo1 sci-fi-title1">星途科幻图书</h2>
    </div>
    <div class="nav-center1">
      <div class="sejb">
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        </div>
      </div>
      <div class="sejb" @mouseenter="mouseshow" @mouseleave="mouseleve">
        <div class="syws">
          <el-button link class="syses" @click="go('/books')">图书商城</el-button>
          <span class="acwy">
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=软科幻')"
              >软科幻</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=硬科幻')"
              >硬科幻</el-button
            >
          </span>
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <div v-if="!userStore.isLogin">
        <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
      </div>
      <div v-else class="login-bar">
        <span class="welcome-text">欢迎：{{ userStore.user?.username }}</span>
        <el-button link @click="$router.push('/user')">
          <img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心
        </el-button>
        <el-button link @click="$router.push('/cart')">
          <img style="width: 24px; height: auto" src="/img/购物车.png" />购物车
        </el-button>
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>
  </div>

  <div v-if="book" class="book-detail-container">
    <div class="book-detail-content">
      <div class="book-detail-cover" ref="coverRef">
        <!--@vue-ignore-->
        <el-image
          :src="book.cover || '/img/default-book.jpg'"
          referrerpolicy="no-referrer"
          alt="图书封面"
          :preview-src-list="[book.cover || '/img/default-book.jpg']"
          fit="cover"
          @show="handlePreviewShow"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
      </div>

      <div class="book-detail-info">
        <h1 class="book-detail-name">{{ book.name || '未知图书' }}</h1>
        <p class="book-detail-author">作者：{{ book.author || '未知作者' }}</p>
        <p class="book-detail-category">分类：{{ book.category || '未知分类' }}</p>
        <p class="book-detail-price">¥{{ formatPrice(book.price) }}</p>
        <p class="book-detail-stock">库存：{{ book.stock || 0 }}本</p>
        <div class="book-detail-count">
          <el-input-number v-model="buyCount" :min="1" :max="book.stock || 1" label="购买数量" />
        </div>
        <el-button
          type="primary"
          size="large"
          class="add-cart-btn"
          @click="addToCart"
          :disabled="!userStore.token"
        >
          {{ userStore.token ? '加入购物车' : '加入购物车? 请先登录' }}
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 13px"
          class="add-cart-btn1"
          size="large"
          @click="handlePay"
        >
          去支付
        </el-button>
      </div>
    </div>

    <div class="book-detail-desc">
      <h3>图书简介</h3>
      <p
        ref="descRef"
        class="desc-content"
        :class="{ expanded: isDescExpanded }"
        style="text-indent: 2em; white-space: pre-wrap"
      >
        {{ book.desc || '暂无简介' }}
      </p>
      <el-button
        v-if="showDescExpand"
        link
        class="expand-btn"
        @click="isDescExpanded = !isDescExpanded"
      >
        {{ isDescExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <div class="book-detail-desc1">
      <h3>目录展示</h3>
      <p
        ref="muluRef"
        class="mulu-content"
        :class="{ expanded: isMuluExpanded }"
        style="text-indent: 2em; white-space: pre-wrap"
      >
        {{ book.mulu || '暂无目录' }}
      </p>
      <el-button
        v-if="showMuluExpand"
        link
        class="expand-btn"
        @click="isMuluExpanded = !isMuluExpanded"
      >
        {{ isMuluExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <div class="book-detail-desc2">
      <h3>作者简介</h3>
      <p
        ref="muluRef1"
        class="mulu-content1"
        :class="{ expanded: isMuluExpanded1 }"
        style="text-indent: 2em; white-space: pre-wrap"
      >
        <!--@vue-ignore-->
        {{ book.author_into || '暂无简介' }}
      </p>
      <el-button
        v-if="showMuluExpand1"
        link
        class="expand-btn1"
        @click="isMuluExpanded1 = !isMuluExpanded1"
      >
        {{ isMuluExpanded1 ? '收起' : '展开全部' }}
      </el-button>
    </div>
  </div>

  <div v-else class="loading-tip">
    {{ loading ? '加载中...' : '未找到该图书' }}
  </div>
</template>

<style scoped>
/* 基础响应式配置 */
:root {
  font-size: 16px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-leave-to {
  opacity: 0;
}
.black-mask {
  position: fixed;
  inset: 0;
  background: #eae8e8;
  z-index: 19999;
}

/* 顶部导航 - 完全恢复原始样式 */
.home-top-nav {
  width: 100%;
  height: 3.75rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 0.0625rem solid rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 999 !important;
}
@media (max-width: 768px) {
  .home-top-nav {
    height: auto;
    flex-wrap: wrap;
    padding: 0.625rem;
  }
}

.sejb {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  z-index: 9996 !important;
}

/* 下拉菜单容器 - 原始样式 */
.acwy {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0px;
}

/* 下拉按钮 - 完全恢复原始位置 */
.ac1,
.ac2 {
  width: clamp(101px, 10vw, 109px) !important;
  padding: 9px 20px !important;
  height: auto !important;
  text-align: center;
  box-sizing: border-box;
  border-radius: 0;
}
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  position: relative;
  left: 6px;
}
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px;
  position: relative;
  left: -5.95px;
}

/* 图书详情容器 - 原始样式 */
.book-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem;
  background-color: #b8b6b6;
  color: #fff;
  min-height: 101vh;
  position: relative;
  overflow: visible;
}
@media (max-width: 768px) {
  .book-detail-container {
    padding: 0.625rem;
  }
}

.book-detail-content {
  display: flex;
  gap: 1.875rem;
  margin-bottom: 2.5rem;
  padding: 1.25rem;
  background: linear-gradient(90deg, #f0f2f5 25%, #d8d6d5 58%, #f0f2f5 25%);
  background-attachment: fixed;
  background-size: cover;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
@media (max-width: 768px) {
  .book-detail-content {
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.9375rem;
  }
}

/* 图书封面 - 原始样式 */
.book-detail-cover {
  width: 20rem;
  aspect-ratio: 3.5/5;
  border-radius: 0.5rem;
  border: 0.0625rem solid #34495e;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  height: auto;
}
@media (max-width: 768px) {
  .book-detail-cover {
    width: 100%;
    max-width: 12rem;
    margin: 0 auto;
  }
}
.book-detail-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
  user-select: none !important;
}
.book-detail-cover :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
}

/* 图书信息 - 原始样式 */
.book-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.625rem 0;
}
.book-detail-name {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: bold;
  left: -3px;
  margin-bottom: 0.9375rem;
  color: #000000;
}
@media (max-width: 768px) {
  .book-detail-name {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    text-align: center;
  }
}

.book-detail-author,
.book-detail-category,
.book-detail-stock {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #1e1e1e;
  font-weight: 600;
  margin-bottom: 0.625rem;
  user-select: none !important;
}
@media (max-width: 768px) {
  .book-detail-author,
  .book-detail-category,
  .book-detail-stock {
    text-align: center;
  }
}

.book-detail-price {
  font-size: clamp(1.75rem, 4vw, 2rem);
  color: #e6a23c;
  font-weight: bold;
  margin: 0.9375rem 0;
  user-select: none !important;
}
@media (max-width: 768px) {
  .book-detail-price {
    text-align: center;
    font-size: clamp(1.5rem, 5vw, 1.75rem);
  }
}

.book-detail-count {
  margin: 1.25rem 0;
  width: clamp(9.375rem, 15vw, 10rem);
  user-select: none !important;
}
@media (max-width: 768px) {
  .book-detail-count {
    margin: 1.25rem auto;
  }
}

/* 按钮 - 原始样式 */
.add-cart-btn {
  width: clamp(12.5rem, 20vw, 13.75rem);
  height: clamp(2.5rem, 5vw, 2.75rem);
  font-size: clamp(1rem, 2vw, 1.125rem);
  background-color: #e6a23c !important;
  border: none !important;
}
@media (max-width: 768px) {
  .add-cart-btn {
    margin: 0 auto;
    width: 100%;
    max-width: 12.5rem;
  }
}
.add-cart-btn:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
}

.add-cart-btn1 {
  width: clamp(12.5rem, 20vw, 13.75rem);
  height: clamp(2.5rem, 5vw, 2.75rem);
  font-size: clamp(1rem, 2vw, 1.125rem);
  background-color: #e6a23c !important;
  border: none !important;
  margin-left: 0px;
}
@media (max-width: 768px) {
  .add-cart-btn1 {
    margin: 0 auto;
    width: 100%;
    max-width: 12.5rem;
  }
}
.add-cart-btn1:disabled {
  background-color: #95a5a6 !important;
}

/* 简介/目录/作者 - 原始样式 */
.book-detail-desc {
  padding: 1.25rem;
  background: linear-gradient(
    -90deg,
    #b6b5b3 0%,
    #f0f2f5 25%,
    #aaa8a6 50%,
    #f0f2f5 75%,
    #b6b5b3 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
}
@media (max-width: 768px) {
  .book-detail-desc {
    padding: 0.9375rem;
  }
}

.book-detail-desc1 {
  margin-top: 0.625rem;
  padding: 1.25rem;
  background: linear-gradient(
    -90deg,
    #b6b5b3 0%,
    #f0f2f5 25%,
    #aaa8a6 50%,
    #f0f2f5 75%,
    #b6b5b3 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
}
@media (max-width: 768px) {
  .book-detail-desc1 {
    padding: 0.9375rem;
  }
}

.book-detail-desc2 {
  margin-top: 0.625rem;
  padding: 1.25rem;
  background: linear-gradient(
    -90deg,
    #b6b5b3 0%,
    #f0f2f5 25%,
    #aaa8a6 50%,
    #f0f2f5 75%,
    #b6b5b3 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
}
@media (max-width: 768px) {
  .book-detail-desc2 {
    padding: 0.9375rem;
  }
}

.book-detail-desc1 h3,
.book-detail-desc h3,
.book-detail-desc2 h3 {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  margin-bottom: 0.9375rem;
  color: #645703;
  border-bottom: 0.0625rem solid #2c3e50;
  padding-bottom: 0.625rem;
  user-select: none !important;
}
.book-detail-desc p,
.book-detail-desc1 p,
.book-detail-desc2 p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.8;
  color: #000000;
}

/* 导航子元素 - 原始样式 */
.nav-left {
  width: 13.75rem;
  flex-shrink: 0;
  text-align: left;
}
@media (max-width: 768px) {
  .nav-left {
    width: 100%;
    text-align: center;
    margin-bottom: 0.625rem;
  }
}

.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  white-space: nowrap;
  line-height: 3.75rem;
  user-select: none !important;
}
@media (max-width: 768px) {
  .logo1 {
    line-height: 2.5rem;
  }
}

.nav-center1 {
  display: flex;
  gap: 1.5625rem;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: fit-content;
  position: relative;
  left: 6.1%;
}
@media (max-width: 768px) {
  .nav-center1 {
    width: 100%;
    left: 0;
    gap: 0.9375rem;
    margin-bottom: 0.625rem;
  }
}

.nav-right1 {
  width: 23.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #ffffff;
  gap: 0.75rem;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .nav-right1 {
    width: 100%;
    justify-content: center;
    gap: 0.625rem;
  }
}

.login-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
}
.login-bar span {
  white-space: nowrap;
  font-size: clamp(1rem, 2vw, 1.125rem);
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.syws {
  display: flex;
  background: linear-gradient(0deg, #5073c7 0%, #121a28 100%);
  border-radius: 0.375rem;
  padding: 0.375rem 0.875rem;
  align-items: center;
  justify-content: center;
}
.syses {
  color: rgb(255, 255, 255);
  font-size: clamp(1rem, 2vw, 1.125rem);
  text-decoration: none;
  line-height: 1.2;
}
.syses:hover {
  color: #29a7ef;
}

/* 图片预览器 - 原始样式 */
:deep(.el-image-viewer__wrapper) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  transition: transform 0.3s ease-out;
}
:deep(.el-image-viewer__canvas) {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
:deep(.el-image-viewer__img) {
  object-fit: contain;
  transition: transform 0.25s ease-out;
  transform-origin: center center;
  cursor: grab;
  width: auto !important;
  height: clamp(20rem, 60vw, 25rem) !important;
}
:deep(.el-image-viewer__img:active) {
  cursor: grabbing;
}
:deep(.el-image-viewer__close) {
  transform: translateX(7.5rem) !important;
  width: 3.125rem !important;
  height: 3.125rem !important;
  border-radius: 50% !important;
  background: rgba(188, 183, 183, 0.7);
  color: #ff0000 !important;
  font-size: 1.25rem;
  z-index: 9999 !important;
  display: flex !important;
  position: relative;
  margin-left: 25%;
  top: 8.75rem;
  pointer-events: auto !important;
  font-weight: 700;
}
@media (max-width: 768px) {
  :deep(.el-image-viewer__close) {
    top: 5rem;
    margin-left: 15%;
    width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: 1rem;
  }
}
:deep(.el-image-viewer__close .el-icon) {
  color: #ff0000 !important;
  font-size: 1.375rem;
  font-weight: 1900;
}
:deep(.el-image-viewer__mask) {
  background: rgba(0, 0, 0, 0.92);
}

/* 展开收起 - 原始样式 */
.desc-content {
  display: -webkit-box;
  -webkit-line-clamp: 9;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem);
}
.desc-content.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.mulu-content {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  text-indent: 0 !important;
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem);
}
.mulu-content1 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  text-indent: 0 !important;
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem);
}
.mulu-content.expanded,
.mulu-content1.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.expand-btn {
  color: #409eff !important;
  margin-top: 0.5rem;
  padding: 0;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}
.expand-btn:hover {
  color: #66b1ff !important;
}
.expand-btn1 {
  color: #409eff !important;
  margin-top: 0.5rem;
  padding: 0;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}
.expand-btn1:hover {
  color: #66b1ff !important;
}

/* 加载提示 */
.loading-tip {
  text-align: center;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  color: #999;
  margin-top: 6.25rem;
}

/* 输入框适配 */
:deep(.el-input-number) {
  --el-input-number-bg-color: #121a28;
  --el-input-number-text-color: #fff;
  --el-border-color: #34495e;
  font-size: clamp(1rem, 2vw, 1.125rem);
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  color: #fff;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}
</style>
<style scoped>
:root {
  font-size: 16px;
}

/* 波浪流动背景 */
.wave-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #f0f4f8;
  /* 双层波浪SVG，淡蓝色科技风，低透明度不影响阅读 */
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233aa8ec' fill-opacity='0.12' d='M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,160C672,139,768,149,864,160C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%236288a5' fill-opacity='0.09' d='M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E");
  background-size:
    1440px 320px,
    1440px 320px;
  background-position:
    0 0,
    0 120px;
  background-repeat: repeat-x;
  animation: waveMove 18s linear infinite;
  z-index: -1;
  pointer-events: none;
}

/* 波浪横向流动动画 */
@keyframes waveMove {
  0% {
    background-position:
      0 0,
      0 120px;
  }
  100% {
    background-position:
      1440px 0,
      -1440px 120px;
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
  useRoute,
  useRouter,
} from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBookDetailApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'
import request from '@/utils/request'
import { getDirectPayGoodsInfo } from '@/api/front/pay'

const router = useRouter()
const allImagesLoaded = ref(false)

const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}
//@ts-ignore
let timeleave: NodeJS.Timeout | null = null
const showhover = ref(false)
function mouseleve() {
  timeleave = setTimeout(() => {
    if (showhover.value === true) {
      showhover.value = false
    }
  }, 750)
}
function mouseshow() {
  if (timeleave) clearTimeout(timeleave)
  showhover.value = true
}
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10)
}

const handlePreviewShow = () => {
  nextTick(() => {
    const viewer = document.querySelector('.el-image-viewer__wrapper') as HTMLElement
    const canvas = document.querySelector('.el-image-viewer__canvas') as HTMLElement
    const img = document.querySelector('.el-image-viewer__img') as HTMLElement

    if (!viewer || !canvas || !img) return

    const MAX_SCALE = 1.53
    const MIN_SCALE = 0.5
    let currentScale = 1
    let offsetX = 0
    let offsetY = 0
    let isDragging = false
    let startX = 0
    let startY = 0
    let startOffsetX = 0
    let startOffsetY = 0

    viewer.addEventListener('wheel', (e) => e.preventDefault(), { passive: false, capture: true })

    const resetImage = () => {
      currentScale = 1
      offsetX = 0
      offsetY = 0
      img.style.transformOrigin = 'center center'
      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`
      canvas.style.overflow = 'hidden' //@ts-ignore
      canvas.style.scrollTop = 0 //@ts-ignore
      canvas.style.scrollLeft = 0
    }

    img.onload = resetImage
    setTimeout(resetImage, 100)

    const applyTransform = () => {
      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const scaleStep = e.deltaY > 0 ? 0.95 : 1.1
      const newScale = Math.max(MIN_SCALE, Math.min(currentScale * scaleStep, MAX_SCALE))
      currentScale = newScale
      applyTransform()
      canvas.style.overflow = 'auto'
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (currentScale <= 1) return
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      startOffsetX = offsetX
      startOffsetY = offsetY
      img.style.cursor = 'grabbing'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      offsetX = startOffsetX + deltaX
      offsetY = startOffsetY + deltaY
      applyTransform()
    }

    const handleMouseUp = () => {
      isDragging = false
      img.style.cursor = 'grab'
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    viewer.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    img.addEventListener('mousedown', handleMouseDown)
    img.style.cursor = 'grab'

    const cleanup = () => {
      viewer.removeEventListener('wheel', handleWheel, true)
      img.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.querySelector('.el-image-viewer__close')?.addEventListener('click', cleanup)
    document.querySelector('.el-image-viewer__mask')?.addEventListener('click', cleanup)
  })
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

const route = useRoute()
const bookId = Number(route.params.id)

const cartStore = useCartStore()
const userStore = useUserStore()

const loading = ref(true)
const book = ref<Book | null>(null)
const buyCount = ref(1)

const isMuluExpanded1 = ref(false)

const showMuluExpand1 = ref(false)
const isDescExpanded = ref(false)
const isMuluExpanded = ref(false)
const showDescExpand = ref(false)
const showMuluExpand = ref(false)
const descRef = ref<HTMLElement | null>(null)
const muluRef = ref<HTMLElement | null>(null)
const muluRef1 = ref<HTMLElement | null>(null)

const loadBookDetail = async () => {
  try {
    const res = await getBookDetailApi(bookId) //@ts-ignore
    if (res.code === 200 && res.data) {
      //@ts-ignore
      book.value = res.data
    } else {
      ElMessage.error('获取图书信息失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，请重试')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const addToCart = async () => {
  if (!book.value) {
    ElMessage.warning('图书信息加载失败，无法加入购物车')
    return
  }
  if (!userStore.token) {
    ElMessage.warning('请先登录后再加入购物车')
    return
  }
  const stock = Number(book.value.stock) || 0
  if (buyCount.value > stock) {
    ElMessage.error({
      message: `加入购物车失败，该图书仅剩${stock}本`,
      offset: 80,
    })
    return
  }
  try {
    await request.post('/api/cart/add', {
      goodsId: book.value.id,
      num: buyCount.value,
      spec: '平装版',
    })
    cartStore.addToCart({
      id: book.value.id,
      name: book.value.name || '未知图书',
      price: Number(book.value.price) || 0,
      count: buyCount.value,
      cover: book.value.cover || '/img/default-book.jpg',
      cartId: 0,
      spec: '',
    })
    ElMessage.success({ message: '加入购物车成功', offset: 80 })
  } catch (err) {
    console.error('加入购物车失败：', err)
    ElMessage.error({ message: '加入购物车失败，请稍后重试', offset: 80 })
  }
}

const handlePay = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再支付')
    router.push('/login')
    return
  }
  if (!book.value) {
    ElMessage.warning('图书信息加载失败，无法支付')
    return
  }
  const stock = Number(book.value.stock) || 0
  if (buyCount.value > stock) {
    ElMessage.error(`库存不足！该图书仅剩${stock}本`)
    return
  }

  try {
    await getDirectPayGoodsInfo(book.value.id, buyCount.value)
    router.push({
      path: '/pay/direct',
      query: {
        bookId: book.value.id.toString(),
        buyCount: buyCount.value.toString(),
      },
    })
  } catch (error) {
    console.error('直付跳转失败：', error)
    ElMessage.error('支付跳转失败，请稍后重试')
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  if (bookId) {
    loadBookDetail().then(() => {
      nextTick(() => {
        if (descRef.value) {
          showDescExpand.value = descRef.value.scrollHeight > descRef.value.clientHeight
        }
        if (muluRef.value) {
          showMuluExpand.value = muluRef.value.scrollHeight > muluRef.value.clientHeight
        }
        if (muluRef1.value) {
          showMuluExpand1.value = muluRef1.value.scrollHeight > muluRef1.value.clientHeight
        }
      })
    })
  }
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.05)
})
</script>
