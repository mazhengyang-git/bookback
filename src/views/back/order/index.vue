<template>
  <div class="admin-order-container">
    <div class="admin-header">
      <h2>订单管理</h2>
      <el-select
        v-model="selectedStatus"
        placeholder="请选择订单状态"
        style="width: 150px"
        @change="getOrderList"
      >
        <el-option label="全部" value="全部" />
        <el-option label="待付款" value="待付款" />
        <el-option label="已付款" value="已付款" />
        <el-option label="待发货" value="待发货" />
        <el-option label="已发货" value="已发货" />
        <el-option label="已完成" value="已完成" />
        <el-option label="已取消" value="已取消" />
      </el-select>
    </div>

    <!-- 订单列表 -->
    <el-table v-loading="loading" :data="orderList" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单编号" width="180" />
      <el-table-column prop="username" label="下单用户" width="120" />
      <el-table-column prop="bookName" label="图书名称" width="200" />
      <el-table-column prop="count" label="数量" width="80" />
      <el-table-column prop="totalPrice" label="总价（元）" width="100">
        <template #default="scope"> ¥{{ scope.row.totalPrice.toFixed(2) }} </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-select
            v-model="scope.row.newStatus"
            placeholder="修改状态"
            size="small"
            @change="(val: string) => handleUpdateStatus(scope.row.id, val)"
          >
            <el-option label="待付款" value="待付款" />
            <el-option label="已付款" value="已付款" />
            <el-option label="待发货" value="待发货" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminGetAllOrders, adminUpdateOrderStatus } from '@/api/back/order'

// 加载状态
const loading = ref(false)
// 订单列表
const orderList = ref<any[]>([])
// 选中的状态
const selectedStatus = ref('全部')

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const res = (await adminGetAllOrders(selectedStatus.value)) as { code: number; data: any[] }
    // 给每个订单添加newStatus字段，用于修改状态
    orderList.value = res.data.map((item) => ({ ...item, newStatus: item.status }))
  } catch (error) {
    console.error('获取订单列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 获取状态对应的标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case '待付款':
      return 'warning'
    case '已付款':
      return 'info'
    case '待发货':
      return 'primary'
    case '已发货':
      return 'success'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return ''
  }
}

// 修改订单状态
const handleUpdateStatus = async (id: number, status: string) => {
  try {
    const res = (await adminUpdateOrderStatus(id, status)) as { code: number; msg: string }
    if (res.code === 200) {
      ElMessage.success(res.msg)
      // 刷新列表
      getOrderList()
    }
  } catch (error) {
    console.error('修改订单状态失败：', error)
  }
}

// 页面加载时获取列表
onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.admin-order-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
</style>
