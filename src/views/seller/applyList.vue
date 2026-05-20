<template>
  <div class="seller-apply-list">
    <div class="toolbar">
      <h3 style="color: #000;font-weight: 600;">图书申请管理</h3>
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
        :min-width="932"
      >
        <el-table-column label="封面" width="72">
          <template #default="{ row }">
            <el-image v-if="row.cover" :src="row.cover" style="width: 40px; height: 54px" fit="cover" />
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="book_name" label="书名" min-width="140" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="90">
          <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.audit_status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.audit_status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="audit_reason" label="审核说明" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.audit_status === 2"
              type="primary"
              size="small"
              @click="$router.push(`/seller/apply?id=${row.id}`)"
            >重新编辑</el-button>
            <el-button
              v-if="row.audit_status !== 1"
              type="danger"
              size="small"
              @click="handleDelete(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSellerApplyListApi, deleteSellerApplyApi } from '@/api/seller/apply'
import type { SellerBookApply } from '@/types/seller'

const loading = ref(false)
const list = ref<SellerBookApply[]>([])

const loadList = async () => {
  loading.value = true
  try {
    const res = await getSellerApplyListApi()
    if (res.code === 200) list.value = res.data || []
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定删除该申请？', '提示', { type: 'warning' })
  const res = await deleteSellerApplyApi(id)
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
  color: #000;
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