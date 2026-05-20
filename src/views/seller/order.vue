<template>
  <div class="seller-order-container">
    <!-- 顶部订单统计卡片 -->
    <div class="order-stats">
      <div class="stat-card">
        <div class="stat-icon waiting">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待处理订单</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon shipping">
          <el-icon><Van /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.shipping }}</div>
          <div class="stat-label">待发货订单</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成订单</div>
        </div>
      </div>
    </div>

    <div class="admin-header">
      <h2 style="color: #000;">我的订单管理</h2>
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
        <el-button 
          type="primary" 
          size="small" 
          icon="el-icon-refresh" 
          @click="getOrderList"
        >
          刷新订单
        </el-button>
        <div class="filter-scroll-wrapper" style="flex: 1;">
          <el-scrollbar class="filter-scroll" horizontal>
            <div class="filter-btn-group">
              <div
                class="filter-btn"
                :class="{ active: selectedStatus === '全部' }"
                @click="handleFilter('全部')"
              >
                全部订单
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
    </div>

    <!-- 表格容器 -->
    <div class="table-wrapper">
      <el-table 
        style="color: #000;"  
        v-loading="loading" 
        :data="orderList" 
        border  
        :header-cell-style="{ background: '#f0f7ff', color: '#333', fontSize: '14px', fontWeight: 600 }"
        stripe 
        fit
      >
        <el-table-column label="商品信息" min-width="200">
          <template #default="scope">
            <div class="book-info">
              <el-image 
                :src="scope.row.bookCover || '/default-book.png'" 
                class="book-cover" 
                :preview-src-list="[scope.row.bookCover || '/default-book.png']"
                fit="cover"
              />
              <div class="book-name">{{ scope.row.bookName || '未知商品' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单编号" min-width="136" />
        <el-table-column prop="username" label="下单用户" min-width="83" />
        <el-table-column prop="count" label="数量" min-width="60" />
        <el-table-column prop="originalPrice" label="原价" min-width="80">
          <template #default="scope">
            ¥{{ scope.row.originalPrice }}
          </template>
        </el-table-column>
        <el-table-column  prop="totalPrice" label="实付总价" min-width="95">
          <template  #default="scope">
            <span style="color:#409eff; font-weight:bold">
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Van, CircleCheck } from '@element-plus/icons-vue'
import { getSellerOrders, updateSellerOrderStatus } from '@/api/seller/order'

const loading = ref(false)
const orderList = ref<any[]>([])
const selectedStatus = ref('全部')

// 订单统计数据（顶部卡片）
const stats = computed(() => {
  const pending = orderList.value.filter(item => 
    item.status === '已付款' || item.status === '待付款'
  ).length
  const shipping = orderList.value.filter(item => 
    item.status === '待发货' || item.status === '已发货'
  ).length
  const completed = orderList.value.filter(item => 
    item.status === '已完成' || item.status === '已收货'
  ).length
  return { pending, shipping, completed }
})

// 筛选按钮点击事件
const handleFilter = (status: string) => {
  selectedStatus.value = status
  getOrderList()
}

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const res = (await getSellerOrders(selectedStatus.value)) as unknown as {
      code: number
      data: any[]
    }
    orderList.value = res.data.map((item) => ({ 
      ...item, 
      newStatus: item.status,
    }))
    ElMessage.success('订单列表刷新成功')
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('获取订单列表失败，请重试')
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
    const res = (await updateSellerOrderStatus(id, status)) as unknown as {
      code: number
      msg: string
    }
    if (res.code === 200) {
      ElMessage.success(res.msg)
      getOrderList()
    } else {
      ElMessage.error(res.msg || '修改订单状态失败')
    }
  } catch (error) {
    console.error('修改订单状态失败：', error)
    ElMessage.error('修改订单状态失败，请重试')
  }
}

onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.seller-order-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: #f8fafc;
  min-height: 100vh;
}

/* 顶部统计卡片 */
.order-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}
.stat-icon.waiting {
  background: linear-gradient(135deg, #ffd43b, #fab005);
}
.stat-icon.shipping {
  background: linear-gradient(135deg, #409eff, #3377ff);
}
.stat-icon.completed {
  background: linear-gradient(135deg, #51cf66, #40c057);
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}
.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 头部布局 */
.admin-header {
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.admin-header h2 {
  margin: 0 0 12px 0;
}

/* 筛选导航条 */
.filter-scroll-wrapper {
  max-width: 100%;
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
.filter-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f0f7ff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  color: #409eff;
}
.filter-btn.active {
  background: #409eff;
  color: #fff;
}
.filter-btn:hover {
  background: #e6f4ff;
}
.filter-btn.active:hover {
  background: #3388ff;
}

/* 表格容器 */
.table-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

/* 商品信息列 */
.book-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.book-cover {
  width: 60px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}
.book-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

/* 横向滚动条 */
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