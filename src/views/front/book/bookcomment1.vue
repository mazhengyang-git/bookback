<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="book-comment-container">
    <div class="comment-header">
      <h3 class="comment-title">图书综合评价</h3>
      <div class="score-summary">
        <el-rate
          v-if="bookAvgScore !== null"
          v-model="bookAvgScore"
          disabled
          :max="5"
          show-score
          text-color="#ff7d00"
          :score-format="(value: number) => value.toFixed(1)"
        />
        <span class="count-text">共 {{ commentTotalCount }} 人评价</span>
      </div>
    </div>

  
    <!-- 评价列表 -->
    <div class="comment-list-box">
      <h4 class="list-title">全部用户评价 ({{ commentTotalCount }})</h4>
      <el-empty v-if="commentList.length === 0" description="暂无用户评价，快来第一个评价吧" />
      <div v-else class="comment-item-wrap">
        <div v-for="item in commentList" :key="item.id" class="comment-item">
          <div class="comment-item-top">
            <span 
              class="username" 
              style="cursor:pointer;color:#409eff" 
              @click="goUserInfo(item.nickname)"
            >
              {{ item.nickname }}
            </span>

            <div class="item-score">
              <el-rate
                v-model="item.score"
                disabled
                :max="5"
                size="small"
                show-score
                :score-format="(val)=>val.toFixed(1)"
              />
            </div>
            <span class="comment-time">{{ formatTime(item.createTime) }}</span>
            
            <el-button 
              v-if="userStore.user?.id === item.userId && editCommentId !== item.id"
              type="primary" 
              link 
              size="small"
              @click="handleEditComment(item)"
            >编辑</el-button>
            <el-button 
              v-if="userStore.user?.id === item.userId"
              type="danger" 
              link 
              size="small"
              @click="handleDeleteComment(item.id)"
            >删除</el-button>
          </div>

          <div class="comment-content">
            <div v-if="editCommentId === item.id" class="edit-box">
              <div class="score-input-box mb-10">
                <el-rate
                  v-model="editForm.score"
                  :max="5"
                  step="0.5"
                  show-score
                  text-color="#ff7d00"
                  :score-format="(val)=>val.toFixed(1)"
                  @change="handleEditScoreChange"
                />
                <el-input
                  v-model.number="editForm.score"
                  type="number"
                  :min="0"
                  :max="5"
                  step="0.5"
                  style="width: 80px; margin-left: 15px"
                  @change="handleEditInputScoreChange"
                />
                <span class="score-tip">评分范围 0.0 ~ 5.0 分</span>
              </div>
              <el-input
                v-model="editForm.content"
                type="textarea"
                rows="3"
                maxlength="500"
                show-word-limit
                class="mb-10"
              />
              <div class="edit-btn-group">
                <el-button size="small" type="primary" @click="saveEditComment(item.id)">保存</el-button>
                <el-button size="small" @click="cancelEditComment">取消</el-button>
              </div>
            </div>
            <span v-else>{{ item.content || '用户未填写文字评价' }}</span>
          </div>

          <!-- 追评输入框 -->
          <div class="reply-input-box">
            <el-input
              v-model="replyContent[item.id]"
              placeholder="商家回复：热情问答，文明用语"
              maxlength="200"
              show-word-limit
              :rows="2"
              type="textarea"
            />
            <el-button 
              size="small" 
              type="primary" 
              class="mt-5"
              :loading="replyLoading[item.id]"
              @click="submitReply(item.id)"
            >发表回复</el-button>
          </div>

          <!-- 追评列表：显示【商家】标签 -->
          <div v-if="item.replyList && item.replyList.length > 0" class="reply-list">
  <div class="reply-title">追评/商家回复 ({{ item.replyList.length }})</div>
  <div class="reply-item-list">
    <div 
      v-for="(reply, idx) in getShowReplyList(item.id, item.replyList)" 
      :key="reply.id" 
      class="reply-item"
    >
      <div class="reply-top">
        <span style="user-select: none;" class="reply-name">
          <!-- 商家回复：显示店铺名 -->
          <template v-if="reply.isSeller" >
            {{ reply.shopName || shopName }}
          </template>
          <!-- 普通用户：显示账号名 -->
          <template v-else>
            {{ reply.nickname }}
          </template>
        </span>
        <el-tag v-if="reply.isSeller" type="success" size="small">商家</el-tag>
        <span class="reply-time">{{ formatTime(reply.createTime) }}</span>

        <!-- 新增：删除按钮（仅发布者可见） -->
        <el-button 
          v-if="userStore.user?.id === reply.userId"
          type="danger" 
          link 
          size="small"
          style="margin-left: 10px"
          @click="handleDeleteReply(reply.id, item.id)"
        >删除</el-button>
      </div>
      <div class="reply-content">{{ reply.content }}</div>
    </div>
  </div>
  <div 
    v-if="item.replyList.length > 3" 
    class="expand-btn"
    @click="toggleExpandReply(item.id)"
  >
    <span>{{ expandedReplies[item.id] ? '收起↑' : '展开↓' }}</span>
  </div>
</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'

import {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment,
  getRandomComments,
  deleteCommentApi,
  editCommentApi,
  addReplyApi,
  getReplyListApi,
  deleteReplyApi
} from '@/api/front/bookComment1'

import { getSellerProfileApi } from '@/api/seller/profile'

// 在组件顶部变量
const shopName = ref('商家') // 默认值
const loadShopInfo = async () => {
  try {
    const res = await getSellerProfileApi()
    if (res.code === 200 && res.data?.shop_name) {
      shopName.value = res.data.shop_name
    }
  } catch (err) {
    console.error('获取店铺信息失败', err)
  }
}

interface CommentForm { score: number; content: string }
interface CommentItem {
  id: number; userId: number; nickname: string; score: number;
  content: string; createTime: string; replyList?: any[];
}
interface CommentAuth { hasAuth: boolean; hasCommented: boolean }

const props = defineProps<{ bookId: number; source: string }>()
const userStore = useUserStore()
const emit = defineEmits(['comment-updated'])
const router = useRouter()

const allImagesLoaded = ref(false)
const submitFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const bookAvgScore = ref<number | null>(null)
const commentTotalCount = ref<number>(0)
const userAuthInfo = ref<CommentAuth>({ hasAuth: false, hasCommented: false })
const commentForm = ref<CommentForm>({ score: 5.0, content: '' })
const commentList = ref<CommentItem[]>([])
const randomComments = ref<any[]>([])

const editCommentId = ref<number>(0)
const editForm = ref<CommentForm>({ score: 0, content: '' })

const replyContent = ref<Record<number, string>>({})
const replyLoading = ref<Record<number, boolean>>({})
const expandedReplies = ref<Record<number, boolean>>({})

const toggleExpandReply = (commentId: number) => {
  expandedReplies.value[commentId] = !expandedReplies.value[commentId]
}

const getShowReplyList = (commentId: number, list: any[]) => {
  return expandedReplies.value[commentId] ? list : list.slice(0, 3)
}

// 发表回复：自动标记为商家
const submitReply = async (commentId: number) => {
  const content = replyContent.value[commentId]?.trim()
  if (!content) { ElMessage.warning('请输入回复内容'); return }
  replyLoading.value[commentId] = true
  try {
    const res = await addReplyApi({
      bookId: props.bookId,
      commentId,
      content,
      source: props.source,
      isSeller: true,
      shopName: shopName.value // 传给后端
    })
    if (res.code === 200) {
      ElMessage.success('回复成功')
      replyContent.value[commentId] = ''
      await fetchCommentList()
    } else {
      ElMessage.error('回复失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
  } finally {
    replyLoading.value[commentId] = false
  }
}
const handleEditComment = (item: CommentItem) => {
  editCommentId.value = item.id
  editForm.value = { score: item.score, content: item.content || '' }
}
const cancelEditComment = () => { editCommentId.value = 0 }
const handleEditScoreChange = (val: number) => { editForm.value.score = parseFloat(val.toFixed(1)) }
const handleEditInputScoreChange = () => {
  let val = editForm.value.score
  if (val < 0) val = 0
  if (val > 5) val = 5
  editForm.value.score = parseFloat(val.toFixed(1))
}
const saveEditComment = async (commentId: number) => {
  if (!editForm.value.score) { ElMessage.warning('请填写评分'); return }
  if (!editForm.value.content.trim()) { ElMessage.warning('请填写内容'); return }
  try {
    const res = await editCommentApi({ commentId, score: editForm.value.score, content: editForm.value.content, source: props.source })
    if (res.code === 200) {
      ElMessage.success('编辑成功')
      cancelEditComment()
      await Promise.all([fetchCommentList(), fetchBookScore()])
      emit('comment-updated')
    }
  } catch { ElMessage.error('网络异常') }
}

const handleScoreChange = (val: number) => { commentForm.value.score = parseFloat(val.toFixed(1)) }
const handleInputScoreChange = () => {
  let val = commentForm.value.score
  if (val < 0) val = 0
  if (val > 5) val = 5
  commentForm.value.score = parseFloat(val.toFixed(1))
}

const fetchRandomComments = async () => {
  if (!props.bookId) return
  try {
    const res = await getRandomComments(props.bookId, props.source)
    if (res.code === 200) randomComments.value = res.data || []
  } catch {}
}

const fetchCommentAuth = async () => {
  if (!userStore.user?.id) { userAuthInfo.value = { hasAuth: false, hasCommented: false }; return }
  try {
    const res = await checkCommentAuth(props.bookId, props.source)
    if (res.code === 200) userAuthInfo.value = res.data
  } catch {}
}

const fetchBookScore = async () => {
  try {
    const res = await getBookAvgScore(props.bookId, props.source)
    if (res.code === 200) {
      bookAvgScore.value = res.data.avgScore || 0
      commentTotalCount.value = res.data.commentCount || 0
    }
  } catch {}
}

const fetchCommentList = async () => {
  try {
    const res = await getCommentList(props.bookId, props.source)
    if (res.code === 200) {
      const list = res.data || []
      for (let item of list) {
        const r = await getReplyListApi(item.id, props.source)
        item.replyList = r.code === 200 ? r.data : []
      }
      commentList.value = list
    }
  } catch {}
}

const submitComment = async () => {
  if (commentForm.value.score <= 0) { ElMessage.warning('请评分'); return }
  if (!commentForm.value.content.trim()) { ElMessage.warning('请输入内容'); return }
  submitLoading.value = true
  try {
    const res = await addComment({ bookId: props.bookId, score: commentForm.value.score, content: commentForm.value.content, source: props.source })
    if (res.code === 200) {
      ElMessage.success('发表成功')
      await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
      commentForm.value = { score: 5, content: '' }
      emit('comment-updated')
    }
  } catch {
    ElMessage.error('网络异常')
  } finally { submitLoading.value = false }
}

const formatTime = (time: string) => time ? new Date(time).toLocaleString() : ''
const goUserInfo = (nickname: string) => { router.push({ path: '/userinfo', query: { username: nickname } }) }

const handleDeleteComment = async (commentId: number) => {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }).then(async () => {
    const res = await deleteCommentApi({ commentId, bookId: props.bookId, source: props.source })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await Promise.all([fetchBookScore(), fetchCommentList()])
      emit('comment-updated')
    }
  }).catch(() => {})
}

const handleDeleteReply = async (replyId: number, commentId: number) => {
  ElMessageBox.confirm('确定要删除这条回复吗？删除后无法恢复', '提示', {
    type: 'warning'
  }).then(async () => {
    // 关键：打印要传给后端的参数，看是不是都有值
    console.log('删除追评参数：', { replyId, commentId, source: props.source });

    try {
      const res = await deleteReplyApi({
        replyId,
        commentId,
        source: props.source
      })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        await fetchCommentList()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (err) {
      console.error('删除请求错误：', err)
      ElMessage.error('网络异常，请稍后重试')
    }
  }).catch(() => {})
}
onMounted(async () => {
  await loadShopInfo()
  if (props.bookId) {
    await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList(), fetchRandomComments()])
  }
  nextTick(() => setTimeout(() => allImagesLoaded.value = true, 50))
})
watch(() => props.bookId, async (id) => {
  if (id) {
    bookAvgScore.value = null
    await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
  }
}, { immediate: true })
</script>
<style scoped>
/* 编辑框样式 */
.edit-box { margin: 10px 0; }
.edit-btn-group { display: flex; gap: 10px; }
.mb-10 { margin-bottom: 10px; }
.mt-5 { margin-top: 5px; }
.score-input-box { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.score-tip { font-size: 12px; color: #999; margin-left: 5px; }

/* 追评输入框 */
.reply-input-box { margin: 10px 0 15px; padding-left: 10px; }
/* 追评列表 */
.reply-list { padding-left: 20px; border-left: 2px solid #eee; margin: 10px 0; }
.reply-title { font-size: 14px; color: #666; margin-bottom: 8px; }
.reply-item { padding: 8px 0; border-bottom: 1px dashed #f5f5f5; }
.reply-top { display: flex; justify-content: space-between; font-size: 12px; color: #999; }
.reply-name { font-weight: 500; color: #409eff; }
.reply-content { font-size: 13px; color: #333; margin-top: 5px; }
/* 展开收起按钮 */
.expand-btn { text-align: center; color: #409eff; cursor: pointer; font-size: 12px; padding: 5px 0; }
</style>

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

<style>
/* 遮罩样式 */
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
}
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
</style>
