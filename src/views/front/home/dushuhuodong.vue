<template>
  <div class="home-reading-events section-glow">
    <h2 class="sci-fi-title">读书活动</h2>
    <div v-if="readingEvents.length === 0" class="empty-tip">
      <el-empty description="暂无读书活动" />
    </div>
    <div v-else class="events-list">
      <el-card v-for="event in readingEvents" :key="event.id" class="event-card">
        <h3>{{ event.title }}</h3>
        <p class="event-time">时间：{{ event.time }}</p>
        <p>{{ event.content }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElEmpty } from 'element-plus'

// 读书活动
const readingEvents = ref([
  {
    id: 1,
    title: '《三体》线上共读会',
    time: '2026-04-25 19:00',
    content: '一起探讨三体宇宙的奥秘',
  },
  {
    id: 2,
    title: '科幻作家沙龙：未来世界的构建',
    time: '2026-05-01 14:00',
    content: '邀请知名科幻作家分享创作经验',
  },
])
</script>

<style scoped>
/* 读书活动 */
.home-reading-events {
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  max-width: 800px;
  margin: 0 auto;
}

.event-card {
  padding: clamp(15px, 2vw, 20px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: clamp(8px, 1vw, 12px);
}

.event-time {
  color: #666;
  font-size: clamp(12px, 1vw, 14px);
  margin: clamp(5px, 0.5vw, 8px) 0;
}

/* 标题样式 */
.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #409eff;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  animation: titlePulse 2s infinite alternate;
}

@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(78, 79, 79, 0.768);
  }
}

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}

/* 区域发光边框效果 */
.section-glow {
  border: 1px solid rgba(64, 158, 255, 0.12) !important;
  border-radius: clamp(10px, 1.2vw, 16px) !important;
  box-shadow:
    0 0 15px rgba(64, 158, 255, 0.06),
    0 4px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  position: relative;
  margin: -1px !important;
  padding: 1px !important;
}

/* 区域顶部高光条 */
.section-glow::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(64, 158, 255, 0.5) 30%,
    rgba(100, 181, 246, 0.8) 50%,
    rgba(64, 158, 255, 0.5) 70%,
    transparent 100%
  );
  z-index: 2;
  border-radius: clamp(10px, 1.2vw, 16px) clamp(10px, 1.2vw, 16px) 0 0;
  animation: glowLine 4s ease-in-out infinite alternate;
}

@keyframes glowLine {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 活动卡片增强 */
.event-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  border: 1px solid rgba(64, 158, 255, 0.12) !important;
  transition: all 0.3s ease !important;
}

.event-card:hover {
  border-color: rgba(64, 158, 255, 0.3) !important;
  box-shadow:
    0 6px 20px rgba(64, 158, 255, 0.1),
    0 4px 15px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}
</style>
