<template>
  <div class="home-hot-tags">
    <!--  ========== 第一组：热门标签（分类） ========== -->
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

    <!--  ========== 第二组：作者系列（独立） ========== -->
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
import { computed } from 'vue'
import { ElEmpty, ElTag } from 'element-plus'

import { useRouter } from 'vue-router'

/** 统一标签类型 */
export interface HotTagItem {
  id: number
  name: string
}
function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
/** Props  */
const props = defineProps<{
  // 自定义【热门标签】数据
  categoryTags?: HotTagItem[]
  // 自定义【作者系列】数据
  authorTags?: HotTagItem[]
}>()

/** 统一事件抛出 */
const emit = defineEmits<{
  click: [type: 'category' | 'author', tag: HotTagItem]
}>()

// ==============================================
// 1. 热门标签（分类）默认数据 + 计算属性
// ==============================================
const defaultCategoryTags: HotTagItem[] = [
  { id: 1, name: '太空歌剧' },
  { id: 2, name: '赛博朋克' },
  { id: 3, name: '外星文明' },
  { id: 4, name: '末世废土' },
  { id: 5, name: '星际灾厄' },
  { id: 6, name: '次元交互' },
  { id: 7, name: '梦灵空间' },
  { id: 8, name: '平行宇宙' },
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

// ==============================================
// 2. 作者系列 默认数据 + 计算属性
// ==============================================
const defaultAuthorTags: HotTagItem[] = [
  { id: 1, name: '刘慈欣' },
  { id: 2, name: '[美]艾萨克·阿西莫夫' },
  { id: 3, name: '[波]斯坦尼斯瓦夫·莱姆' },
  { id: 4, name: '[美]安迪•威尔' },
  { id: 5, name: '[美]特德·姜' },
  { id: 6, name: '[韩]金草叶' },
]
const finalAuthorTags = computed(() => {
  const authorshuju = props.authorTags?.length ? props.authorTags : defaultAuthorTags
  return randomPick(authorshuju, 5)
})
const router = useRouter()
const go = (path: string) => router.push(path)
// ==============================================
// 点击事件
// ==============================================
/** 点击分类标签 → 跳分类页 */
const handleCategoryClick = (tag: HotTagItem) => {
  emit('click', 'category', tag)
  go(`/books?category=${tag.name}`)
}

/** 点击作者标签 → 跳作者筛选页 */
const handleAuthorClick = (tag: HotTagItem) => {
  emit('click', 'author', tag)
  go(`/books?author=${tag.name}`)
}
</script>

<style scoped>
.home-hot-tags {
  width: 450px;
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
  box-sizing: border-box;
  height: auto;
  border-radius: 20%;
}

/* 标题样式 - 1:1还原原项目设计 完全不动 */
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

/* 标题呼吸动画 完全不动 */
@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(245, 118, 118, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(247, 67, 7, 0.501);
  }
}

/* ====================== 核心排版重构：严格两列网格布局 ====================== */
/* 统一所有标签容器：强制严格2列均分网格，再也不受文字长度影响！ */
.two-col-grid {
  display: grid;
  /*永远两列，宽度1:1完全均分，所有标签强制等宽！ */
  grid-template-columns: repeat(2, 1fr);
  gap: 29px 20px; /* 上下间距、左右间距 */
  justify-items: center; /* 标签在格子内居中 */
  width: 100%;
  margin: 0 auto 40px;
  margin-left: 5px;
}

/* 标签样式 - 100%保留你原本所有外观、渐变、hover效果，仅适配网格 */
.hot-tag {
  cursor: pointer;
  /*  强制占满整个网格格子宽度，所有标签宽度完全一模一样！ */
  width: 47.2%;
  box-sizing: border-box;
  margin-top: 15px;
  margin-bottom: 15px;
  /* 文字自适应：超长名字自动缩小字号，短名字保持大小，不会挤压变形 */
  padding: 18px 12px;
  margin-left: 10px;
  font-size: clamp(18px, 1.1vw, 20px);
  text-align: center; /* 文字永远居中 */
  white-space: nowrap; /* 文字不换行 */
  overflow: hidden; /* 防止超长出框 */
  text-overflow: ellipsis; /* 极端超长自动省略兜底 */

  /* 你原本的渐变背景、圆角、动画全部完整保留 */
  background: linear-gradient(135deg, #d7dfe7, #64b5f6);
  color: #000000;
  font-weight: 600;
  border: none;
  border-radius: clamp(10px, 2vw, 15px);
  transition: all 0.3s ease;
  opacity: 0.66;
}

/* hover效果完全原样保留 */
.hot-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
}

/* 空数据提示 完全不动 */
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}
</style>
