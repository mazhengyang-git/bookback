<template>
  <div class="seller-audit-admin">
    <div class="admin-header">
      <h2 style="color: black">卖家图书审核</h2>
      <el-select v-model="filterStatus" placeholder="审核状态" clearable style="width: 140px" @change="loadList">
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="已驳回" :value="2" />
      </el-select>
    </div>
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="book_name" label="书名" min-width="140" />
      <el-table-column prop="shop_name" label="店铺" width="120" />
      <el-table-column prop="username" label="卖家账号" width="110" />
      <el-table-column prop="author" label="作者" width="90" />
      <el-table-column prop="price" label="价格" width="90">
        <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.audit_status === 0" type="warning">待审核</el-tag>
          <el-tag v-else-if="row.audit_status === 1" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已驳回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="audit_reason" label="说明" min-width="100" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <template v-if="row.audit_status === 0">
            <el-button type="success" size="small" @click="handleApprove(row.id)">通过</el-button>
            <el-button type="danger" size="small" @click="openReject(row)">驳回</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <h2 style="color: black; margin-top: 32px">卖家已上架图书</h2>
    <el-table v-loading="bookLoading" :data="bookList" border stripe style="margin-top: 12px">
      <el-table-column prop="book_name" label="书名" min-width="140" />
      <el-table-column prop="shop_name" label="店铺" width="120" />
      <el-table-column prop="username" label="卖家账号" width="110" />
      <el-table-column prop="price" label="价格" width="90">
        <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">在售</el-tag>
          <el-tag v-else type="info">下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="handleDeleteBook(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="rejectVisible" title="驳回原因" width="480px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAdminApplyListApi,
  approveSellerApplyApi,
  rejectSellerApplyApi,
} from '@/api/seller/apply'
import { getAdminSellerBookListApi, deleteAdminSellerBookApi } from '@/api/seller/book'
import type { SellerBook, SellerBookApply } from '@/types/seller'

const loading = ref(false)
const bookLoading = ref(false)
const list = ref<SellerBookApply[]>([])
const bookList = ref<SellerBook[]>([])
const filterStatus = ref<number | ''>('')
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectId = ref(0)

const loadList = async () => {
  loading.value = true
  try {
    const res = await getAdminApplyListApi(filterStatus.value === '' ? undefined : filterStatus.value)
    if (res.code === 200) list.value = res.data || []
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id: number) => {
  await ElMessageBox.confirm('确认通过该申请并上架至卖家图书库？', '审核通过')
  const res = await approveSellerApplyApi(id)
  if (res.code === 200) {
    ElMessage.success('审核通过')
    loadList()
    loadBookList()
  } else ElMessage.error(res.msg || '操作失败')
}

const openReject = (row: SellerBookApply) => {
  rejectId.value = row.id
  rejectReason.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  const res = await rejectSellerApplyApi(rejectId.value, rejectReason.value)
  if (res.code === 200) {
    ElMessage.success('已驳回')
    rejectVisible.value = false
    loadList()
  } else ElMessage.error(res.msg || '操作失败')
}

const loadBookList = async () => {
  bookLoading.value = true
  try {
    const res = await getAdminSellerBookListApi()
    if (res.code === 200) bookList.value = res.data || []
  } catch {
    ElMessage.error('加载已上架图书失败')
  } finally {
    bookLoading.value = false
  }
}

const handleDeleteBook = async (id: number) => {
  await ElMessageBox.confirm('确定删除该卖家已上架图书？', '提示', { type: 'warning' })
  const res = await deleteAdminSellerBookApi(id)
  if (res.code === 200) {
    ElMessage.success('删除成功')
    loadBookList()
  } else ElMessage.error(res.msg || '删除失败')
}

onMounted(() => {
  loadList()
  loadBookList()
})
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
