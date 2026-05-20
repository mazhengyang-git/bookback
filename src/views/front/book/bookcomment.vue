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

    <!-- 发表主评价 -->
    <div v-if="userAuthInfo.hasAuth && !userAuthInfo.hasCommented" class="comment-submit-box">
      <h4 class="submit-title">发表你的评价</h4>
      <el-form ref="submitFormRef" :model="commentForm" label-width="80px">
        <el-form-item label="综合评分">
          <div class="score-input-box">
            <el-rate
              v-model="commentForm.score"
              :max="5"
              step="0.5"
              show-score
              text-color="#ff7d00"
              :score-format="(val)=>val.toFixed(1)"
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
          <el-button type="primary" @click="submitComment" :loading="submitLoading">
            提交评价
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else-if="!userAuthInfo.hasAuth" class="no-auth-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>您未购买该图书，暂无评价权限</span>
    </div>

    <div v-else-if="userAuthInfo.hasCommented" class="has-comment-tip">
      <el-icon><SuccessFilled /></el-icon>
      <span>您已完成该图书的评价，感谢您的反馈</span>
    </div>

    <!-- 评价列表（编辑+追评+展开收起） -->
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
            
            <!-- 编辑按钮：仅自己可见 -->
            <el-button 
              v-if="userStore.user?.id === item.userId && editCommentId !== item.id"
              type="primary" 
              link 
              size="small"
              @click="handleEditComment(item)"
            >
              编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button 
              v-if="userStore.user?.id === item.userId"
              type="danger" 
              link 
              size="small"
              @click="handleDeleteComment(item.id)"
            >
              删除
            </el-button>
          </div>

          <!-- 评论内容：编辑状态 / 正常状态 -->
          <div class="comment-content">
            <!-- 编辑模式：和发布评论一致的评分双输入 -->
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
            <!-- 正常模式：展示文本 -->
            <span v-else>{{ item.content || '用户未填写文字评价' }}</span>
          </div>

          <!-- 追评输入框：仅购买用户可见 -->
          <div v-if="userAuthInfo.hasAuth" class="reply-input-box">
  <el-input
    v-model="replyContent[item.id]"
    :placeholder="item.userId === userStore.user?.id ? '发表你的追评' : '热情问答，文明用语'"
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
  >
    发表追评
  </el-button>
</div>

          <!-- 追评列表 -->
          <div v-if="item.replyList && item.replyList.length > 0" class="reply-list">
            <div class="reply-title">追评 ({{ item.replyList.length }})</div>
            <!-- 追评内容：展开/收起控制 -->
            <div class="reply-item-list">
              <div 
                v-for="(reply, idx) in getShowReplyList(item.id, item.replyList)" 
                :key="reply.id" 
                class="reply-item"
              >
                <div class="reply-top">
                  <span style="user-select: none;cursor: pointer;" class="reply-name"   @click="goUserInfo(item.nickname)">{{ reply.nickname }}</span>
                  <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
            </div>
            <!-- 展开/收起箭头：超过3条追评显示 -->
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
import { InfoFilled, SuccessFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'

// 接口
import {
  checkCommentAuth,
  getBookAvgScore,
  getCommentList,
  addComment,
  getRandomComments,
  deleteCommentApi,
} from '@/api/front/bookComment'
// 接口（编辑评论、发表追评、获取追评列表）
import {
  editCommentApi,
  addReplyApi,
  getReplyListApi,
} from '@/api/front/bookComment'

// 类型定义
interface CommentForm { score: number; content: string }
interface CommentItem {
  id: number; userId: number; nickname: string; score: number;
  content: string; createTime: string; replyList?: any[];
}
interface CommentAuth { hasAuth: boolean; hasCommented: boolean }

// Props
const props = defineProps<{ bookId: number; source: string }>()
const userStore = useUserStore()
const emit = defineEmits(['comment-updated'])
const router = useRouter()

// 响应式数据
const allImagesLoaded = ref(false)
const submitFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const bookAvgScore = ref<number | null>(null)
const commentTotalCount = ref<number>(0)
const userAuthInfo = ref<CommentAuth>({ hasAuth: false, hasCommented: false })
const commentForm = ref<CommentForm>({ score: 5.0, content: '' })
const commentList = ref<CommentItem[]>([])
const randomComments = ref<any[]>([])

// ==================== 编辑评论相关（双模式评分处理） ====================
const editCommentId = ref<number>(0) // 编辑中的评论ID
const editForm = ref<CommentForm>({ score: 0, content: '' }) // 编辑表单

// 进入编辑
const handleEditComment = (item: CommentItem) => {
  editCommentId.value = item.id
  editForm.value = { score: item.score, content: item.content || '' }
}

// 取消编辑
const cancelEditComment = () => {
  editCommentId.value = 0
  editForm.value = { score: 0, content: '' }
}

// 编辑时点击星星的评分处理
const handleEditScoreChange = (val: number) => {
  editForm.value.score = parseFloat(val.toFixed(1))
}

// 编辑时输入数字的评分处理
const handleEditInputScoreChange = () => {
  let val = editForm.value.score
  if (val < 0) val = 0.0
  if (val > 5) val = 5.0
  editForm.value.score = parseFloat(val.toFixed(1))
}

// 保存编辑
const saveEditComment = async (commentId: number) => {
  if (!editForm.value.score) {
    ElMessage.warning('请填写评分')
    return
  }
  if (!editForm.value.content.trim()) {
    ElMessage.warning('请填写评论内容')
    return
  }
  try {
    const res = await editCommentApi({
      commentId,
      score: editForm.value.score,
      content: editForm.value.content,
      source: props.source,
    })
    // @ts-ignore
    if (res.code === 200) {
      ElMessage.success('编辑成功')
      cancelEditComment()
      // 同时刷新「评论列表」和「平均分」
      await Promise.all([fetchCommentList(), fetchBookScore()])
      emit('comment-updated')
    } else {
      ElMessage.error('编辑失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
  }
}

// ==================== 追评功能相关 ====================
const replyContent = ref<Record<number, string>>({}) // 追评输入内容
const replyLoading = ref<Record<number, boolean>>({}) // 追评加载状态
const expandedReplies = ref<Record<number, boolean>>({}) // 追评展开状态

// 切换追评展开/收起
const toggleExpandReply = (commentId: number) => {
  expandedReplies.value[commentId] = !expandedReplies.value[commentId]
}
// 获取要显示的追评列表（默认3条，展开显示全部）
const getShowReplyList = (commentId: number, list: any[]) => {
  return expandedReplies.value[commentId] ? list : list.slice(0, 3)
}
// 发表追评
const submitReply = async (commentId: number) => {
  const content = replyContent.value[commentId]?.trim()
  if (!content) {
    ElMessage.warning('请输入追评内容')
    return
  }
  replyLoading.value[commentId] = true
  try {
    const res = await addReplyApi({
      bookId: props.bookId,
      commentId,
      content,
      source: props.source,
    })
    // @ts-ignore
    if (res.code === 200) {
      ElMessage.success('追评发表成功')
      replyContent.value[commentId] = ''
      await fetchCommentList() // 刷新列表
    } else {
      ElMessage.error('追评失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
  } finally {
    replyLoading.value[commentId] = false
  }
}


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
    const res = await getRandomComments(props.bookId, props.source)
    // @ts-ignore
    if (res.code === 200) randomComments.value = res.data || []
  } catch (err) { console.error('获取随机评论失败', err) }
}

const fetchCommentAuth = async () => {
  if (!userStore.user?.id) {
    userAuthInfo.value = { hasAuth: false, hasCommented: false }
    return
  }
  try {
    const res = await checkCommentAuth(props.bookId, props.source)
    // @ts-ignore
    if (res.code === 200) userAuthInfo.value = res.data
  } catch (err) { console.error('权限校验失败', err) }
}

const fetchBookScore = async () => {
  try {
    const res = await getBookAvgScore(props.bookId, props.source)
    // @ts-ignore
    if (res.code === 200) {
      bookAvgScore.value = res.data.avgScore || 0.0
      commentTotalCount.value = res.data.commentCount || 0
    }
  } catch (err) { console.error('获取评分失败', err) }
}

// 获取主评论后，加载对应追评
const fetchCommentList = async () => {
  try {
    const res = await getCommentList(props.bookId, props.source)
    // @ts-ignore
    if (res.code === 200) {
      const list = res.data || []
      // 为每条评论加载追评列表
      for (let item of list) {
        const replyRes = await getReplyListApi(item.id, props.source)
        // @ts-ignore
        item.replyList = replyRes.code === 200 ? replyRes.data : []
      }
      commentList.value = list
    }
  } catch (err) { console.error('获取评价列表失败', err) }
}

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
      source: props.source
    })
    // @ts-ignore
    if (res.code === 200) {
      ElMessage.success('评价提交成功！')
      await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
      commentForm.value = { score: 5.0, content: '' }
      emit('comment-updated')
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

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const goUserInfo = (nickname: string) => {
  if (!nickname) return
  router.push({ path: '/userinfo', query: { username: nickname } })
}

// 删除评价
const handleDeleteComment = async (commentId: number) => {
  ElMessageBox.confirm('确定要删除这条评价吗？删除后无法恢复', '提示', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCommentApi({ commentId, bookId: props.bookId, source: props.source })
      // @ts-ignore
      if (res.code === 200) {
        ElMessage.success('评价已删除')
        await Promise.all([fetchBookScore(), fetchCommentList()])
        emit('comment-updated')
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (err) {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => ElMessage.info('已取消删除'))
}

onMounted(async () => {
  if (props.bookId) {
    await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList(), fetchRandomComments()])
  }
  nextTick(() => {
    setTimeout(() => allImagesLoaded.value = true, 50)
  })
})

watch(
  () => props.bookId,
  async (newId) => {
    if (newId) {
      bookAvgScore.value = null
      await Promise.all([fetchCommentAuth(), fetchBookScore(), fetchCommentList()])
    }
  },
  { immediate: true }
)
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
