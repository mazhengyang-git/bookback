<template>
  <div class="home-hot-tags">
    <h2 class="sci-fi-title">图书分类</h2>
    <div v-if="!finalCategoryTags.length" class="empty-tip">
      <el-empty description="暂无热门标签" />
    </div>
    <div v-else class="tags-list">
      <el-tag
        v-for="tag in finalCategoryTags"
        :key="tag.name"
        class="hot-tag"
        @click="handleCategoryClick(tag)"
      >
        {{ tag.name }}
      </el-tag>
    </div>

    <h2 class="sci-fi-title">作者系列</h2>
    <div v-if="!finalAuthorTags.length" class="empty-tip">
      <el-empty description="暂无作者系列" />
    </div>
    <div v-else class="tags-list">
      <el-tag
        v-for="tag in finalAuthorTags"
        :key="tag.name"
        class="hot-tag"
        @click="handleAuthorClick(tag)"
      >
        {{ tag.name }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElEmpty, ElTag } from 'element-plus'
import { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, useRouter } from 'vue-router'

export interface HotTagItem {
  id: number
  name: string
}

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const props = defineProps<{
  categoryTags?: HotTagItem[]
  authorTags?: HotTagItem[]
}>()

const emit = defineEmits<{
  click: [type: 'category' | 'author', tag: HotTagItem]
}>()

const defaultCategoryTags: HotTagItem[] = [
  { id: 1, name: '太空歌剧' },
  { id: 2, name: '赛博朋克' },
  { id: 3, name: '外星文明' },
  { id: 4, name: '末世废土' },
  { id: 5, name: '星际灾厄' },
  { id: 6, name: '次元交互' },
  { id: 7, name: '梦灵空间' },
  { id: 8, name: '自然谜团' },
  { id: 9, name: '虚幻惊悚' },
  { id: 10, name: '星系攻略' },
  { id: 11, name: '平行宇宙' },
  { id: 12, name: '意识陷落' },
  { id: 13, name: '智能纪元' },
  { id: 14, name: '时间旅行' },
]

const finalCategoryTags = computed(() => {
  const cateshuju = props.categoryTags?.length ? props.categoryTags : defaultCategoryTags
  return randomPick(cateshuju, 8)
})

const defaultAuthorTags: HotTagItem[] = [
  { id: 1, name: '刘慈欣' },
  { id: 2, name: '[美]艾萨克·阿西莫夫' },
  { id: 3, name: '[波]斯坦尼斯瓦夫·莱姆' },
  { id: 4, name: '[美]安迪.威尔' },
  { id: 5, name: '[美]特德·姜' },
  { id: 6, name: '[韩]金草叶' },
]

const finalAuthorTags = computed(() => {
  const authorshuju = props.authorTags?.length ? props.authorTags : defaultAuthorTags
  return randomPick(authorshuju, 5)
})

const router = useRouter()
// 直接跳转，小延迟
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}
const handleCategoryClick = (tag: HotTagItem) => {
  emit('click', 'category', tag)
  go(`/books?category=${tag.name}`)
}

const handleAuthorClick = (tag: HotTagItem) => {
  emit('click', 'author', tag)
  go(`/books?aauthor=${tag.name}`)
}
const chuyu = ref(false)
onMounted(async () => {
  if (!chuyu.value) {
    requestIdleCallback(() => {
      //预加载页面
      import('@/views/front/book/detail.vue')

      console.log('分类标签预加载成功')
    })
    chuyu.value = true
  }
})
</script>

<style scoped>
.home-hot-tags {
  width: 499px;
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
  box-sizing: border-box;
  height: auto;

  border-radius: 20%;
}

/* 标题样式 */
.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  font-size: 25px;
  font-weight: 600;
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 20px rgba(237, 254, 2, 0.4);
  animation: titlePulse 2s infinite alternate;
}

/* 标题呼吸动画 */
@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(236, 218, 218, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(120, 121, 121, 0.768);
  }
}

/*严格两列网格布局  */
/* 标签容器 */
.two-col-grid {
  display: grid;
  /*两列所有标签强制等宽 */
  grid-template-columns: repeat(2, 1fr);
  gap: 29px 20px; 
  justify-items: center; /* 标签在格子内居中 */
  width: 100%;
  margin: 0 auto 40px;
  margin-left: 5px;
}

/* 标签样式  */
.hot-tag {
  cursor: pointer;
  /*  占满整个网格格子宽度 */
  width: 47.2%;
  box-sizing: border-box;
  margin-top: 15px;
  margin-bottom: 15px;
  /* 文字自适应*/
  padding: 18px 12px;
  margin-left: 10px;
  font-size: clamp(18px, 1.1vw, 20px);
  text-align: center; /* 文字永远居中 */
  white-space: nowrap; /* 文字不换行 */
  overflow: hidden; /* 防止超长出框 */
  text-overflow: ellipsis; /* 自动省略兜底 */

  /* 渐变背景、圆角、动画 */
  background: linear-gradient(135deg, #d7dfe7, #64b5f6);
  color: #000000;
  font-weight: 600;
  border: none;
  border-radius: clamp(10px, 2vw, 15px);
  transition: all 0.3s ease;
  
  opacity: 0.66;
}

/* hover效果 */
.hot-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
}

/* 空数据提示*/
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}
</style>

<style scoped>
.hot-tag {
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hot-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hot-tag:hover::before {
  opacity: 1;
}

/* 悬停效果 */
.hot-tag:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
  opacity: 1;
}

.home-hot-tags {
  border-radius: 12px;
 box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.1);
  /* 调高透明度，毛玻璃 */
  background: rgba(255, 255, 255, 0.35);
  /* 适度模糊 */
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);

  /* 创建层叠上下文*/
  isolation: isolate;
  position: relative;
}
/* Apple风格的平滑动画 */
.hot-tag {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Google Material Design的涟漪效果 */
.hot-tag {
  position: relative;
  overflow: hidden;
}

.hot-tag::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.hot-tag:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}
</style>
