<template>
  <div class="order-container">
    <div style="display: inline-flex; margin-bottom: 10px">
      <h2 style="color: black; margin-right: 120px">我的订单</h2>
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

        <div class="order-body">
          <!--@vue-ignore-->
          <img :src="order.bookCover || '/public/default-book.png'" class="cover" />
          <!--@ts-ignore-->
          <div class="info">
            <p class="name">{{ order.book_name }}</p>

            <p style="color: #000 !important">数量：{{ order.count }}</p>

            <p style="color: #000 !important">总价：¥{{ order.totalPrice }}</p>

            <p style="color: #000 !important">
              状态：<el-tag type="success">{{ order.status }}</el-tag>
            </p>
          </div>
        </div>
        <div class="order-time" style="color: #000">{{ order.createTime }}</div>
      </div>
    </div>
    <div v-if="!orderList.length" class="empty">暂无订单</div>
  </div>
</template>

<script setup lang="ts">
//@ts-ignore
import { onMounted, ref } from 'vue'
import request from '@/utils/request'
import type { Order } from '@/types/index'
import { getUserOrderList } from '@/api/front/order'
const orderList = ref<Order[]>([])
const book_cover = ref<string[]>([])
// 获取我的订单（用户隔离）
const getMyOrder = async () => {
  const res = await getUserOrderList()
  orderList.value = res.data
}
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
  width: 90px;
  height: 120px;
  object-fit: cover;
}
.info {
  flex: 1;
}
.name {
  font-weight: bold;
  font-size: 16px;
  color: #000;
}
.order-time {
  color: #000000;
  font-size: 12px;
  margin-top: 10px;
}
.empty {
  text-align: center;
  padding: 40px;
  color: #000000;
}
</style>
