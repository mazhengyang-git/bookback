<template>
  <div class="order-container">
    <div class="action-row">
      <h2 class="page-title">我的订单</h2>
      <div class="button-group">
        <el-button type="primary" @click="$router.push('/user')">返回个人中心</el-button>
        <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
      </div>
    </div>
    <div class="order-list">
      <div v-for="order in orderList" :key="order.id" class="order-card">
        <div class="order-header">订单号：{{ order.orderNo }}</div>
        <div class="order-note">备注：发生交易争议时,商品封面可作为判断依据</div>
        <div class="order-body">
          <img :src="order.bookCover || '/public/default-book.png'" class="cover" />
          <div class="info">
            <p class="name">{{ order.bookName }}</p>
            <p class="info-text">数量：{{ order.count }}</p>
            <p class="info-text">总价：¥{{ order.totalPrice }}</p>
            <p class="info-text">
              状态：<el-tag type="success">{{ order.status }}</el-tag>
            </p>
            <p
              class="detail-link"
              @click="go(`/book/${order.bookId}?source=${order.source || 'normal'}`)"
            >
              查看商品详情
            </p>
          </div>
        </div>
        <div class="order-time">{{ formatTime(order.createTime) }}</div>
        <div class="divider"></div>
      </div>
    </div>
    <div v-if="!orderList.length" class="empty">暂无订单</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import type { Order } from '@/types/index'
import { getUserOrderList } from '@/api/front/order'
import router from '@/router'
import { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

const orderList = ref<Order[]>([])

const go = (path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) => {
  // 1. 如果是字符串路径
  if (typeof path === 'string') {
    // 检查当前是否已经在 /book/ 开头详情页
    if (router.currentRoute.value.path.startsWith('/book/')) {
      // 如果已经在详情页，强制刷新整个页面
      window.location.href = path
      return
    }
  }
  // 2. 如果不是详情页，走正常路由跳转
  router.push(path)
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
      //预加载页面
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
  width: 110px;
  height: 148px;
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
