<template>
  <div class="default-layout">
    <!-- 头部导航 -->
    <header class="detail-header">
      <div class="header-inner">
        <span class="back-btn" @click="router.back()">← 返回</span>
        <h1 class="header-title">{{ activity.title }}</h1>
        <span class="status-tag" :class="statusClass">{{ statusText }}</span>
      </div>
    </header>

    <main class="detail-main">
      <!-- 封面图 -->
      <section v-if="activity.image" class="cover-section">
        <img
          :src="activity.image"
          :alt="activity.title"
          class="cover-img"
          @error="onImgError"
        />
      </section>

      <!-- 基本信息 -->
      <section class="info-section">
        <div class="info-row">
          <span class="info-label">活动时间</span>
          <span class="info-value">{{ formatDate(activity.time) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">发起人</span>
          <span class="info-value">{{ activity.name || '管理员' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">发布时间</span>
          <span class="info-value">{{ formatDate(activity.create_time) }}</span>
        </div>
      </section>

      <!-- 活动简介 -->
      <section v-if="detail?.desc" class="section-block">
        <h3 class="block-title">活动简介</h3>
        <p class="block-text">{{ detail.desc }}</p>
      </section>

      <!-- 富文本详情 -->
      <section v-if="detailContent" class="section-block">
        <h3 class="block-title">活动详情</h3>
        <div class="rich-content" v-html="detailContent"></div>
      </section>

      <!-- 扩展字段 -->
      <section v-if="hasExtraFields" class="section-block">
        <h3 class="block-title">更多信息</h3>
        <div class="extra-fields">
          <template v-for="(val, key) in extraFields" :key="key">
            <div v-if="val && key !== '__proto__'" class="extra-item">
              <span class="extra-key">{{ formatKey(key as string) }}</span>
              <span class="extra-val">{{ val }}</span>
            </div>
          </template>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="action-section">
        <button class="btn-primary" :disabled="isDisabled" @click="handleJoin">
          {{ buttonText }}
        </button>
        <button class="btn-secondary" @click="handleShare">分享活动</button>
      </section>
    </main>

    <footer class="detail-footer">
      <p>© 2026 星途科幻图书</p>
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

// 图片兜底
let imgFallbacked = false
const onImgError = (e: Event) => {
  if (imgFallbacked) return
  imgFallbacked = true
  const img = e.target as HTMLImageElement
  img.src = '/img/default-book.jpg'
}

// 状态文字
const statusText = computed(() => {
  const map: Record<number, string> = { 0: '未开始', 1: '进行中', 2: '快结束', 3: '已结束', 4: '已取消' }
  return map[props.activity.status] || '未知'
})

const statusClass = computed(() => {
  const map: Record<number, string> = { 0: 'st-upcoming', 1: 'st-active', 2: 'st-ending', 3: 'st-ended', 4: 'st-cancelled' }
  return map[props.activity.status] || 'st-upcoming'
})

// 日期格式化
const formatDate = (d?: string) => {
  if (!d) return '待定'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// 富文本内容：优先用详情表的content，其次用主表的content
const detailContent = computed(() => {
  return props.detail?.content || props.activity.content || ''
})

// 扩展字段
const hasExtraFields = computed(() => {
  const ef = props.extraFields
  return ef && Object.keys(ef).length > 0
})

const formatKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

// 按钮逻辑
const isDisabled = computed(() => props.activity.status === 3 || props.activity.status === 4)
const buttonText = computed(() => {
  const s = props.activity.status
  if (s === 3) return '活动已结束'
  if (s === 4) return '活动已取消'
  if (s === 0) return '报名即将开始'
  return '立即报名'
})

const handleJoin = () => {
  if (isDisabled.value) return
  alert('报名功能将在正式版本中实现')
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({ title: props.activity.title, text: props.detail?.desc || '', url: window.location.href }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('链接已复制到剪贴板')).catch(() => {})
  }
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.detail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  cursor: pointer;
  padding: 6px 14px;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.2s;
}

.back-btn:hover { background: rgba(255,255,255,0.35); }

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.st-upcoming { background: #3b82f6; }
.st-active { background: #10b981; }
.st-ending { background: #f59e0b; }
.st-ended { background: #6b7280; }
.st-cancelled { background: #ef4444; }

.detail-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px;
}

.cover-section {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.cover-img {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

.info-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child { border-bottom: none; }

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #1f2937;
  font-weight: 600;
  font-size: 14px;
}

.section-block {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.block-text {
  color: #4b5563;
  line-height: 1.7;
  font-size: 14px;
}

.rich-content {
  color: #4b5563;
  line-height: 1.7;
  font-size: 14px;
  word-break: break-word;
}

.rich-content :deep(h4) {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 16px 0 8px;
}

.rich-content :deep(ul),
.rich-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.rich-content :deep(li) {
  margin-bottom: 4px;
}

.extra-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extra-item {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.extra-key {
  color: #6b7280;
  min-width: 100px;
  font-size: 14px;
}

.extra-val {
  color: #1f2937;
  font-size: 14px;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102,126,234,0.3);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #4b5563;
  background: #f3f4f6;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.detail-footer {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 12px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .header-inner { flex-wrap: wrap; }
  .header-title { font-size: 16px; order: -1; width: 100%; }
  .action-section { flex-direction: column; }
}
</style>
