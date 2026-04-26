<template>
  <div class="book-comment-container">
    <!-- 图书整体评分头部 -->
    <div class="comment-header">
      <div class="score-summary">
        <!-- 五星评分展示 -->
        <el-rate
          v-model="bookAvgScore"
          disabled
          :max="5"
          show-score
          text-color="#ff7d00"
          score-format="(value) => value.toFixed(1)"
        />
        <span class="avg-score-text">{{ bookAvgScore.toFixed(1) }} 分</span>
        <span class="count-text">共 {{ commentTotalCount }} 人评价</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import { getBookAvgScore, getCommentList, getRandomComments } from '@/api/front/bookComment'
// 导入TS类型
import type { CommentItem } from '@/types/index'

// 接收父组件图书ID
const props = defineProps<{ bookId: number }>()

// 响应式数据
const bookAvgScore = ref<number>(0.0)
const commentTotalCount = ref<number>(0)
const commentList = ref<CommentItem[]>([])

const fetchRandomComments = async () => {
  if (!props.bookId) return
  try {
    const res = await getRandomComments(props.bookId)
    if (res.code === 200) {
      // 假设后端返回 { code:200, data: [comment1, comment2, comment3] }
      getRandomComments.value = res.data || []
    }
  } catch (err) {
    console.error('获取随机评论失败', err)
  }
}

// 获取图书评分
const fetchBookScore = async () => {
  try {
    const res = await getBookAvgScore(props.bookId)
    if (res.code === 200) {
      bookAvgScore.value = res.data.avgScore || 0.0
      commentTotalCount.value = res.data.commentCount || 0
    }
  } catch (err) {
    console.error('获取评分失败', err)
  }
}

// 获取评价列表
const fetchCommentList = async () => {
  try {
    const res = await getCommentList(props.bookId)
    if (res.code === 200) {
      commentList.value = res.data || []
    }
  } catch (err) {
    console.error('获取评价列表失败', err)
  }
}

// 时间格式化
const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 初始化加载
onMounted(async () => {
  if (props.bookId) {
    await Promise.all([fetchBookScore(), fetchCommentList()])
    await fetchRandomComments()
  }
})

// 监听图书ID切换
watch(
  () => props.bookId,
  async (newId) => {
    if (newId) {
      await Promise.all([fetchBookScore(), fetchCommentList()])
    }
  },
  { immediate: true },
)
</script>
<style scoped>
.book-comment-container {
  width: 40%;
  margin-top: 10px;
  height: 100px;
  padding: 12px;

  border-radius: 8px;
  border: 1px solid #eee;
}
.comment-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}
.comment-title {
  font-size: 20px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
}
.score-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avg-score-text {
  font-size: 18px;
  font-weight: 600;
  color: #ff7d00;
}
.count-text {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}
</style>
