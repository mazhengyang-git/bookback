<template>
  <div class="reading-club-layout">
    <!-- 头部 -->
    <header class="club-header">
      <div class="header-content">
        <h1 class="main-title">{{ activity.title || '读书会活动' }}</h1>
        <div class="back-button" @click="router.back()">← 返回</div>
      </div>
    </header>

    <main class="club-main">
      <!-- 封面区域 -->
      <section class="cover-section">
        <img
          :src="activity.image || '/img/default-book.jpg'"
          :alt="activity.title"
          class="cover-image"
          @error="onImgError"
        />
        <div class="cover-overlay"></div>
        <div class="cover-content">
          <div class="activity-status" :class="statusClass">{{ statusText }}</div>
          <h2 class="cover-title">{{ activity.title }}</h2>
        </div>
      </section>

      <!-- 信息卡片 -->
      <section class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div class="info-text">
              <span class="label">活动时间</span>
              <span class="value">{{ formatDate(activity.time) }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🕒</span>
            <div class="info-text">
              <span class="label">发布时间</span>
              <span class="value">{{ formatDate(activity.create_time) }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">👤</span>
            <div class="info-text">
              <span class="label">发起人</span>
              <span class="value">{{ activity.name || '读书会组委会' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 活动简介 -->
      <section v-if="detail?.desc" class="desc-section">
        <h3 class="section-title">活动简介</h3>
        <div class="desc-content">
          <p>{{ detail.desc }}</p>
        </div>
      </section>

      <!-- 活动详情（富文本） -->
      <section v-if="detailContent" class="content-section">
        <h3 class="section-title">活动详情</h3>
        <div class="rich-wrapper" v-html="detailContent"></div>
      </section>

      <!-- 扩展字段：推荐书单、讨论话题等 -->
      <section v-if="extraFields.book_list" class="extra-section">
        <h3 class="section-title">推荐书单</h3>
        <div class="book-list">
          <div v-for="(book, i) in extraFields.book_list" :key="i" class="book-item">
            <span class="book-idx">{{ Number(i) + 1 }}</span>
            <span class="book-name">{{ book }}</span>
          </div>
        </div>
      </section>

      <section v-if="extraFields.discussion_topics" class="extra-section">
        <h3 class="section-title">讨论话题</h3>
        <div class="topic-list">
          <div v-for="(topic, i) in extraFields.discussion_topics" :key="i" class="topic-item">
            💬 {{ topic }}
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="action-section">
        <button class="btn btn-primary" :disabled="isDisabled" @click="handleJoin">
          {{ buttonText }}
        </button>
        <button class="btn btn-secondary" @click="handleShare">↗ 分享活动</button>
      </section>
    </main>

    <footer class="club-footer">
      <p>© 2026 {{ activity.title || '读书会' }} 版权所有</p>
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
  const map: Record<number, string> = { 0: 'st-up', 1: 'st-on', 2: 'st-end', 3: 'st-done', 4: 'st-cancel' }
  return map[props.activity.status] || 'st-up'
})

const formatDate = (d?: string) => {
  if (!d) return '待定'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const detailContent = computed(() => props.detail?.content || props.activity.content || '')

const isDisabled = computed(() => props.activity.status === 3 || props.activity.status === 4)
const buttonText = computed(() => {
  const s = props.activity.status
  if (s === 3) return '活动已结束'
  if (s === 4) return '活动已取消'
  if (s === 0) return '报名即将开始'
  return '立即报名'
})

const handleJoin = () => { if (!isDisabled.value) alert('报名功能将在正式版本中实现') }
const handleShare = () => {
  if (navigator.share) {
    navigator.share({ title: props.activity.title, url: window.location.href }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('链接已复制到剪贴板')).catch(() => {})
  }
}
</script>

<style scoped>
.reading-club-layout { min-height: 100vh; background: #fff; }

.club-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.main-title { font-size: 1.4rem; font-weight: 600; margin: 0; }

.back-button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.back-button:hover { background: rgba(255,255,255,0.35); }

.club-main { max-width: 1000px; margin: 0 auto; padding: 1rem; }

/* 封面 */
.cover-section {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  height: 300px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.cover-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.cover-image:hover { transform: scale(1.03); }

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(102,126,234,0.8), rgba(118,75,162,0.8));
}

.cover-content { position: absolute; bottom: 2rem; left: 2rem; right: 2rem; color: #fff; }

.activity-status {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.st-up { background: #3b82f6; }
.st-on { background: #10b981; }
.st-end { background: #f59e0b; }
.st-done { background: #6b7280; }
.st-cancel { background: #ef4444; }

.cover-title { font-size: 1.8rem; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin: 0; }

/* 信息区 */
.info-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.info-item { display: flex; align-items: center; gap: 0.8rem; }
.info-icon { font-size: 1.4rem; }
.info-text { display: flex; flex-direction: column; gap: 2px; }
.info-text .label { font-size: 0.85rem; color: #6b7280; }
.info-text .value { font-size: 1rem; font-weight: 600; color: #1f2937; }

/* 段落 */
.desc-section, .content-section, .extra-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
}

.desc-content { line-height: 1.7; color: #4b5563; }

.rich-wrapper { line-height: 1.7; color: #4b5563; word-break: break-word; }
.rich-wrapper :deep(h4) { font-size: 1rem; font-weight: 600; color: #1f2937; margin: 1.2rem 0 0.6rem; }
.rich-wrapper :deep(ul), .rich-wrapper :deep(ol) { padding-left: 1.5rem; margin: 0.5rem 0; }
.rich-wrapper :deep(li) { margin-bottom: 4px; }

/* 扩展：书单 */
.book-list { display: flex; flex-direction: column; gap: 8px; }
.book-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.book-idx {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; flex-shrink: 0;
}
.book-name { color: #1f2937; font-size: 14px; }

/* 扩展：话题 */
.topic-list { display: flex; flex-direction: column; gap: 8px; }
.topic-item { padding: 8px 12px; background: #f3f4f6; border-radius: 8px; color: #374151; font-size: 14px; }

/* 按钮 */
.action-section { display: flex; gap: 1rem; margin-bottom: 2rem; }

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102,126,234,0.3); }
.btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }

.btn-secondary { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }
.btn-secondary:hover { background: #e5e7eb; }

.club-footer { text-align: center; padding: 1.5rem; color: #9ca3af; font-size: 0.8rem; border-top: 1px solid #e5e7eb; }

@media (max-width: 768px) {
  .cover-section { height: 200px; }
  .cover-title { font-size: 1.3rem; }
  .cover-content { bottom: 1rem; left: 1rem; right: 1rem; }
  .action-section { flex-direction: column; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
