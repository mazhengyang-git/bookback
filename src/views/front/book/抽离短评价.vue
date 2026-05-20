<template>
  <div class="book-comment-container">
    <div class="comment-header">
      <!-- 区域 v-if ，数据没好完全不渲染 -->
      <div v-if="bookAvgScore !== null" class="score-summary">
        <el-rate
          v-model="bookAvgScore"
          disabled
          :max="5"
          show-score
          text-color="#ff7d00"
          score-format="(value) => value.toFixed(1)"
        />
        <!-- <span class="avg-score-text">{{ bookAvgScore.toFixed(1) }} 分</span> -->
      </div>
      <!-- 数据没加载时：用空占位，保持布局位置不变 -->
      <div v-else class="score-summary placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getBookAvgScore, getCommentList, getRandomComments } from '@/api/front/bookComment'
import type { CommentItem } from '@/types/index'

//  source 参数
const props = defineProps<{ 
  bookId: number;
  source: string;
}>()

// 初始 null：不渲染、不占位、不闪烁
const bookAvgScore = ref<number | null>(null)
const commentTotalCount = ref<number>(0)
const commentList = ref<CommentItem[]>([])

const fetchRandomComments = async () => {
  if (!props.bookId) return
  try {
    // 传 source
    const res = await getRandomComments(props.bookId, props.source)
    if (res.code === 200) {
      commentList.value = res.data || []
    }
  } catch (err) {
    console.error('获取随机评论失败', err)
  }
}

const fetchBookScore = async () => {
  try {
    // 传 source
    const res = await getBookAvgScore(props.bookId, props.source)//@ts-ignore
    if (res.code === 200) {
      bookAvgScore.value = res.data.avgScore || 0.0
      commentTotalCount.value = res.data.commentCount || 0
    }
  } catch (err) {
    console.error('获取评分失败', err)
  }
}

const fetchCommentList = async () => {
  try {
    // 传入 source
    const res = await getCommentList(props.bookId, props.source)//@ts-ignore
    if (res.code === 200) {
      commentList.value = res.data || []
    }
  } catch (err) {
    console.error('获取评价列表失败', err)
  }
}

onMounted(async () => {
  if (props.bookId) {
    await Promise.all([fetchBookScore(), fetchCommentList()])
    await fetchRandomComments()
  }
})

watch(
  () => props.bookId,
  async (newId) => {
    if (newId) {
      bookAvgScore.value = null // 切换时重置，防止旧数据闪烁
      await Promise.all([fetchBookScore(), fetchCommentList()])
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.book-comment-container {
 
 transform: scale(0.86);
user-select: none;
  border-radius: 8px;
 
}


.score-summary {
  display: flex;
  align-items: center;
  gap: 2px;
}
.avg-score-text {
  font-size: 13px;
  font-weight: 600;
  color: #ff7d00;
}
.count-text {
  font-size: 1px;
  color: #666;
  margin-left: 10px;
}
</style>