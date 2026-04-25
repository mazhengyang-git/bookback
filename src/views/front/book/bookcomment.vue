<template>
  <div class="book-comment-container">
    <!-- 图书整体评分头部 -->
    <div class="comment-header">
      <h3 class="comment-title">图书综合评价</h3>
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

    <!-- 【评价提交区域】权限控制：仅有权限用户展示 -->
    <div v-if="userAuthInfo.hasAuth && !userAuthInfo.hasCommented" class="comment-submit-box">
      <h4 class="submit-title">发表你的评价</h4>
      <el-form ref="submitFormRef" :model="commentForm" label-width="80px">
        <!-- 五星评分 + 数字双向同步 -->
        <el-form-item label="综合评分">
          <div class="score-input-box">
            <el-rate
              v-model="commentForm.score"
              :max="5"
              step="0.5"
              show-score
              text-color="#ff7d00"
              score-format="(val)=>val.toFixed(1)"
              @change="handleScoreChange"
            />
            <el-input
              v-model.number="commentForm.score"
              type="number"
              :min="0"
              :max="5"
              step="0.5"
              style="width: 80px; margin-left: 15px"
              @change="handleInputScoreChange"
            />
            <span class="score-tip">评分范围 0.0 ~ 5.0 分</span>
          </div>
        </el-form-item>

        <!-- 评价文字内容输入 -->
        <el-form-item label="评价内容">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            rows="4"
            maxlength="500"
            placeholder="请输入您的阅读评价、阅读感受（最多500字）"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitComment" :loading="submitLoading"
            >提交评价</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 无评价权限提示 -->
    <div v-else-if="!userAuthInfo.hasAuth" class="no-auth-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>您未购买该图书，暂无评价权限</span>
    </div>

    <!-- 已评价完成提示 -->
    <div v-else-if="userAuthInfo.hasCommented" class="has-comment-tip">
      <el-icon><SuccessFilled /></el-icon>
      <span>您已完成该图书的评价，感谢您的反馈</span>
    </div>

    <!-- 历史全部评价列表 -->
    <div class="comment-list-box">
      <h4 class="list-title">全部用户评价 ({{ commentTotalCount }})</h4>

      <!-- 暂无评价空状态 -->
      <el-empty v-if="commentList.length === 0" description="暂无用户评价，快来第一个评价吧" />

      <!-- 评价列表 -->
      <div v-else class="comment-item-wrap">
        <div v-for="item in commentList" :key="item.id" class="comment-item">
          <div class="comment-item-top">
            <span class="username">{{ item.nickname }}</span>
            <!-- 单条评价星星+数字展示 -->
            <div class="item-score">
              <el-rate
                v-model="item.score"
                disabled
                :max="5"
                size="small"
                show-score
                score-format="(val)=>val.toFixed(1)"
              />
            </div>
            <span class="comment-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="comment-content">{{ item.content || '用户未填写文字评价' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { InfoFilled, SuccessFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

import {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment,
  getRandomComments,
} from '@/api/front/bookComment'
// 导入TS类型
import type { CommentAuth, BookScore, CommentItem } from '@/types/index'

interface CommentForm {
  score: number
  content: string
}

// 接收父组件图书ID
const props = defineProps<{ bookId: number }>()
const userStore = useUserStore()

// 响应式数据
const submitFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const bookAvgScore = ref<number>(0.0)
const commentTotalCount = ref<number>(0)
const userAuthInfo = ref<CommentAuth>({ hasAuth: false, hasCommented: false })
const commentForm = ref<CommentForm>({ score: 5.0, content: '' })
const commentList = ref<CommentItem[]>([])

// 评分双向绑定
const handleScoreChange = (val: number) => {
  commentForm.value.score = parseFloat(val.toFixed(1))
}
const handleInputScoreChange = () => {
  let val = commentForm.value.score
  if (val < 0) val = 0.0
  if (val > 5) val = 5.0
  commentForm.value.score = parseFloat(val.toFixed(1))
}
const fetchRandomComments = async () => {
  if (!props.bookId) return
  try {
    const res = await getRandomComments(props.bookId)
    if (res.code === 200) {
      // 假设后端返回 { code:200, data: [comment1, comment2, comment3] }
      randomComments.value = res.data || []
    }
  } catch (err) {
    console.error('获取随机评论失败', err)
  }
}
// ========== 【字段名 userInfo → user 与详情页统一】 ==========
// 校验评价权限
const fetchCommentAuth = async () => {
  // 现在 userStore.user 能正常拿到登录用户，和详情页完全一致
  if (!userStore.user?.id) {
    userAuthInfo.value = { hasAuth: false, hasCommented: false }
    return
  }
  try {
    const res = await checkCommentAuth(props.bookId)
    if (res.code === 200) {
      userAuthInfo.value = res.data
    }
  } catch (err) {
    console.error('权限校验失败', err)
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

// 提交评价
const submitComment = async () => {
  if (!submitFormRef.value) return
  if (commentForm.value.score <= 0) {
    ElMessage.warning('请选择图书评分')
    return
  }
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }

  submitLoading.value = true
  try {
    const res = await addComment({
      bookId: props.bookId,
      score: commentForm.value.score,
      content: commentForm.value.content,
    })
    if (res.code === 200) {
      ElMessage.success('评价提交成功！')
      await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
      commentForm.value = { score: 5.0, content: '' }
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
    console.error(err)
  } finally {
    submitLoading.value = false
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
    await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
    await fetchRandomComments()
  }
})

// 监听图书ID切换
watch(
  () => props.bookId,
  async (newId) => {
    if (newId) {
      await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
    }
  },
  { immediate: true },
)
</script>
<style scoped>
.book-comment-container {
  width: 100%;
  margin-top: 40px;
  height: 100%;
  padding: 25px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
}
.comment-header {
  padding-bottom: 15px;
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

/* 评价提交区域 */
.comment-submit-box {
  margin: 25px 0;
  padding: 20px;
  background-color: #fafbfc;
  border-radius: 6px;
}
.submit-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}
.score-input-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.score-tip {
  font-size: 12px;
  color: #999;
}

/* 权限提示框 */
.no-auth-tip,
.has-comment-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  margin: 20px 0;
  border-radius: 6px;
}
.no-auth-tip {
  background-color: #fff4e5;
  color: #ff7d00;
}
.has-comment-tip {
  background-color: #e8f3ff;
  color: #409eff;
}

/* 评价列表区域 */
.comment-list-box {
  margin-top: 30px;
}
.list-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
}
.comment-item-wrap {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.comment-item {
  padding: 18px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}
.comment-item-top {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.username {
  font-weight: 600;
  color: #333;
}
.comment-time {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}
.comment-content {
  color: #444;
  line-height: 1.6;
  word-break: break-all;
}
</style>
