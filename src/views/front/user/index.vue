<template>
  <div class="page-container">
    <el-button
      class="gwy"
      type="primary"
      @click="$router.push('/home')"
      :unstable-disable-deprecated-warning="true"
      >返回首页</el-button
    >
    <h2 class="sci-fi-title">个人中心</h2>

    <div v-if="userStore.isLogin">
      <el-card class="user-info-card" shadow="hover" :unstable-disable-deprecated-warning="true">
        <template #header>
          <span class="card-title">用户信息</span>
        </template>
        <div class="user-info-content">
          <!-- 手机号区域（修复版：处理空字符串 + 绑定后隐藏） -->
          <div v-if="!userStore.user?.phone || userStore.user?.phone.trim() === ''">
            <h3>绑定手机号</h3>
            <el-input
              v-model="phone"
              placeholder="请输入手机号"
              style="width: 300px"
              maxlength="11"
            />
            <el-button type="primary" @click="handleBind" style="margin-left: 10px">
              确认绑定
            </el-button>
          </div>
          <div v-else class="phone-binded">
            <h3>绑定手机号</h3>
            <p style="font-size: 16px; margin: 10px 0">
              已绑定：<strong style="color: #409eff">{{ userStore.user.phone }}</strong>
            </p>
          </div>

          <p><strong>用户名：</strong>{{ userStore.user?.username || '未知用户' }}</p>
          <p>
            <strong>用户角色：</strong>
            <el-tag :type="userStore.userRole === 'admin' ? 'danger' : 'primary'">
              {{
                userStore.userRole === 'admin'
                  ? '管理员'
                  : userStore.userRole === 'seller'
                    ? '卖家'
                    : '买家'
              }}
            </el-tag>
          </p>
          <p>
            <strong>注册时间：</strong>
            <!--@vue-ignore-->
            {{ formatTime(userStore.user?.create_time) || '暂无记录' }}
          </p>
        </div>
        <template #footer>
          <el-button
            style="margin-right: 30px; padding-left: 10px; padding-right: 10px"
            type="primary"
            @click="openEditDialog"
            >修改账密</el-button
          >
          <el-button
            style="
              position: relative;

              padding-top: 10px;
              padding-bottom: 10px;
              height: 30px;
              margin-right: 34px;
            "
            type="primary"
            size="small"
            @click="handleEditPhone"
          >
            修改绑定手机号
          </el-button>
          <el-button
            style="padding-left: 10px; padding-right: 10px"
            type="danger"
            @click="handleLogout"
            :unstable-disable-deprecated-warning="true"
            >退出登录</el-button
          >
        </template>
      </el-card>

      <!-- 修改账密弹窗 -->
      <el-dialog
        v-model="showEditDialog"
        title="修改用户名/密码"
        width="500px"
        style="padding: 20px !important"
        :close-on-click-modal="false"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
          <el-form-item style="margin-bottom: 20px" label="用户名/账号" prop="username">
            <el-input
              v-model="editForm.username"
              maxlength="13"
              placeholder="不修改请保持原样"
              clearable
            />
          </el-form-item>
          <el-form-item style="margin-bottom: 20px" label="新密码" prop="password">
            <el-input
              v-model="editForm.password"
              type="password"
              placeholder="不修改请留空"
              show-password
              maxlength="13"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPwd">
            <el-input
              v-model="editForm.confirmPwd"
              type="password"
              placeholder="再次输入新密码"
              show-password
              maxlength="13"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button
            style="margin-right: 10px; padding-left: 10px; padding-right: 10px"
            @click="showEditDialog = false"
            >取消</el-button
          >
          <el-button type="primary" @click="submitEdit">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- 新增：修改手机号弹窗 -->
      <el-dialog
        v-model="showEditPhoneDialog"
        title="修改绑定手机号"
        width="400px"
        :close-on-click-modal="false"
      >
        <el-form label-width="100px">
          <el-form-item label="新手机号">
            <el-input v-model="editPhone" placeholder="请输入新手机号" maxlength="11" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEditPhoneDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditPhone">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- 订单区域（修复弃用警告：type="text" → type="link"） -->
      <div class="order-section">
        <h3 class="sci-fi-subtitle">我的订单</h3>
        <el-button type="link" @click="getOrderList" class="refresh-btn">刷新订单</el-button>
        <el-table :data="orderList" border stripe v-loading="loading">
          <el-table-column prop="orderNo" label="订单编号" width="220" />
          <el-table-column label="图书封面" width="100">
            <template #default="scope">
              <img
                :src="scope.row.bookCover || '/default-book.png'"
                class="order-book-cover"
                style="cursor: pointer"
                @click="$router.push(`/order/${scope.row.orderNo}`)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="bookName" label="图书名称" min-width="200" />
          <el-table-column prop="count" label="购买数量" width="100" />
          <el-table-column prop="totalPrice" label="订单总价" width="120">
            <template #default="scope">¥{{ toFixedNumber(scope.row.totalPrice, 2) }}</template>
          </el-table-column>
          <el-table-column label="支付时间" width="200">
            <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="link"
                icon="el-icon-delete"
                @click="handleDeleteOrder(scope.row.orderNo)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loading && orderList.length === 0" class="empty-order">
          <p>暂无订单记录~</p>
          <el-button type="primary" @click="$router.push('/home')">去首页逛逛</el-button>
        </div>
      </div>
    </div>

    <div v-else class="no-login-tip">
      <h3>请先登录</h3>
      <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { deleteOrder, getUserOrderList } from '@/api/front/order'
import { updateUserInfoApi } from '@/api/front/user'
import { bindPhone } from '@/api/back/announcement'
import dayjs from 'dayjs'

const userStore = useUserStore()
const router = useRouter()
const phone = ref('')

// 修改手机号弹窗变量
const showEditPhoneDialog = ref(false)
const editPhone = ref('')

// ===================== 绑定手机号（绑定后刷新用户信息） =====================
const handleBind = async () => {
  if (!phone.value) {
    ElMessage.error('请输入手机号')
    return
  }
  const res = await bindPhone(phone.value) //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('绑定成功')

    // 1. 手动更新 Pinia 里的 phone，让页面立刻响应
    if (userStore.user) {
      userStore.user.phone = phone.value
    }
    // 2. 再调用 getUserInfo 同步后端数据
    //@ts-ignore
    await userStore.getUserInfo()
    phone.value = ''
  } else {
    //@ts-ignore
    ElMessage.error(res.msg)
  }
}

// ===================== 修改手机号 =====================
const handleEditPhone = () => {
  editPhone.value = userStore.user?.phone || ''
  showEditPhoneDialog.value = true
}
const confirmEditPhone = async () => {
  if (!editPhone.value) {
    ElMessage.error('请输入新手机号')
    return
  }
  const res = await bindPhone(editPhone.value) //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('手机号修改成功')
    // 手动更新 + 调用接口
    if (userStore.user) {
      userStore.user.phone = editPhone.value
    } //@ts-ignore
    await userStore.getUserInfo()
    showEditPhoneDialog.value = false
    editPhone.value = ''
  } else {
    //@ts-ignore
    ElMessage.error(res.msg)
  }
}

const orderList = ref<any>([])
const loading = ref(false)
const originalUsername = ref(userStore.user?.username || '')
const showEditDialog = ref(false)
const editFormRef = ref<FormInstance>()

const editForm = ref({
  username: userStore.user?.username || '',
  password: '',
  confirmPwd: '',
})

const validMobilePrefixes = [
  '130',
  '131',
  '132',
  '133',
  '134',
  '135',
  '136',
  '137',
  '138',
  '139',
  '150',
  '151',
  '152',
  '153',
  '155',
  '156',
  '157',
  '158',
  '159',
  '166',
  '172',
  '173',
  '175',
  '176',
  '177',
  '178',
  '180',
  '181',
  '182',
  '183',
  '184',
  '185',
  '186',
  '187',
  '188',
  '189',
  '190',
  '191',
  '192',
  '193',
  '195',
  '196',
  '197',
  '198',
  '199',
]

const isValidAccount = (str: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(str)
  const digitMatch = str.match(/\d/g)
  const hasEnoughDigits = digitMatch && digitMatch.length >= 5
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str) //@ts-ignore
  return hasLetter && hasEnoughDigits && onlyLetterAndDigit
}

const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  const prefix = phone.slice(0, 3)
  return validMobilePrefixes.includes(prefix)
}

const editRules = reactive<FormRules>({
  username: [
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    {
      //@ts-ignore
      validator: (rule: any, value: string, callback: any) => {
        if (value === originalUsername.value && editForm.value.password === '')
          callback(new Error('新账号与原账号一致'))
        if (isValidAccount(value) || isValidPhone(value)) {
          callback()
        } else {
          callback(new Error('格式：1字母+5位数字 或 11位正规手机号'))
        }
      },
      trigger: 'blur',
    },
  ],
  password: [{ min: 6, max: 13, message: '长度6-13位', trigger: 'blur' }],
  confirmPwd: [
    {
      //@ts-ignore
      validator: (r, newpassword, cb) => {
        if (editForm.value.password && newpassword !== editForm.value.password) {
          cb(new Error('两次密码不一致'))
        } else {
          cb()
        }
      },
      trigger: 'blur',
    },
  ],
})

const openEditDialog = () => {
  editForm.value.username = userStore.user?.username || ''
  editForm.value.password = ''
  editForm.value.confirmPwd = ''
  showEditDialog.value = true
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate()
  try {
    const params = {
      username: editForm.value.username,
      password: editForm.value.password || undefined,
      originalUsername: originalUsername.value,
    }
    const res = await updateUserInfoApi(params) //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
      showEditDialog.value = false
    } else {
      //@ts-ignore
      ElMessage.error(res.msg)
    }
  } catch (e) {
    ElMessage.error('修改失败')
  }
}

const toFixedNumber = (num: any, digits: number) => {
  if (num == null) return '0.00'
  return Number(num).toFixed(digits)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

const getStatusTagType = (status: string) => {
  const map = {
    待付款: 'warning',
    已付款: 'info',
    待发货: 'primary',
    已发货: 'success',
    已完成: 'success',
    已取消: 'danger',
  } //@ts-ignore
  return map[status as keyof map] || 'info'
}

const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')

const getOrderList = async () => {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getUserOrderList() //@ts-ignore
    if (res.code === 200) orderList.value = res.data
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const handleDeleteOrder = async (no: string) => {
  await ElMessageBox.confirm('确定删除？')
  const res = await deleteOrder(no) //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('删除成功')
    getOrderList()
  }
}

onActivated(() => userStore.isLogin && getOrderList())
onMounted(() => getOrderList())
</script>

<style scoped>
.refresh-btn {
  margin-bottom: 10px;
  color: #252f39;
  font-size: 19px;
}
.refresh-btn:hover {
  text-decoration: underline;
}
.empty-order {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.order-book-cover {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
* {
  user-select: none !important;
  -webkit-user-select: none !important;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
.page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #dfdfe0;
  min-height: 100vh;
  color: #e0e6ff;
}
.gwy {
  position: absolute;
  top: 65px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
.sci-fi-title {
  font-size: 28px;
  color: #409eff;
  text-align: center;
  margin: 30px 0;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}
.sci-fi-subtitle {
  font-size: 22px;
  color: #409eff;
  margin: 40px 0 20px;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}
.user-info-card {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
  padding: 20px;
  border-radius: 8px;
}
.card-title {
  color: #409eff;
  font-size: 18px;
  font-weight: 700;
}
.user-info-content {
  line-height: 2;
  font-size: 16px;
  color: rgb(0, 0, 0);
}
.no-login-tip {
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(18, 26, 40, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  margin-top: 100px;
}
.order-section {
  margin-top: 30px;
}
:deep(.el-table) {
  --el-table-header-bg-color: #ffffff !important;
  --el-table-row-hover-bg-color: #f5f7fa;
  --el-table-header-text-color: #409eff;
  --el-table-text-color: #151515;
  --el-table-bg-color: #fff;
  background-color: #fff !important;
  border: 1px solid #e4e7ed !important;
}
:deep(.el-table th) {
  background-color: #f6f2f2 !important;
}
:deep(.el-table td),
:deep(.el-table th) {
  border-color: #e4e7ed;
}
</style>
