<template>
  <div class="pay-container">
    <h2 style="color: black">确认订单</h2>

    <!-- 加载/空状态（避免页面空白） -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!payList.length" class="empty">
      <p style="color: black">暂无待支付商品</p>
      <el-button @click="router.push('/cart')">返回购物车</el-button>
    </div>

    <!-- 订单信息 -->
    <div v-else class="order-info">
      <div v-for="item in payList" :key="item.id" class="pay-item">
        <img :src="item.book_cover" class="cover" />
        <div>
          <p style="color: black">{{ item.book_name }}</p>
          <p style="color: black">¥{{ item.book_price }} × {{ item.quantity }}</p>
        </div>
      </div>
      <div class="total">实付：¥{{ total }}</div>
    </div>

    <!-- 支付按钮（仅非空时显示，加防重复点击） -->
    <el-button
      v-if="payList.length"
      type="primary"
      size="large"
      @click="mockPay"
      class="pay-btn"
      :loading="payLoading"
    >
      确认支付 ¥{{ total }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { getPayGoodsInfo, submitMockPay } from '@/api/front/pay'
const route = useRoute()
const router = useRouter()
const payList = ref<any[]>([])
const loading = ref(true)
const payLoading = ref(false)

const cartIdsStr = route.query.cartIds as string
// 1. 参数不存在/为空，直接跳回购物车，彻底避免报错
if (!cartIdsStr) {
  ElMessage.warning('请从购物车进入支付页面')
  router.push('/cart')
}
// 2. 安全拆分，过滤空值，避免无效ID
const cartIds = cartIdsStr?.split(',').filter((id) => id) || []

// 总金额（加Number转换，避免字符串计算错误）
const total = computed(() => {
  return payList.value.reduce((s, i) => s + Number(i.book_price) * Number(i.quantity), 0).toFixed(2)
})

// 获取支付商品数据（加错误捕获，避免页面崩溃）
const getPayData = async () => {
  loading.value = true
  try {
    //@ts-ignore
    const res = await getPayGoodsInfo(cartIds) //@ts-ignore
    payList.value = res.data || []
    if (!payList.value.length) {
      ElMessage.warning('待支付商品为空')
    }
  } catch (error) {
    console.error('获取支付信息失败：', error)
    ElMessage.error('获取订单信息失败，请返回购物车重试')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 模拟支付
const mockPay = async () => {
  payLoading.value = true
  try {
    //@ts-ignore
    const res = await submitMockPay(cartIds) //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('支付成功！')
      router.push('/user')
    }
  } catch (error) {
    console.error('支付失败：', error)
    ElMessage.error('支付失败，请重试')
  } finally {
    payLoading.value = false
  }
}

// 页面挂载时获取数据
onMounted(() => {
  getPayData()
})
</script>

<style scoped>
.pay-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}
.pay-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}
.cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
}
.total {
  text-align: right;
  font-size: 18px;
  color: #f56c6c;
  margin: 10px 0;
}
.pay-btn {
  width: 100%;
}
.loading,
.empty {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>
