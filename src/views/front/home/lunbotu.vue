<template>
  <div class="se">
    <!-- 轮播容器（带scale(0.6)缩放） -->
    <div class="asss carousel-container">
      <!-- 所有图片同时渲染，通过class控制状态 -->
      <router-link
        v-for="(item, index) in slides"
        :key="index"
        :to="item.path"
        :class="getItemStatus(index + 1)"
        class="carousel-item"
        v-if="slides.length > 0"
      >
        <span class="lunbotuzi">{{ item.title }}</span>
        <!--@vue-ignore-->
        <img
          :src="item.image || '/img/default-book.jpg'"
          class="tu"
          referrerpolicy="no-referrer"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
      </router-link>

      <!-- 左右切换按钮 -->
      <button @click="next" class="pw prev" v-if="slides.length > 0">></button>
      <button @click="prev" class="pw next" v-if="slides.length > 0"><</button>

      <!-- ============== 【仅移动：指示器移入缩放容器内部！】============== -->
      <div class="dots" v-if="slides.length > 0">
        <span
          v-for="(item, index) in slides"
          :key="index"
          :class="{ active: lunxian === index + 1 }"
          @click="godianlun(index + 1)"
        />
      </div>
      <p class="dots1">探索宇宙的无限可能，尽在星途科幻图书电商平台</p>
    </div>

    <div class="xiatiao1"></div>
    <div class="xiatiao2"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onUnmounted, computed } from 'vue'
import { useBookStore } from '@/store/book'
import type { Book } from '@/types/index'

const bookStore = useBookStore()

// 随机抽取图书
function getRandomBooks(list: Book[], count: number = 4) {
  if (!list || list.length === 0) return []
  const arr = JSON.parse(JSON.stringify(list)) as Book[]
  const result: Book[] = []
  for (let i = 0; i < count && arr.length; i++) {
    const idx = Math.floor(Math.random() * arr.length)
    result.push(arr.splice(idx, 1)[0])
  }
  return result
}

const slides = ref<{ title: string; image: string; path: string }[]>([])
const lunxian = ref(1)
const cdlun = ref(0)
let zilun: number | null = null

// 计算每个图片的状态（中间/左侧/右侧/隐藏）
const getItemStatus = (idx: number) => {
  const total = cdlun.value
  if (total === 0) return ''
  // 处理循环
  const prevIdx = lunxian.value === 1 ? total : lunxian.value - 1
  const nextIdx = lunxian.value === total ? 1 : lunxian.value + 1

  if (idx === lunxian.value) return 'active' // 中间大图
  if (idx === prevIdx) return 'prev-item' // 左侧图
  if (idx === nextIdx) return 'next-item' // 右侧图
  return 'hidden-item' // 其他图隐藏
}

// 初始化轮播
async function initSlides() {
  try {
    await bookStore.fetchBookList()
    const books = getRandomBooks(bookStore.bookList, 4)
    slides.value = books.map((b) => ({
      title: b.name || '未知图书',
      image: b.cover || '/img/default-book.jpg',
      path: `/book/${b.id}`,
    }))
    cdlun.value = slides.value.length
    if (cdlun.value > 0) lunxian.value = 1
  } catch (error) {
    console.error('轮播图初始化失败：', error)
    slides.value = [
      { title: '三体', image: '/img/default-book.jpg', path: '/book/1' },
      { title: '流浪地球', image: '/img/default-book.jpg', path: '/book/2' },
    ]
    cdlun.value = slides.value.length
  }
}

// 切换逻辑
const next = () => {
  if (cdlun.value === 0) return
  lunxian.value = (lunxian.value % cdlun.value) + 1
}
const prev = () => {
  if (cdlun.value === 0) return
  lunxian.value = lunxian.value === 1 ? cdlun.value : lunxian.value - 1
}
const godianlun = (index: number) => {
  if (cdlun.value === 0) return
  lunxian.value = index
}

onMounted(async () => {
  await initSlides()
  if (cdlun.value > 0) zilun = setInterval(next, 3000)
})
const chuyu = ref(false)
onUnmounted(() => zilun && clearInterval(zilun))
</script>

<style scoped>
.se {
  height: 526px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  user-select: none;
  background: transparent;
}

/* 高级轮播容器核心样式 */
.carousel-container {
  width: 969px;
  height: 426px;
  position: relative;
  display: flex;
  justify-content: center;

  align-items: center;
  background: linear-gradient(135deg, #f0f2f5 25%, #eceae9 50%, #f0f2f5 25%);
  box-shadow: 0 8px 30px rgba(98, 99, 99, 0.418);

  transform: scale(0.75);
}

.carousel-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 50%, rgba(121, 122, 123, 0.61) 100%);
  pointer-events: none;
}

/* 轮播项基础样式 */
.carousel-item {
  position: absolute;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 1;
  text-decoration: none;
}

/* 中间激活项（清晰、大图） */
.carousel-item.active {
  z-index: 10;
  transform: translateX(0) scale(0.7);
  opacity: 1;
  filter: blur(0);
}

/* 左侧预览项（缩小、虚化、半透明） */
.carousel-item.prev-item {
  z-index: 5;
  transform: translateX(-280px) scale(0.6);
  opacity: 0.8;
  filter: blur(2px);
}

/* 右侧预览项（缩小、虚化、半透明） */
.carousel-item.next-item {
  z-index: 5;
  transform: translateX(280px) scale(0.6);
  opacity: 0.8;
  filter: blur(2px);
}

/* 隐藏其他项 */
.carousel-item.hidden-item {
  opacity: 0;
  transform: scale(0.5);
  pointer-events: none;
}

/* 图书标题 */
.lunbotuzi {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 25px;
  color: rgba(0, 0, 0, 0.877);
  z-index: 97;
  font-weight: 700;
  white-space: nowrap;
  text-shadow:
    0 0 5px #edeef0,
    0 0 5px rgba(85, 52, 10, 0.6);
}
.lunbotuzi:hover {
  color: rgb(198, 111, 43);
}

/* 图书封面样式 */
.tu {
  width: 320px;
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: contain;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(238, 251, 3, 0.4);
  transition: all 0.8s;
}

/* 按钮样式 */
.pw {
  width: 5vw;
  max-width: 70px;
  min-width: 40px;
  aspect-ratio: 6 /5;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5vw;
  z-index: 100;
  background: linear-gradient(#54bef4 25%, #0776ec 100%);
  transition: 0.7s;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  color: #fff;
}
.pw:hover {
  background: linear-gradient(#0776ec, #0776ec);
  transform: translateY(-50%) scale(1.05);
}
.pw.prev {
  right: 40px;
}
.pw.next {
  left: 40.5px;
}
/* ==================  dots 全部样式 ================== */
.dots {
  /* 绑定缩放轮播容器，绝对定位 */
  position: absolute;
  /* 核心：原生水平居中 + 抵消父元素scale(0.6)缩放带来的偏移 */
  left: 50%;
  /* 复合变换：先自身居中，再完美抵消父容器缩放扭曲 */
  transform: translateX(-50%) scale(1);
  /* 固定在轮播整体底部，和你截图里位置完全一致 */
  bottom: 15px;
  /* 层级足够高，不会被任何元素遮挡 */
  z-index: 9999;
  display: flex;
  gap: 10px;
}
.dots1 {
  /* 绑定缩放轮播容器，绝对定位 */
  position: absolute;
  /* 核心：原生水平居中 + 抵消父元素scale(0.6)缩放带来的偏移 */
  left: 50%;
  /* 复合变换：先自身居中，再完美抵消父容器缩放扭曲 */
  transform: translateX(-50%) scale(1);
  /* 固定在轮播整体底部，和你截图里位置完全一致 */
  bottom: -45px;
  /* 层级足够高，不会被任何元素遮挡 */
  z-index: 9999;
  display: flex;
  gap: 10px;
  color: #3c73e1;
  text-align: center;
  font-size: 18px;
  line-height: 1.5;
  animation: zzi 1.1s forwards ease-in;
  font-weight: 700;
  background: linear-gradient(90deg, #3c73e1, #64b5f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 10px rgba(232, 128, 43, 0.24);
}
@keyframes zzi {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}
.dots span {
  width: 12px;
  height: 12px;
  background: rgba(82, 201, 3, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}
.dots span.active {
  background: rgb(249, 6, 6);
  transform: scale(1.2);
}
.xiatiao1 {
  height: 2px;
  background: #eee;
  margin-top: 10px;
  width: 769px;

  position: absolute;
  left: 100px;
}
.xiatiao2 {
  height: 2px;
  background: #eee;

  top: 100.2px;
  width: 669px;
  z-index: 888;
  transform: rotate(90deg);
  position: absolute;
  left: 534.5px;
}
</style>
