<template>
  <div class="admin-order-container" >
    <div class="admin-header">
      <h2 style="color: #000;">订单管理</h2>
      <!-- 筛选导航条 -->
      <div class="filter-scroll-wrapper" style="font-weight: bold;">
        <el-scrollbar class="filter-scroll" horizontal>
          <div class="filter-btn-group">
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '全部' }"
              @click="handleFilter('全部')"
            >
              全部
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '待付款' }"
              @click="handleFilter('待付款')"
            >
              待付款
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '已付款' }"
              @click="handleFilter('已付款')"
            >
              已付款
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '待发货' }"
              @click="handleFilter('待发货')"
            >
              待发货
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '已发货' }"
              @click="handleFilter('已发货')"
            >
              已发货
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '已收货' }"
              @click="handleFilter('已收货')"
            >
              已收货
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '已完成' }"
              @click="handleFilter('已完成')"
            >
              已完成
            </div>
            <div
              class="filter-btn"
              :class="{ active: selectedStatus === '已取消' }"
              @click="handleFilter('已取消')"
            >
              已取消
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 表格容器+粘性横向滚动条 -->
    <div class="table-sticky-wrapper">
      <el-table style="color: #000;"  v-loading="loading" :data="orderList" border  :header-cell-style="{ color: '#333', fontSize: '14px', fontWeight: 600 }"
> stripe fit>
        <el-table-column prop="orderNo" label="订单编号" min-width="136" />
        <el-table-column prop="username" label="下单用户" min-width="83" />
        <el-table-column prop="bookName" label="图书名称" min-width="110" show-overflow-tooltip />
        <el-table-column prop="count" label="数量" min-width="60" />
     <!-- 原价 -->
<el-table-column prop="originalPrice" label="原价" min-width="80">
  <template #default="scope">
    ¥{{ scope.row.originalPrice }}
  </template>
</el-table-column>

<!-- 优惠单价
<el-table-column prop="realUnitPrice" label="优惠单价" min-width="100">
  <template #default="scope">
    <span style="color:red; font-weight:bold">
      ¥{{ scope.row.realUnitPrice }}
    </span>
  </template>
</el-table-column>
 -->
<!-- 实付总价 -->
<el-table-column  prop="totalPrice" label="实付总价" min-width="95">
  <template  #default="scope">
    <span style="color:red; font-weight:bold">
    ¥{{ Number(scope.row.totalPrice ?? 0).toFixed(2) }}</span>
  </template>
</el-table-column>
        <el-table-column prop="status" label="状态" min-width="84">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="120">
          <template #default="scope">
            {{ scope.row.createTime?.replace('T', ' ').slice(0, 16) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="scope">
            <el-select
              v-model="scope.row.newStatus"
              placeholder="修改状态"
              size="small"
              style="width: 100%"
              @change="(val: string) => handleUpdateStatus(scope.row.id, val)"
            >
              <el-option label="待付款" value="待付款" />
              <el-option label="已付款" value="已付款" />
              <el-option label="待发货" value="待发货" />
              <el-option label="已发货" value="已发货" />
              <el-option label="已收货" value="已收货" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminGetAllOrders, adminUpdateOrderStatus } from '@/api/back/order'

const loading = ref(false)
const orderList = ref<any[]>([])
const selectedStatus = ref('全部')

// 筛选按钮点击事件
const handleFilter = (status: string) => {
  selectedStatus.value = status
  getOrderList()
}

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const res = (await adminGetAllOrders(selectedStatus.value)) as unknown as {
      code: number
      data: any[]
    }
    orderList.value = res.data.map((item) => ({ ...item, newStatus: item.status }))
  } catch (error) {
    console.error('获取订单列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 状态标签样式
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
    case '已收货':
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
    const res = (await adminUpdateOrderStatus(id, status)) as unknown as {
      code: number
      msg: string
    }
    if (res.code === 200) {
      ElMessage.success(res.msg)
      getOrderList()
    }
  } catch (error) {
    console.error('修改订单状态失败：', error)
  }
}

onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.admin-order-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* 头部布局 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  gap: 20px;
}

/* 筛选导航条容器 */
.filter-scroll-wrapper {
  flex: 1;
  max-width: 600px;
}
.filter-scroll {
  height: 40px;
}

.filter-btn-group {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  white-space: nowrap;
}

/* 未选中状态文字纯黑 */
.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  color: #333; /* 未选中文字纯黑 */
}
.filter-btn.active {
  background: #409eff;
  color: #fff; /* 选中状态保持白色 */
}
.filter-btn:hover {
  background: #e5e6eb;
}
.filter-btn.active:hover {
  background: #3388ff;
}

/* 粘性表格容器（滚动条固定） */
.table-sticky-wrapper {
  overflow-x: auto; /* 横向滚动条 */
  position: sticky;
  top: 80px; /* 固定在筛选栏下方，和视口顶部保持距离 */
  background: #fff; /* 背景白色，避免滚动时内容穿透 */
  z-index: 10; /* 层级比侧边栏高，不被挡住 */
  padding-bottom: 5px; /* 给滚动条留一点空间 */
  width: 100%;
}

/* 加宽横向滚动条 */
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px !important;
}
:deep(.el-scrollbar__thumb) {
  background: #c0c4cc !important;
  border-radius: 3px !important;
}
:deep(.el-scrollbar__thumb:hover) {
  background: #909399 !important;
}
</style>
