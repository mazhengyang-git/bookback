<template>
  <div class="order-container"    v-cloak>
    <div class="action-row">
      <h2 style="user-select: none;" class="page-title">我的订单</h2>
      <div class="button-group">
        <el-button type="primary" @click="$router.push('/user')">返回个人中心</el-button>
        <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="order-list">
      <div v-for="order in orderList" :key="order.id" class="order-card">
        <div class="order-header">订单号：{{ order.orderNo }}</div>
        <div style="user-select: none;" class="order-note">备注：发生交易争议时,商品封面可作为判断依据</div>
        <div class="order-body">
          <!--@vue-ignore--><img :src="order.bookCover || '/public/default-book.png'" class="cover" />
          <div class="info">
            <p class="name">
              <!--@vue-ignore-->{{ order.bookName }}
            
              <el-tag v-if="order.source === 'seller'" type="warning" class="seller-tag">商家自营</el-tag>
            </p>
            <p style="user-select: none;" class="info-text">数量：{{ order.count }}</p>
            <p style="user-select: none;" class="info-text">
              总价：¥{{ Number(order.totalPrice).toFixed(2) }}
            </p>
            <p style="user-select: none;" class="info-text">
              状态：<el-tag :type="getStatusTagType(order.status)">{{ order.status }}</el-tag>
            </p>

            <!-- 商家店铺卡片 -->
            <div v-if="order.source === 'seller'" class="seller-shop-block" @click="goSellerShop(order)">
              <el-avatar :size="48" :src="order.sellerAvatar || order.seller_avatar || '/img/default-avatar.png'" />
              <div class="seller-shop-text">
                <span class="seller-shop-label">商家店铺</span>
                <span class="seller-shop-name">{{ order.shopName || order.shop_name || '未知店铺' }}</span>
              </div>
            </div>

           <!--@vue-ignore--> <p
              class="detail-link"
              @click="go(`/book1/${order.bookId}?source=${order.source || 'normal'}`)"
            >
              查看商品详情
            </p>
          </div>
        </div>

        <!-- 订单操作按钮 -->
        <div class="order-operate" style="margin: 15px 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <!-- 确认收货：仅待收货 -->
          <el-button
            v-if="order.status === '待收货'"
            type="primary"
            icon="el-icon-check"
            size="small"
            style="width: 100px;padding-left: 0px;"
            @click="handleConfirmReceive(order.orderNo)"
          >确认收货</el-button>

          <!-- 已付款/待发货：申请退款 -->
          <el-button
            v-if="['已付款','待发货'].includes(order.status)"
            type="danger"
            icon="el-icon-refresh-left"
            size="small"
            style="width: 100px;padding-left: 0px;"
            @click="handleRefundOnly(order.orderNo)"
          >申请退款</el-button>

          <!-- 已发货/待收货/已收货：退货退款 -->
          <el-button
            v-if="['已发货','待收货','已收货'].includes(order.status)"
            type="danger"
            icon="el-icon-refresh-left"
            size="small"
            style="width: 100px;padding-left: 0px;"
            @click="handleRefundReturn(order.orderNo)"
          >退货退款</el-button>

          <!-- 删除订单：已取消/已完成/已收货 -->
          <el-button
            v-if="['已取消','已完成','已收货'].includes(order.status)"
            type="danger"
            icon="el-icon-delete"
            size="small"
            style="width: 100px;padding-left: 0px;"
            @click="handleRemoveOrder(order.orderNo)"
          >删除订单</el-button>
        </div>

        <!-- 收货地址展示区域 -->
        <div class="address-section" v-if="order.fullAddress">
          <p style="user-select: none;" class="address-title">收货地址：</p>
          <p class="address-text">{{ order.fullAddress }}</p>
        </div>

        <div style="user-select: none;" class="order-time">{{ formatTime(order.createTime) }}</div>
        <div class="divider"></div>
      </div>
    </div>
    <div v-if="!orderList.length" class="empty"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import type { Order } from '@/types/index'
import { getUserOrderList, deleteOrder, updateOrderStatus } from '@/api/front/order'
import router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'
//@ts-ignore
import { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

const orderList = ref<Order[]>([])
let refreshTimer: string | number | NodeJS.Timeout | null | undefined = null // 定时器

const go = (path: string) => {
  if (path.startsWith('/book') || path.startsWith('/book1')) {
    window.location.href = path
    return
  }
  router.push(path)
}

// 跳转到商家店铺
const goSellerShop = (order: any) => {
  // 兼容驼峰/下划线两种字段名
  const shopId = order.shopId || order.shop_id
  if (!shopId) {
    ElMessage.warning('该订单的店铺信息缺失，无法跳转')
    return
  }
  router.push(`/shop/${shopId}`)
}

// 订单状态标签
const getStatusTagType = (status: string) => {
  const map = {
    '待付款': 'warning',
    '已付款': 'info',
    '待发货': 'primary',
    '已发货': 'success',
    '待收货': 'primary',
    '已完成': 'success',
    '已取消': 'danger',
    '已收货': 'success',
  }
  //@ts-ignore
  return map[status] || 'info'
}

// 确认收货
const handleConfirmReceive = async (orderNo: string) => {
  await ElMessageBox.confirm('确认已经收到商品？')
  const res = await updateOrderStatus({ orderNo, status: '已收货' })
  //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('收货成功')
    getMyOrder()
  }
}

// 已付款/待发货：仅退款（取消订单）
const handleRefundOnly = async (no: string) => {
  await ElMessageBox.confirm('确定要申请退款吗？订单将取消，资金原路退回。')
  try {
    const res = await updateOrderStatus({ orderNo: no, status: '已取消' })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('退款申请成功，订单已取消')
      getMyOrder()
    }
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 已发货/待收货/已收货：退货退款
const handleRefundReturn = async (no: string) => {
  await ElMessageBox.confirm('确定要申请退货退款吗？申请后将进入售后流程。')
  try {
    const res = await updateOrderStatus({ orderNo: no, status: '已取消' })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('退货退款申请成功')
      getMyOrder()
    }
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 删除订单
const handleRemoveOrder = async (orderNo: string) => {
  await ElMessageBox.confirm('确定要删除该订单吗？删除后无法恢复。')
  try {
    const res = await deleteOrder(orderNo)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('订单删除成功')
      getMyOrder()
    }
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

const getMyOrder = async () => {
  const res = await getUserOrderList()
  orderList.value = res.data
}

const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')
const chuyu = ref(false)

onMounted(() => {
  if (!chuyu.value) {
    requestIdleCallback(() => {
      import('@/views/front/book/detail.vue')
      import('@/views/front/book/list.vue')
      import('@/views/front/user/index.vue')
      import('@/views/front/cart/index.vue')
      console.log('订单列表页预加载成功')
    })
    chuyu.value = true
  }
  const bookjiazai = async () => {
    await getMyOrder()
  }
  bookjiazai()

  // ====================== 2.5秒自动刷新订单 ======================
  refreshTimer = setInterval(() => {
    getMyOrder()
  }, 2500)
})

// 页面离开时清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>
<style scoped>
.order-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px;
}
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 22px;
}
.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}
.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.order-card {
  background: #ffffff;
  border: 1px solid #e8eff8;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(25, 47, 77, 0.08);
  padding: 22px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.order-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(25, 47, 77, 0.12);
}
.order-header {
  font-size: 16px;
  color: #111827;
  font-weight: 700;
  margin-bottom: 8px;
}
.order-note {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 18px;
  line-height: 1.6;
}
.order-body {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.cover {
  width: 8.6vw;
  margin-right: 30px;
  height: auto;
  transform: scaleX(1.05);
  border-radius: 12px;
  object-fit: cover;
  background: #f8fafc;
  flex-shrink: 0;
}
.info {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.name {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}
.info-text {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.75;
}
.order-time {
  color: #6b7280;
  font-size: 13px;
  margin-top: 18px;
}
.divider {
  height: 1px;
  width: 100%;
  margin-top: 18px;
  background: #e6ecf4;
  border-radius: 999px;
}
.detail-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 10px 18px;
  margin-top: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  user-select: none;
}
.detail-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 20px rgba(59, 130, 246, 0.18);
  background: linear-gradient(90deg, #2563eb 0%, #14b8a6 100%);
}
.empty {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 15px;
  background: #f8fafc;
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  margin-top: 24px;
  padding: 32px;
}
@media (max-width: 720px) {
  .order-body {
    flex-direction: column;
    align-items: center;
  }
  .cover {
    width: 100%;
    max-width: 220px;
    height: auto;
    aspect-ratio: 3 / 4;
  }
  .order-card {
    padding: 18px;
  }
  .page-title {
    font-size: 24px;
  }
}
</style>
<style scoped>

/* 地址相关样式 */
.address-section {
  margin-top: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.address-title {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}
.address-text {
  margin: 0;
  font-size: 14px;
  color: #333;
}

</style>
<style scoped>
/* 商家自营标签 */
.seller-tag {
  margin-left: 10px;
  background-color: #fdf6ec;
  color: #e6a23c;
  border-color: #faecd8;
}

/* 商家店铺卡片 */
.seller-shop-block {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #fff7e6;
  border-radius: 8px;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.2s;
}
.seller-shop-block:hover {
  background-color: #fff1d8;
  transform: translateY(-1px);
}
.seller-shop-text {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}
.seller-shop-label {
  font-size: 12px;
  color: #999;
}
.seller-shop-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
</style>