<template>
  <div class="pay-page" v-cloak>
    <div class="pay-header">
      <h2 style="color: darkorange">确认订单</h2>
      <el-button
        style="padding: 5px"
        @click="router.go(-1)"
        type="link"
        class="back-btn"
        :unstable-disable-deprecated-warning="true"
        >返回</el-button
      >
    </div>

    <!-- 加载/空状态 -->
    <div v-if="loading" class="loading-tip"><!--加载中...--></div>
    <div v-else-if="!payList.length" class="empty-tip">
      <p>暂无待支付商品</p>
      <el-button type="primary" @click="router.push('/cart')">返回购物车</el-button>
    </div>

    <!-- 订单与地址信息 -->
    <div v-else class="order-wrapper">
      <!-- 1. 地址选择区域 -->
      <div class="address-section">
        <h3 style="margin-bottom: 15px; color: #333; font-size: 16px">配送至</h3>
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
          <el-form-item label="所在地区" prop="region">
            <el-cascader
              v-model="addressForm.region"
              :options="regionOptions"
              placeholder="请选择省/市/区"
              style="width: 100%"
              :props="{ expandTrigger: 'hover' }"
            />
          </el-form-item>
          <el-form-item label="详细地址" prop="detail">
            <el-input
              v-model="addressForm.detail"
              type="textarea"
              :rows="2"
              placeholder="请输入街道、楼牌号等详细信息"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 2. 商品列表 -->
      <div class="goods-list">
        <div v-for="item in payList" :key="item.id" class="pay-item">
          <img :src="item.book_cover || '/default-book.png'" class="cover" />
          <div class="goods-info">
            <p style="color: black; font-weight: 500; margin:0">{{ item.book_name }}</p>
            <!-- 🔥 优惠价展示（和直付页完全一致） -->
            <p style="color: gray; margin:0">
              单价：¥{{ toFixedNumber(item.discount_price || item.book_price, 2) }} × {{ item.quantity }}
              <span v-if="item.discount_price && item.discount_price !== item.book_price" 
                style="color: #999; text-decoration: line-through; margin-left: 8px; font-size: 12px;">
                ¥{{ toFixedNumber(item.book_price, 2) }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 总计 -->
      <div class="pay-total">
        <span style="color: black">实付金额：</span>
        <span class="total-price">¥{{ toFixedNumber(total, 2) }}</span>
      </div>
    </div>

    <!-- 支付按钮 -->
    <el-button
      v-if="payList.length"
      type="primary"
      size="large"
      @click="mockPay"
      class="pay-btn"
      :loading="payLoading"
    >
      确认支付 ¥{{ toFixedNumber(total, 2) }}
    </el-button>

    <!-- ================== 支付安全验证弹窗（短信+密码 双选择） ================== -->
    <el-dialog
      v-model="showPayVerifyDialog"
      title="支付安全验证"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="payVerifyFormRef"
        :model="payVerifyForm"
        label-width="110px"
        class="verify-form"
      >
        <!-- 验证方式选择 -->
        <el-form-item label="验证方式">
          <el-radio-group v-model="verifyType">
            <el-radio label="sms" border>短信验证码</el-radio>
            <el-radio label="password" border>账号密码验证</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 短信验证 -->
        <template v-if="verifyType === 'sms'">
          <el-form-item label="绑定手机号">
            <el-input
              v-model="payVerifyForm.phone"
              placeholder="已绑定手机号"
              maxlength="11"
              disabled
            />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-box">
              <el-input v-model="payVerifyForm.code" placeholder="请输入6位验证码" maxlength="6" />
              <el-button type="primary" @click="handleSendPayCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 密码验证 -->
        <template v-else>
          <el-form-item label="当前登录密码" prop="password">
            <el-input
              v-model="payVerifyForm.password"
              type="password"
              show-password
              placeholder="请输入您的登录密码"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="closePayVerify">取消</el-button>
        <el-button type="primary" :loading="verifying" @click="confirmPayVerify">
          确认验证并支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getPayGoodsInfo, submitMockPay } from '@/api/front/pay'
import { sendSmsCode, loginByCode } from '@/api/front/user'
import { verifyPayPwd } from '@/api/front/user'

// 路由/状态/用户仓库
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const payList = ref<any[]>([])
const loading = ref(true)
const payLoading = ref(false)

// 地址逻辑
const addressFormRef = ref<FormInstance>()
const addressForm = reactive({
  region: [] as string[],
  detail: '',
})

// 完整省市区数据
const regionOptions = [
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110000',
        label: '北京市',
        children: [
          { value: '110101', label: '东城区' },
          { value: '110102', label: '西城区' },
          { value: '110105', label: '朝阳区' },
          { value: '110106', label: '丰台区' },
          { value: '110107', label: '石景山区' },
          { value: '110108', label: '海淀区' },
          { value: '110109', label: '门头沟区' },
          { value: '110111', label: '房山区' },
          { value: '110112', label: '通州区' },
          { value: '110113', label: '顺义区' },
          { value: '110114', label: '昌平区' },
          { value: '110115', label: '大兴区' },
          { value: '110116', label: '怀柔区' },
          { value: '110117', label: '平谷区' },
          { value: '110118', label: '密云区' },
          { value: '110119', label: '延庆区' },
        ],
      },
    ],
  },
  {
    value: '130000',
    label: '河北省',
    children: [
      {
        value: '130500',
        label: '邢台市',
        children: [
          { value: '130502', label: '襄都区' },
          { value: '130503', label: '信都区' },
          { value: '130504', label: '任泽区' },
          { value: '130505', label: '南和区' },
          { value: '130521', label: '临城县' },
          { value: '130522', label: '内丘县' },
          { value: '130523', label: '柏乡县' },
          { value: '130524', label: '隆尧县' },
          { value: '130525', label: '任县' },
          { value: '130526', label: '南和县' },
          { value: '130527', label: '宁晋县' },
          { value: '130528', label: '巨鹿县' },
          { value: '130529', label: '新河县' },
          { value: '130530', label: '广宗县' },
          { value: '130531', label: '平乡县' },
          { value: '130532', label: '威县' },
          { value: '130533', label: '清河县' },
          { value: '130534', label: '临西县' },
          { value: '130581', label: '南宫市' },
          { value: '130582', label: '沙河市' },
        ],
      },
    ],
  },
  { value: '120000', label: '天津市' },
  { value: '310000', label: '上海市' },
]

const addressRules = {
  region: [{ type: 'array', required: true, message: '请选择省市区', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
}

// 支付验证弹窗逻辑
const showPayVerifyDialog = ref(false)
const payVerifyFormRef = ref<FormInstance>()
const payVerifyForm = ref({
  phone: userStore.user?.phone || '',
  code: '',
  password: ''
})

// 验证方式：sms / password
const verifyType = ref<'sms' | 'password'>('sms')

const countdown = ref(0)
let timer: any = null
const verifying = ref(false)

// 🔥 通用数字格式化（和直付页统一）
const toFixedNumber = (num: any, digits: number) => {
  if (num === null || num === undefined) return '0.00'
  const number = Number(num) || 0
  return number.toFixed(digits)
}

// 发送支付验证码
const handleSendPayCode = async () => {
  const phone = payVerifyForm.value.phone
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('请输入正确的11位手机号！')
    return
  }

  try {
    const res = await sendSmsCode({ phone })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('验证码已发送：' + res.data.code)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (err) {
    ElMessage.error('网络异常')
  }
}

// 关闭弹窗
const closePayVerify = () => {
  showPayVerifyDialog.value = false
  payVerifyForm.value.code = ''
  payVerifyForm.value.password = ''
  clearInterval(timer)
  countdown.value = 0
}

// ====================== 验证逻辑（短信+密码） ======================
const confirmPayVerify = async () => {
  if (verifyType.value === 'sms' && !payVerifyForm.value.code) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (verifyType.value === 'password' && !payVerifyForm.value.password) {
    ElMessage.warning('请输入登录密码')
    return
  }

  verifying.value = true
  try {
    // 1. 短信验证
    if (verifyType.value === 'sms') {
      const res = await loginByCode({
        phone: payVerifyForm.value.phone,
        code: payVerifyForm.value.code,
        role: 'buyer',
      })
      //@ts-ignore
      if (res.code !== 200) {
        ElMessage.error(res.msg || '验证码错误')
        return
      }
    }
    // 2. 密码验证
    else {
      const res = await verifyPayPwd({
        password: payVerifyForm.value.password
      })
      //@ts-ignore
      if (res.code !== 200) {
        ElMessage.error('输入的密码有误，无法支付')
        verifying.value = false
        return
      }
    }

    // 验证成功 → 支付
    ElMessage.success('验证成功，正在支付...')
    closePayVerify()
    await doRealPay()

  } catch (error) {
  } finally {
    verifying.value = false
  }
}

// ====================================================
const cartIdsStr = route.query.cartIds as string
if (!cartIdsStr) {
  ElMessage.warning('请从购物车进入支付页面')
  router.push('/cart')
}
const cartIds = cartIdsStr?.split(',').filter((id) => id) || []

// 🔥 计算总金额（优先使用优惠价，和直付页逻辑一致）
const total = computed(() => {
  return payList.value
    .reduce((sum, item) => {
      const realPrice = Number(item.discount_price || item.book_price) || 0
      return sum + realPrice * Number(item.quantity)
    }, 0)
})

// 获取支付商品数据
const getPayData = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再支付')
    router.push('/login')
    loading.value = false
    return
  }

  loading.value = true
  try {
    //@ts-ignore
    const res = await getPayGoodsInfo(cartIds)
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

// 点击支付按钮
const mockPay = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录账号')
    router.push('/login')
    return
  }

  try {
    await addressFormRef.value?.validate()
  } catch (error) {
    ElMessage.warning('请完善全部收货地址信息')
    return
  }

  payVerifyForm.value.phone = userStore.user?.phone || ''
  showPayVerifyDialog.value = true
}

// 最终支付
const doRealPay = async () => {
  payLoading.value = true
  try {
    const addressPayload = {
      province: addressForm.region[0],
      city: addressForm.region[1],
      district: addressForm.region[2],
      detail: addressForm.detail,
    }

    // 传给 submitMockPay 接口
    const res = await submitMockPay(cartIds, addressPayload)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('🎉 订单支付成功！')
      router.push('/user')
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '订单支付提交失败')
    }
  } catch (error) {
    console.error('最终支付接口失败：', error)
    ElMessage.error('支付请求异常，请稍后重试')
  } finally {
    payLoading.value = false
  }
}

onMounted(() => {
  getPayData()
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>

.pay-container {
  padding: 15px;
  max-width: 600px;
  margin: 0 auto;
}
.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.loading-tip, .empty {
  text-align: center;
  padding: 40px 0;
}
.order-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 80px;
}
.address-section {
  margin-bottom: 20px;
}
.goods-list {
  margin-bottom: 15px;
}
.pay-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f2f2f2;
}
.cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  margin-right: 12px;
  border-radius: 4px;
}
.pay-total {
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 0;
}
.total-price {
  color: red;
  font-size: 18px;
}
.pay-btn {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  height: 48px;
  font-size: 16px;
}
.code-box {
  display: flex;
  gap: 10px;
}
</style>
<style scoped>
.pay-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.pay-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fdfdfd;
}

.goods-list {
  margin-bottom: 20px;
}

.pay-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 10px;
}

.cover {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.pay-total {
  text-align: right;
  margin: 20px 0;
  font-size: 20px;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  margin-left: 10px;
}

.pay-btn {
  width: 100%;
  font-weight: bold;
}

.loading,
.empty {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.verify-form {
  padding: 10px 0;
}
</style>

<style scoped>
.pay-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.pay-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fdfdfd;
}

.goods-list {
  margin-bottom: 20px;
}

.pay-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 10px;
}

.cover {
  width: 80px;
  height: 116px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.pay-total {
  text-align: right;
  margin: 20px 0;
  font-size: 20px;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  margin-left: 10px;
}

.pay-btn {
  width: 100%;
  font-weight: bold;
}

.loading,
.empty {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.verify-form {
  padding: 10px 0;
}
</style>
