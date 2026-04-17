<template>
  <div class="se">
    <!-- 轮播容器 -->
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
    </div>

    <!-- 指示器 -->
    <div class="dots" v-if="slides.length > 0">
      <span
        v-for="(item, index) in slides"
        :key="index"
        :class="{ active: lunxian === index + 1 }"
        @click="godianlun(index + 1)"
      />
    </div>
    <div class="xiatiao1"></div>
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

onUnmounted(() => zilun && clearInterval(zilun))
</script>

<style scoped>
.se {
  height: 546px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  user-select: none;
  background: transparent;
}

/* 高级轮播容器核心样式 */
.carousel-container {
  width: 100%;
  height: 613px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f2f5 25%, #938575 50%, #f0f2f5 25%);
  box-shadow: 0 8px 30px rgba(98, 99, 99, 0.418);
  overflow: hidden;
}
.carousel-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 60%, rgba(121, 122, 123, 0.61) 100%);
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
  transform: translateX(0) scale(1);
  opacity: 1;
  filter: blur(0);
}

/* 左侧预览项（缩小、虚化、半透明） */
.carousel-item.prev-item {
  z-index: 5;
  transform: translateX(-280px) scale(0.75);
  opacity: 0.8;
  filter: blur(2px);
}

/* 右侧预览项（缩小、虚化、半透明） */
.carousel-item.next-item {
  z-index: 5;
  transform: translateX(280px) scale(0.75);
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
  top: -25px;
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
  aspect-ratio: 7 /5;
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
  right: 80px;
}
.pw.next {
  left: 80px;
}

/* 指示器 */
.dots {
  position: absolute;
  bottom: 30px;
  z-index: 98;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
.dots span {
  width: 10px;
  height: 10px;
  background: rgba(82, 201, 3, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}
.dots span.active {
  background: rgb(249, 6, 6);
  transform: scale(1.2);
}

.xiatiao1 {
  height: 2px;
  background: #eee;
  margin-top: 10px;
}
</style>
