<template>
  <!-- 右侧渐变背景公告抽屉 -->
  <div class="notice-drawer" :class="modelValue ? 'open' : 'close'">
    <div class="drawer-header">
      <h3 class="gg">官方公告</h3>
      <span class="close" @click="handleClose">×</span>
    </div>
    <hr style="color: #000; height: 1.5px; width: 100%" />
    <div class="notice-content">
      <div v-for="item in noticeList" :key="item.id" class="notice-item">
        <h4>{{ item.title }}</h4>
        <p>{{ item.content }}</p>
        <span>{{ formatTime(item.create_time) }}</span>
      </div>
      <div v-if="!noticeList.length" class="empty">暂无公告</div>
    </div>
  </div>

  <!-- 遮罩层 -->
  <div class="mask" v-show="modelValue" @click="handleClose"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAnnouncementList } from '@/api/front/announcement'
import type { Announcement } from '@/types/index'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
}>()

const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const noticeList = ref<Announcement[]>([])

const getNotice = async () => {
  try {
    const res = await getAnnouncementList()//@ts-ignore
    if (res?.code === 200) {//@ts-ignore
      noticeList.value = res.data
    }
  } catch (e) {}
}

const handleClose = () => {
  emit('update:modelValue', false)
}

onMounted(() => {
  getNotice()
})
</script>

<style scoped>
.gg {
  animation: icon 1s ease infinite;
}
@keyframes icon {
  0%,100% { transform: rotate3d(0, 0, 1, 0deg) translate3d(0, 0, 0); }
  25% { transform: rotate3d(0, 0, 1, 5deg) translate3d(-3px, 0, 0); }
  50% { transform: translate3d(3px, 0, 0) rotate3d(0, 0, 1, -5deg); }
}

/* transform 动画 */
.notice-drawer {
  position: fixed;
  top: 0;
  right: 0;
  transform: translateX(100%);
  width: clamp(300px, 35vw, 400px);
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #d5d5d6 100%);
  box-shadow: 4px 0 4px rgba(241, 4, 4, 0.17);
  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 88999; /* 重绘 */
  display: flex;
  flex-direction: column;
  will-change: transform; /* 浏览器预加速 */
}
.notice-drawer.close {
  transform: translateX(100%);
}
.notice-drawer.open {
  transform: translateX(0);
}

.drawer-header {
  padding: clamp(20px, 2.5vw, 30px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drawer-header h3 {
  color: #010101;
  font-size: clamp(18px, 1.8vw, 22px);
  background: linear-gradient(90deg, #409eff, #64b5f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.close {
  color: #000000;
  font-size: clamp(24px, 2.5vw, 30px);
  cursor: pointer;
  transition: color 0.3s;
}
.close:hover {
  color: #ff6b6b;
}
.notice-content {
  flex: 1;
  padding: clamp(20px, 2.5vw, 30px);
  overflow-y: auto;
}
.notice-item {
  margin-bottom: clamp(20px, 2.5vw, 30px);
  padding-bottom: clamp(15px, 2vw, 20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.notice-item h4 {
  color: #409eff;
  font-size: clamp(16px, 1.5vw, 18px);
  margin-bottom: clamp(10px, 1.2vw, 15px);
}
.notice-item p {
  color: #000000;
  line-height: 1.6;
  margin-bottom: clamp(8px, 1vw, 10px);
}
.notice-item span {
  color: #000000;
  font-size: clamp(12px, 1vw, 14px);
}
.empty {
  color: #3d3d3d;
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}

/* 遮罩层 */
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1998;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
}
.mask.active {
  opacity: 1;
  visibility: visible;
}
</style>
