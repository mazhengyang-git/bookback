<template>
  <div class="se">
    <div class="asss">
      <router-link
        v-for="(item, index) in slides"
        :key="index"
        :to="item.path"
        v-show="lunxian === index + 1"
        v-if="slides.length > 0"
      >
        <span class="lunbotuzi">{{ item.title }}</span>
        <!-- 封面图容错 -->
        <!--@vue-ignore-->
        <img
          :src="item.image || '/img/default-book.jpg'"
          class="tu"
          referrerpolicy="no-referrer"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
      </router-link>

      <!-- 按钮只在有轮播数据时显示 -->
      <button @click="next" class="pw prev" v-if="slides.length > 0">></button>
      <button @click="prev" class="pw next" v-if="slides.length > 0"><</button>
    </div>
    <!-- 指示器只在有轮播数据时显示 -->
    <div class="dots" v-if="slides.length > 0">
      <span
        v-for="(item, index) in slides"
        :key="index"
        :class="{ active: lunxian === index + 1 }"
        @click="godianlun(index + 1)"
      >
      </span>
    </div>
    <div class="xiatiao1"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useBookStore } from '@/store/book'
import type { Book } from '@/types/index'

// 实例化图书仓库
const bookStore = useBookStore()

// 随机抽取图书
function getRandomBooks(list: Book[], count: number = 4) {
  if (!list || list.length === 0) return [] // 空值容错
  const arr = JSON.parse(JSON.stringify(list)) as Book[]
  const result: Book[] = []
  for (let i = 0; i < count && arr.length; i++) {
    const idx = Math.floor(Math.random() * arr.length)
    result.push(arr.splice(idx, 1)[0])
  }
  return result
}

// 轮播数据（初始化空数组）
const slides = ref<{ title: string; image: string; path: string }[]>([])
const lunxian = ref(1)
let cdlun = ref(0) // 改为响应式变量，避免初始化值错误

//异步初始化轮播图
async function initSlides() {
  try {
    await bookStore.fetchBookList()
    const books = getRandomBooks(bookStore.bookList, 4)
    slides.value = books.map((b) => ({
      title: b.name || '未知图书',
      image: b.cover || '/img/default-book.jpg',
      path: `/book/${b.id}`,
    }))
    cdlun.value = slides.value.length // 动态更新轮播总数
    // 初始化轮播索引
    if (cdlun.value > 0) {
      lunxian.value = 1
    }
  } catch (error) {
    console.error('轮播图初始化失败：', error)
    // 默认轮播数据
    slides.value = [
      { title: '三体', image: '/img/default-book.jpg', path: '/book/1' },
      { title: '流浪地球', image: '/img/default-book.jpg', path: '/book/2' },
    ]
    cdlun.value = slides.value.length
  }
}

// 修复轮播逻辑
const next = () => {
  if (cdlun.value === 0) return // 无数据时不执行
  lunxian.value = (lunxian.value % cdlun.value) + 1
}
const prev = () => {
  if (cdlun.value === 0) return // 无数据时不执行
  if (lunxian.value === 1) {
    lunxian.value = cdlun.value
  } else {
    lunxian.value -= 1
  }
}
const godianlun = (index: number) => {
  if (cdlun.value === 0) return // 无数据时不执行
  lunxian.value = index
}

let zilun: number | null = null

onMounted(async () => {
  await initSlides()
  // 只有有轮播数据时才启动自动轮播
  if (cdlun.value > 0) {
    zilun = window.setInterval(next, 3000)
  }
})

onUnmounted(() => {
  if (zilun) clearInterval(zilun)
})
</script>

<style scoped>
/*  */
.se {
  height: 546px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  left: 0 !important;
  display: block;

  user-select: none;
  background: transparent;
}

.asss {
  width: 100%;
  height: 100%;
  z-index: 90;
  margin: 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f2f5 25%, #938575 50%, #f0f2f5 25%);
  box-shadow: 0 8px 30px rgba(98, 99, 99, 0.418);
}
.asss::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 60%, rgba(121, 122, 123, 0.61) 100%);
  pointer-events: none;
}
.lunbotuzi {
  position: absolute;
  top: 60px;
  left: calc(50% - 150px);
  font-size: 25px;
  color: rgba(0, 0, 0, 0.877);
  z-index: 97;
  font-weight: 700;
  text-shadow:
    0 0 5px #edeef0,
    0 0 5px rgba(85, 52, 10, 0.6);
  margin-bottom: 1px;
}
.lunbotuzi:hover {
  color: rgb(198, 111, 43);
}

.pw {
  width: 5vw;
  max-width: 70px;
  min-width: 40px;
  aspect-ratio: 7 / 5;
  position: absolute;
  top: 59%;
  transform: translateY(-50%);
  font-size: 2.5vw;
  z-index: 10000;
  background-color: rgb(38, 138, 196);
  background: linear-gradient(#54bef4 25%, #0776ec 100%, #54bef4 25%);
  transition: transform 0.7s;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.pw:hover {
  background: linear-gradient(#0776ec 25%, #0776ec 100%, #edeef0 50%);
  transform: translateY(-50%) scale(1.05);
  transition: all 0.7s;
}
.pw:active {
  background: linear-gradient(#0776ec 25%, #0776ec 100%, #edeef0 50%);
  transform: translateY(-50%) scale(1.01);
  transition: all 0.7s;
}
.pw.prev {
  right: 15vw;
}
.pw.next {
  left: 15vw;
}

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
  background-color: rgba(82, 201, 3, 0.5);
  border-radius: 50%;
  cursor: pointer;
}
.dots span.active {
  background-color: rgb(249, 6, 6);
}

template,
.ce,
.ce1,
.ce a,
.ce1:hover {
  display: none;
}

.tu {
  max-width: 350px;
  height: auto;
  max-height: 440px;
  object-fit: contain;
  position: relative;
  left: 0;
  margin-top: 0;
  z-index: 9600;
  width: 30vw;
  aspect-ratio: 2/3;
  height: auto;
  object-fit: contain;
  object-position: center;
  position: relative;
  left: 0;
  top: 0;
  width: 25vw;
  aspect-ratio: 2 / 3;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(238, 251, 3, 0.3);
}
</style>
