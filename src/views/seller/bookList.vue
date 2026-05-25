<template>
  <div class="seller-book-list">
    <div class="toolbar">
      <h3 style="color: #000; font-weight: 600">已上架图书</h3>
      <el-button type="primary" @click="$router.push('/seller/apply')">新增申请</el-button>
    </div>
    <!-- 表格外层滚动容器 -->
    <div class="table-wrapper">
      <el-table 
        v-loading="loading" 
        :data="list" 
        border 
        stripe
        :style="{ tableLayout: 'fixed' }"
        width="100%"
        :min-width="890" 
      >
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image v-if="row.cover" :src="row.cover" style="width: 48px; height: 64px" fit="cover" />
            <span v-else>—</span>
          </template>
        </el-table-column>
       <el-table-column prop="book_name" label="书名" min-width="140">

  <template  #default="{ row }">
    <!-- 1. 显示书名 -->
    <span>{{ row.book_name }}</span>
    <!-- 2. 显示按钮 -->
    <el-button 
      type="success" 
      class="add-cart-btn11" 
      size="large" 
      style="margin-left: 10px"
      @click="  openCommentModal(row)"
    >
      查看图书评价
    </el-button>
  </template>
</el-table-column>
       <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="90">
          <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="上架状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">在售</el-tag>
            <el-tag v-else type="info">已下架待审</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" >
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog 
  v-model="commentVisible" 
  title="图书评价中心" 
  width="750px" 
  append-to-body 
  close-on-click-modal 
  close-on-press-escape 
  destroy-on-close
  @closed="handleCommentClose"
>
  <!-- BookComment -->
  <BookComment 
    v-if="currentBook"
    :book-id="currentBook.id" 
    :source="currentBook.source" 
    @comment-updated="refreshScoreData" 
  />
</el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import BookComment from '@/views/front/book/bookcomment1.vue'
import { getSellerPublishedListApi, deleteSellerPublishedApi } from '@/api/seller/book'
import type { SellerBook } from '@/types/seller'
import { getBookAvgScore, getCommentList } from '@/api/front/bookComment'
const commentVisible = ref(false)
const router = useRouter()
const loading = ref(false)
const list = ref<SellerBook[]>([])
  const route = useRoute()
  const bookId = computed(() => Number(route.params.id))
  const bookType = computed(() => Number(route.query.book_type ?? 0)) // 0=普通 1=新书 2=卖家自营
  const source = computed(() => (bookType.value == 1 ? 'new' : bookType.value == 2 ? 'seller' : 'normal'))
const loadList = async () => {
  loading.value = true
  try {
    const res = await getSellerPublishedListApi()
    if (res.code === 200) list.value = res.data || []
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}
const currentBook = ref<{ id: number; source: string } | null>(null)


// 点击按钮时，把当前行的数据存起来
const openCommentModal = (row: SellerBook) => {
  // 卖家上架的书评
  currentBook.value = {
    id: row.id,
    source: 'seller'
  }
  commentVisible.value = true
}

// 弹窗关闭时清空，防止数据残留
const handleCommentClose = () => {
  currentBook.value = null
}
const localAvgScore = ref<number | null>(null)
const commentTotalCount = ref<number>(0)
const randomComments = ref<any[]>([])
// 刷新评分
const fetchScoreAndRandomComments = async (bookId: number, source: string) => {
  if (!bookId || !source) return
  try {
    const scoreRes = await getBookAvgScore(bookId, source)
    //@ts-ignore
    if (scoreRes.code === 200) {
      localAvgScore.value = scoreRes.data.avgScore || 0.0
      commentTotalCount.value = scoreRes.data.commentCount || 0
    }
  } catch (err) {
    console.error('获取图书评分失败', err)
  }

  try {
    const listRes = await getCommentList(bookId, source)
    //@ts-ignore
    if (listRes.code === 200 && Array.isArray(listRes.data)) {
      const shuffledList = [...listRes.data].sort(() => Math.random() - 0.5)
      randomComments.value = shuffledList.slice(0, 3)
    }
  } catch (err) {
    console.error('获取评论列表失败', err)
  }
}

const refreshScoreData = () => {
  fetchScoreAndRandomComments(bookId.value, source.value)
}
const handleEdit = (id: number) => {
  router.push(`/seller/apply?bookId=${id}`)
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定删除该已上架图书？删除后不可恢复', '提示', { type: 'warning' })
  const res = await deleteSellerPublishedApi(id)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    loadList()
  } else ElMessage.error(res.msg || '删除失败')
}

onMounted(loadList)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar h3 {
  margin: 0;
}
/* 表格滚动容器 */
.table-wrapper {
  width: 100%;
  font-weight: 600;
  overflow-x: auto; /* 小窗口下横向滚动 */
  padding-bottom: 8px; /* 防止滚动条遮挡fixed列 */
}
:deep(.el-table th) {
  color: #383737 !important;
  font-weight: 600 !important;
}
:deep(.el-button){
   height: auto !important;
   padding: 9px;
   position: relative;

}
@media (max-width:1100px) {
  :deep(.el-button){
position: relative;
   left: -8px;
  }
}
.add-cart-btn11{
 background-color: rgb(199, 151, 87) !important;
}
.add-cart-btn11:hover{
  background-color: #c94a4a !important;
}
</style>