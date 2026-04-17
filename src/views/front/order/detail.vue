<template>
  <div class="order-container">
    <div style="display: inline-flex; margin-bottom: 10px">
      <h2
        style="
          color: black;
          margin-right: 120px;
          white-space: nowrap !important;
          -webkit-user-select: none;
          user-select: none;
        "
      >
        我的订单
      </h2>
      <el-button type="primary" @click="$router.push('/user')">返回个人中心</el-button
      ><el-button
        type="primary"
        @click="$router.push('/home')"
        style="padding-left: 32px; padding-right: 32px; margin-left: 40px"
        >返回首页</el-button
      >
    </div>
    <div class="order-list">
      <div v-for="order in orderList" :key="order.id" class="order-card">
        <div style="color: #000 !important" class="order-header">订单号：{{ order.orderNo }}</div>
        <div style="color: #000 !important; font-size: 11px" class="order-header">
          备注：发生交易争议时,商品封面可作为判断依据
        </div>
        <div class="order-body">
          <!--@vue-ignore-->
          <img :src="order.bookCover || '/public/default-book.png'" class="cover" />
          <!--@ts-ignore-->
          <div class="info">
            <p class="name"><!--@vue-ignore-->{{ order.bookName }}</p>

            <p style="color: #000 !important">数量：{{ order.count }}</p>

            <p style="color: #000 !important">总价：¥{{ order.totalPrice }}</p>

            <p style="color: #000 !important">
              状态：<el-tag type="success">{{ order.status }}</el-tag>
            </p>
            <!--@vue-ignore-->
            <p
              style="margin-top: 20px; font-size: 14px; width: 106.3875px"
              class="deteilp"
              @click="go(`/book/${order.bookId}`)"
            >
              查看商品详情
            </p>
          </div>
        </div>

        <div class="order-time" style="color: #000">{{ formatTime(order.createTime) }}</div>
        <p style="color: #000; -webkit-user-select: none; user-select: none">
          ——————————————————————————————————————————————————————
        </p>
      </div>
    </div>
    <div v-if="!orderList.length" class="empty">暂无订单</div>
  </div>
</template>
<script setup lang="ts">
//@ts-ignore
import { onMounted, ref } from 'vue'

import dayjs from 'dayjs'
import type { Order } from '@/types/index'
import { getUserOrderList } from '@/api/front/order'
import router from '@/router'

import { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric } from 'vue-router'

const orderList = ref<Order[]>([])
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}
// 获取我的订单（用户隔离）
const getMyOrder = async () => {
  const res = await getUserOrderList()
  orderList.value = res.data
}
const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')
getMyOrder()
onMounted(() => {})
</script>
<style scoped>
.order-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
}
.order-header {
  color: #000000;
  margin-bottom: 10px;
}
.order-body {
  display: flex;
  gap: 15px;
}
.cover {
  -webkit-user-select: none;
  user-select: none;
  width: 90px;
  height: 120px;
  object-fit: cover;
}
.info {
  -webkit-user-select: none;
  user-select: none;
  flex: 1;
}
.name {
  -webkit-user-select: none;
  user-select: none;
  font-weight: bold;
  font-size: 16px;
  color: #000;
}
.order-time {
  -webkit-user-select: none;
  user-select: none;
  color: #000000;
  font-size: 12px;
  margin-top: 10px;
}
.empty {
  -webkit-user-select: none;
  user-select: none;
  text-align: center;
  padding: 40px;
  color: #000000;
}
.deteilp {
  cursor: pointer;
  background: repeating-linear-gradient(0deg, #f28d22a9 25%, #c34f4f 50%, #f28d22a9 100%);
  border-radius: 95px;
  padding: 8px;
  font-weight: bold;
  color: #ffffff;
  transition: all 0.5s ease-in;
  animation: bian 1.25s linear infinite;
}
.deteilp:hover {
  background: repeating-linear-gradient(0deg, #f25622a9 25%, #c34f4f 50%, #f25622a9 100%);
  color: rgb(0, 0, 0);
  transform: scale(1.05);
}
@keyframes bian {
  25%,
  100% {
    background: repeating-linear-gradient(0deg, #f28d22a9 25%, #c34f4f 50%, #f28d22a9 100%);
    transform: rotate(0deg);
  }
  50% {
    background: repeating-linear-gradient(0deg, #f25622a9 25%, #c34f4f 50%, #f25622a9 100%);
    transform: rotate(-3deg);
  }
  75% {
    background: repeating-linear-gradient(0deg, #f25622a9 25%, #c34f4f 50%, #f25622a9 100%);
    transform: rotate(3deg);
  }
}
</style>
