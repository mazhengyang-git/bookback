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
        <el-table-column prop="book_name" label="书名" min-width="140" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSellerPublishedListApi, deleteSellerPublishedApi } from '@/api/seller/book'
import type { SellerBook } from '@/types/seller'

const router = useRouter()
const loading = ref(false)
const list = ref<SellerBook[]>([])

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
</style>