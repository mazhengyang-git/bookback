<template>
  <div class="salon-layout">
    <!-- 头部 -->
    <header class="salon-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <span class="back-btn" @click="router.back()">← 返回活动列表</span>
        <h1 class="salon-title">{{ activity.title }}</h1>
        <div class="status-badge" :class="statusClass">{{ statusText }}</div>
      </div>
    </header>

    <main class="salon-main">
      <!-- 嘉宾介绍（扩展字段） -->
      <section v-if="extraFields.guests && extraFields.guests.length" class="guest-section">
        <h3 class="block-title">特邀嘉宾</h3>
        <div class="guest-grid">
          <div v-for="(guest, i) in extraFields.guests" :key="i" class="guest-card">
            <div class="guest-avatar">{{ (guest.name || guest)[0] }}</div>
            <div class="guest-info">
              <span class="guest-name">{{ guest.name || guest }}</span>
              <span v-if="guest.title" class="guest-title">{{ guest.title }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 活动简介 -->
      <section v-if="detail?.desc" class="block-section">
        <h3 class="block-title">活动简介</h3>
        <p class="block-text">{{ detail.desc }}</p>
      </section>

      <!-- 活动详情 -->
      <section v-if="detailContent" class="block-section">
        <h3 class="block-title">活动详情</h3>
        <div class="rich-content" v-html="detailContent"></div>
      </section>

      <!-- 议程（扩展字段） -->
      <section v-if="extraFields.agenda && extraFields.agenda.length" class="block-section">
        <h3 class="block-title">活动议程</h3>
        <div class="agenda-timeline">
          <div v-for="(item, i) in extraFields.agenda" :key="i" class="agenda-item">
            <div class="agenda-time">{{ item.time }}</div>
            <div class="agenda-dot"></div>
            <div class="agenda-content">
              <span class="agenda-title">{{ item.title }}</span>
              <span v-if="item.speaker" class="agenda-speaker">主讲：{{ item.speaker }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 基本信息 -->
      <section class="info-section">
        <div class="info-row">
          <span class="info-label">活动时间</span>
          <span class="info-value">{{ formatDate(activity.time) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">发起人</span>
          <span class="info-value">{{ activity.name || '组委会' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">发布时间</span>
          <span class="info-value">{{ formatDate(activity.create_time) }}</span>
        </div>
      </section>

      <!-- 操作 -->
      <section class="action-section">
        <button class="btn-join" :disabled="isDisabled" @click="handleJoin">{{ buttonText }}</button>
        <button class="btn-share" @click="handleShare">分享活动</button>
      </section>
    </main>

    <footer class="salon-footer">
      <p>© 2026 星途科幻图书 · 科幻作家沙龙</p>
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
.salon-layout { min-height: 100vh; background: #0f172a; color: #e2e8f0; }

.salon-header { position: relative; padding: 2rem 1rem 3rem; overflow: hidden; }

.header-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  z-index: 0;
}

.header-content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }

.back-btn {
  cursor: pointer;
  color: #a5b4fc;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.back-btn:hover { color: #fff; }

.salon-title { font-size: 1.8rem; font-weight: 700; margin: 0 0 12px; color: #fff; }

.status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.bg-blue { background: #3b82f6; color: #fff; }
.bg-green { background: #10b981; color: #fff; }
.bg-yellow { background: #f59e0b; color: #000; }
.bg-gray { background: #6b7280; color: #fff; }
.bg-red { background: #ef4444; color: #fff; }

.salon-main { max-width: 900px; margin: 0 auto; padding: 1rem; }

/* 嘉宾 */
.guest-section {
  background: rgba(30,27,75,0.6);
  border: 1px solid rgba(139,92,246,0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.guest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }

.guest-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.guest-avatar {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #fff; font-size: 16px; flex-shrink: 0;
}

.guest-info { display: flex; flex-direction: column; gap: 2px; }
.guest-name { color: #e2e8f0; font-weight: 600; font-size: 14px; }
.guest-title { color: #94a3b8; font-size: 12px; }

/* 通用块 */
.block-section {
  background: rgba(30,27,75,0.6);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.block-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #a5b4fc;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(139,92,246,0.5);
  display: inline-block;
}

.block-text { color: #cbd5e1; line-height: 1.7; }

.rich-content { color: #cbd5e1; line-height: 1.7; word-break: break-word; }
.rich-content :deep(h4) { color: #e2e8f0; font-weight: 600; margin: 1rem 0 0.5rem; }
.rich-content :deep(ul), .rich-content :deep(ol) { padding-left: 1.5rem; }
.rich-content :deep(li) { margin-bottom: 4px; }

/* 议程时间线 */
.agenda-timeline { display: flex; flex-direction: column; gap: 0; }

.agenda-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-left: 2px solid rgba(139,92,246,0.3);
  padding-left: 16px;
  position: relative;
}

.agenda-dot {
  position: absolute;
  left: -6px;
  top: 16px;
  width: 10px; height: 10px;
  background: #8b5cf6;
  border-radius: 50%;
}

.agenda-time { color: #a5b4fc; font-size: 13px; min-width: 80px; flex-shrink: 0; }

.agenda-content { display: flex; flex-direction: column; gap: 2px; }
.agenda-title { color: #e2e8f0; font-weight: 600; font-size: 14px; }
.agenda-speaker { color: #94a3b8; font-size: 12px; }

/* 信息 */
.info-section {
  background: rgba(30,27,75,0.6);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(139,92,246,0.15);
}

.info-row:last-child { border-bottom: none; }
.info-label { color: #94a3b8; font-size: 14px; }
.info-value { color: #e2e8f0; font-weight: 600; font-size: 14px; }

/* 按钮 */
.action-section { display: flex; gap: 12px; margin-bottom: 2rem; }

.btn-join {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  transition: all 0.3s;
}

.btn-join:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,92,246,0.4); }
.btn-join:disabled { background: #4b5563; cursor: not-allowed; }

.btn-share {
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(139,92,246,0.4);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #a5b4fc;
  background: transparent;
  transition: all 0.2s;
}

.btn-share:hover { background: rgba(139,92,246,0.15); }

.salon-footer { text-align: center; padding: 1.5rem; color: #475569; font-size: 12px; border-top: 1px solid rgba(139,92,246,0.2); }

@media (max-width: 768px) {
  .salon-title { font-size: 1.3rem; }
  .action-section { flex-direction: column; }
  .guest-grid { grid-template-columns: 1fr; }
}
</style>
