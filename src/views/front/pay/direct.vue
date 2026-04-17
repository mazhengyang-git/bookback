<template>
  <div class="pay-page">
    <div class="pay-header">
      <h2 style="color: darkorange">确认支付</h2>
      <!-- 使用link类型 + 关闭deprecated警告 -->
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-tip">加载支付信息中...</div>

    <!-- 直付商品信息 -->
    <div v-else-if="payGoods" class="pay-goods-card">
      <div class="goods-item">
        <img :src="payGoods.cover || '/default-book.png'" alt="图书封面" class="book-cover" />
        <div class="goods-info">
          <!-- 优先级：先取data里的book_name，再取name -->
          <h3 style="color: black">{{ payGoods.book_name || payGoods.name || '未知图书' }}</h3>
          <p style="color: gray">规格：{{ payGoods.spec || '平装版' }}</p>
          <p style="color: gray">单价：¥{{ toFixedNumber(payGoods.price, 2) }}</p>
          <p style="color: gray">数量：{{ payGoods.count || 1 }}</p>
        </div>
      </div>

      <!-- 总计 -->
      <div class="pay-total">
        <span style="color: black">支付金额：</span>
        <span class="total-price">¥{{ toFixedNumber(totalAmount, 2) }}</span>
      </div>

      <!-- 支付按钮 -->
      <div class="pay-btn-group">
        <el-button
          size="large"
          style="color: black !important"
          @click="submitDirectPay1"
          :loading="submitting"
        >
          确认支付
        </el-button>
      </div>
    </div>

    <!-- 无商品 -->
    <div v-else class="empty-tip">
      <p>暂无待支付商品</p>
      <el-button type="primary" @click="router.push('/home')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDirectPayGoodsInfo, submitDirectPay } from '@/api/front/pay'
import { useUserStore } from '@/store/modules/user'

// 路由/仓库
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(true)
const submitting = ref(false)
const payGoods = ref<any>(null) // 直付商品信息

// 通用数字格式化函数（空值强校验）
const toFixedNumber = (num: any, digits: number) => {
  if (num === null || num === undefined) return '0.00'
  const number = Number(num) || 0
  return number.toFixed(digits)
}

// 计算总计金额
const totalAmount = computed(() => {
  if (!payGoods.value) return 0
  const price = Number(payGoods.value.price) || 0
  const count = Number(payGoods.value.count) || 1
  return price * count
})

// 获取直付商品信息
const loadDirectPayGoodsInfo = async () => {
  try {
    const bookId = Number(route.query.bookId) || 0
    const buyCount = Number(route.query.buyCount) || 0

    if (!bookId || !buyCount || buyCount < 1) {
      ElMessage.warning('支付参数异常：图书ID/数量不能为空')
      loading.value = false
      return
    }

    // 后端返回数据
    const res = await getDirectPayGoodsInfo(bookId, buyCount)
    console.log('直付商品信息返回：', res)
    //@ts-ignore
    if (res.code === 200 && res.data) {
      // 赋值book_name
      payGoods.value = {
        ...res.data, //@ts-ignore
        book_name: res.data.book_name || res.data.name || '银河帝国（基地七部曲）', // 兜底默认值
        price: Number(res.data.price) || 0,
        count: Number(res.data.count) || 1,
        bookId: Number(res.data.bookId) || 0, //@ts-ignore
        cover: res.data.cover || 'https://xxx/银河帝国封面.png', // 兜底封面
      }
    } else {
      //@ts-ignore
      ElMessage.error(res?.msg || '获取支付信息失败')
    }
  } catch (error) {
    console.error('加载直付信息失败：', error)
    ElMessage.error('网络异常，获取支付信息失败')
  } finally {
    loading.value = false
  }
}

// 提交直付
const submitDirectPay1 = async () => {
  // 前置校验强化
  if (!userStore.token) {
    ElMessage.warning('请先登录后再支付')
    router.push('/login')
    return
  }
  if (!payGoods.value) {
    ElMessage.warning('暂无待支付商品')
    return
  }

  submitting.value = true
  try {
    const bookId = Number(route.query.bookId) || 0
    const buyCount = Number(route.query.buyCount) || 0

    if (!bookId || !buyCount) {
      ElMessage.warning('支付参数异常')
      submitting.value = false
      return
    }

    const res = await submitDirectPay(bookId, buyCount)
    console.log('支付提交返回：', res)
    //@ts-ignore
    if (res?.code === 200 && res.data) {
      // ElMessage传参格式
      ElMessage.success({
        message: `支付成功！订单号：${res.data.orderNo || '未知'}`,
        duration: 1500, // 1.5秒提示，兼顾用户查看
      })

      // 直接跳个人主页，订单列表自动加载
      setTimeout(() => {
        router.push('/user')
      }, 800) // 短延迟
    } else {
      //@ts-ignore
      ElMessage.error(res?.msg || '支付失败，请重试')
    }
  } catch (error) {
    console.error('直付提交失败：', error)
    ElMessage.error('支付失败，网络异常')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    loading.value = false
    return
  }
  loadDirectPayGoodsInfo()
})
</script>

<style scoped>
.pay-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}
.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
/* 返回按钮样式 */
.back-btn {
  font-size: 14px;
  padding: 0;
}
.goods-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.book-cover {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.goods-info h3 {
  margin: 0;
  font-size: 18px;
}
.pay-total {
  text-align: right;
  margin: 30px 0;
  font-size: 20px;
  font-weight: bold;
}
.total-price {
  color: #f56c6c;
  margin-left: 10px;
}
.pay-btn-group {
  text-align: right;
}
.loading-tip,
.empty-tip {
  text-align: center;
  padding: 100px 0;
  font-size: 16px;
  color: #666;
}
</style>
