<template>
  <div class="book-launch-layout">
    <!-- 头部 -->
    <header class="launch-header">
      <div class="header-inner">
        <span class="back-btn" @click="router.back()">← 返回</span>
        <h1 class="launch-title">{{ activity.title }}</h1>
      </div>
    </header>

    <main class="launch-main">
      <!-- 新书封面+核心信息 -->
      <section class="hero-section">
        <div class="hero-left">
          <img
            v-if="activity.image"
            :src="activity.image"
            :alt="activity.title"
            class="book-cover"
            @error="onImgError"
          />
          <div v-else class="book-cover-placeholder">📖</div>
        </div>
        <div class="hero-right">
          <div class="status-tag" :class="statusClass">{{ statusText }}</div>
          <h2 class="book-name">{{ activity.title }}</h2>
          <p v-if="activity.name" class="book-author">作者：{{ activity.name }}</p>
          <p class="book-time">发布时间：{{ formatDate(activity.time) }}</p>

          <!-- 扩展字段：价格/折扣 -->
          <div v-if="extraFields.price" class="price-block">
            <span class="price-label">首发价</span>
            <span class="price-value">¥{{ extraFields.price }}</span>
            <span v-if="extraFields.original_price" class="price-original">¥{{ extraFields.original_price }}</span>
            <span v-if="extraFields.discount" class="price-discount">{{ extraFields.discount }}折</span>
          </div>

          <button class="btn-buy" :disabled="isDisabled" @click="handleJoin">
            {{ buttonText }}
          </button>
        </div>
      </section>

      <!-- 活动简介 -->
      <section v-if="detail?.desc" class="block-section">
        <h3 class="block-title">新书简介</h3>
        <p class="block-text">{{ detail.desc }}</p>
      </section>

      <!-- 富文本详情 -->
      <section v-if="detailContent" class="block-section">
        <h3 class="block-title">详细介绍</h3>
        <div class="rich-content" v-html="detailContent"></div>
      </section>

      <!-- 扩展字段：亮点/目录 -->
      <section v-if="extraFields.highlights && extraFields.highlights.length" class="block-section">
        <h3 class="block-title">新书亮点</h3>
        <div class="highlight-list">
          <div v-for="(h, i) in extraFields.highlights" :key="i" class="highlight-item">
            <span class="hl-icon">✨</span>
            <span>{{ h }}</span>
          </div>
        </div>
      </section>

      <section v-if="extraFields.chapters && extraFields.chapters.length" class="block-section">
        <h3 class="block-title">目录预览</h3>
        <div class="chapter-list">
          <div v-for="(ch, i) in extraFields.chapters" :key="i" class="chapter-item">
            <span class="ch-idx">{{ Number(i) + 1 }}</span>
            <span class="ch-name">{{ ch }}</span>
          </div>
        </div>
      </section>

      <!-- 分享 -->
      <section class="action-section">
        <button class="btn-share" @click="handleShare">分享此活动</button>
      </section>
    </main>

    <footer class="launch-footer">
      <p>© 2026 星途科幻图书 · 新书发布</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ActivityDetailData, HuodongDetail } from '@/types/front/huodong'

const props = defineProps<{
  activity: ActivityDetailData
  detail: HuodongDetail | null
  extraFields: Record<string, any>
}>()

const router = useRouter()

let imgFallbacked = false
const onImgError = (e: Event) => {
  if (imgFallbacked) return
  imgFallbacked = true
  const img = e.target as HTMLImageElement
  img.src = '/img/default-book.jpg'
}

const statusText = computed(() => {
  const map: Record<number, string> = { 0: '未开始', 1: '进行中', 2: '快结束', 3: '已结束', 4: '已取消' }
  return map[props.activity.status] || '未知'
})

const statusClass = computed(() => {
  const map: Record<number, string> = { 0: 'bg-blue', 1: 'bg-green', 2: 'bg-yellow', 3: 'bg-gray', 4: 'bg-red' }
  return map[props.activity.status] || 'bg-blue'
})

const formatDate = (d?: string) => {
  if (!d) return '待定'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const detailContent = computed(() => props.detail?.content || props.activity.content || '')

const isDisabled = computed(() => props.activity.status === 3 || props.activity.status === 4)
const buttonText = computed(() => {
  const s = props.activity.status
  if (s === 3) return '活动已结束'
  if (s === 4) return '活动已取消'
  if (s === 0) return '即将开启预售'
  return '立即抢购'
})

const handleJoin = () => { if (!isDisabled.value) alert('购买功能将在正式版本中实现') }
const handleShare = () => {
  if (navigator.share) {
    navigator.share({ title: props.activity.title, url: window.location.href }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('链接已复制到剪贴板')).catch(() => {})
  }
}
</script>

<style scoped>
.book-launch-layout { min-height: 100vh; background: #fefce8; }

.launch-header {
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  color: #fff;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.header-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 16px; }

.back-btn { cursor: pointer; font-size: 14px; opacity: 0.85; transition: opacity 0.2s; }
.back-btn:hover { opacity: 1; }

.launch-title { flex: 1; font-size: 18px; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.launch-main { max-width: 900px; margin: 0 auto; padding: 20px 16px; }

/* Hero: 书封+信息 */
.hero-section {
  display: flex;
  gap: 24px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.hero-left { flex-shrink: 0; }

.book-cover {
  width: 200px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.book-cover-placeholder {
  width: 200px; height: 280px;
  background: #f5f5f4;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 64px;
}

.hero-right { flex: 1; display: flex; flex-direction: column; gap: 8px; }

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.bg-blue { background: #3b82f6; color: #fff; }
.bg-green { background: #10b981; color: #fff; }
.bg-yellow { background: #f59e0b; color: #000; }
.bg-gray { background: #6b7280; color: #fff; }
.bg-red { background: #ef4444; color: #fff; }

.book-name { font-size: 1.5rem; font-weight: 700; color: #1c1917; margin: 0; }
.book-author { color: #57534e; font-size: 14px; margin: 0; }
.book-time { color: #78716c; font-size: 13px; margin: 0; }

/* 价格 */
.price-block { display: flex; align-items: baseline; gap: 8px; margin-top: 8px; }

.price-label { color: #92400e; font-size: 13px; font-weight: 600; }

.price-value { color: #dc2626; font-size: 24px; font-weight: 700; }

.price-original { color: #a8a29e; font-size: 14px; text-decoration: line-through; }

.price-discount {
  background: #dc2626;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.btn-buy {
  margin-top: 12px;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #92400e, #b45309);
  transition: all 0.3s;
  width: fit-content;
}

.btn-buy:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(146,64,14,0.3); }
.btn-buy:disabled { background: #a8a29e; cursor: not-allowed; }

/* 通用块 */
.block-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #b45309;
  display: inline-block;
}

.block-text { color: #44403c; line-height: 1.7; }

.rich-content { color: #44403c; line-height: 1.7; word-break: break-word; }
.rich-content :deep(h4) { color: #1c1917; font-weight: 600; margin: 1rem 0 0.5rem; }
.rich-content :deep(ul), .rich-content :deep(ol) { padding-left: 1.5rem; }
.rich-content :deep(li) { margin-bottom: 4px; }

/* 亮点 */
.highlight-list { display: flex; flex-direction: column; gap: 8px; }

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef9c3;
  border-radius: 8px;
  color: #44403c;
  font-size: 14px;
}

.hl-icon { flex-shrink: 0; }

/* 目录 */
.chapter-list { display: flex; flex-direction: column; gap: 6px; }

.chapter-item { display: flex; align-items: center; gap: 10px; padding: 4px 0; }

.ch-idx {
  width: 24px; height: 24px;
  background: #b45309;
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}

.ch-name { color: #44403c; font-size: 14px; }

/* 分享 */
.action-section { margin-bottom: 20px; }

.btn-share {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: #57534e;
  background: #fff;
  transition: all 0.2s;
}

.btn-share:hover { background: #f5f5f4; }

.launch-footer { text-align: center; padding: 1.5rem; color: #a8a29e; font-size: 12px; border-top: 1px solid #e7e5e4; }

@media (max-width: 768px) {
  .hero-section { flex-direction: column; align-items: center; text-align: center; }
  .book-cover, .book-cover-placeholder { width: 160px; height: 224px; }
  .hero-right { align-items: center; }
  .price-block { justify-content: center; }
  .btn-buy { width: 100%; }
}
</style>
