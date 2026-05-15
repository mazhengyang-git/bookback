<template>
  <div class="activity-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-message">
      <p style="color:red; font-size:18px;">{{ error }}</p>
      <button @click="fetchDetail" class="retry-btn">重新加载</button>
      <button @click="router.back()" class="retry-btn" style="margin-left: 12px; background: #409eff; color: white;">返回</button>
    </div>

    <!-- 根据 page_type 动态切换布局组件 -->
    <template v-else-if="activityData">
   <!--@vue-ignore--> <component
  :is="layoutComponent"
  :activity="activityData"
  :detail="activityData.detail"
  :extra-fields="activityData.extra_fields || {}"
/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getHuodongDetailApi } from '@/api/front/huodong'
import type { ActivityDetailData } from '@/types/front/huodong'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const activityData = ref<ActivityDetailData | null>(null)

// 动态导入布局组件，按 page_type 匹配
const layoutMap: Record<string, () => Promise<Component>> = {
  reading_club: () => import('./layouts/ReadingClubLayout.vue'),
  salon: () => import('./layouts/SalonLayout.vue'),
  book_launch: () => import('./layouts/BookLaunchLayout.vue'),
  default: () => import('./layouts/DefaultLayout.vue'),
}

const layoutComponent = computed(() => {
  if (!activityData.value) return layoutMap['default']
  const t = activityData.value.title || ''

  // 自动识别规则
  let autoType = 'default'
  if (t.includes('三体') || t.includes('读书会')) autoType = 'reading_club'
  else if (t.includes('新书') || t.includes('发布') || t.includes('银河帝国')) autoType = 'book_launch'
  else if (t.includes('沙龙') || t.includes('作家') || t.includes('未来')) autoType = 'salon'

  const loader = layoutMap[autoType] || layoutMap['default']
  return defineAsyncComponent(loader)
})
const fetchDetail = async () => {
  // 取 id 和 title
  const id = Number(route.params.id)
  const title = decodeURIComponent(route.params.title as string)

  if (!id || isNaN(id) || !title) {
    error.value = '无效的活动链接'
    return
  }

  loading.value = true
  error.value = null
  try {
    // 调用双参数版的 API
    const res = await getHuodongDetailApi(id, title)//@ts-ignore
    if (res.code === 200) {//@ts-ignore
      activityData.value = res.data
    } else {//@ts-ignore
      error.value = res.msg || '获取活动详情失败'
    }
  } catch (err: any) {
    error.value = '网络错误，请稍后重试'
    console.error('获取活动详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 路由参数变化时重新加载
watch(() => [route.params.id, route.params.title], () => {
  fetchDetail()
})

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.retry-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>