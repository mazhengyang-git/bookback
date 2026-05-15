<template>
  <div class="page-container">
    <div class="topse">
      <el-button
        class="gwy"
        type="primary"
        @click="$router.push('/home')"
        :unstable-disable-deprecated-warning="true"
        >返回首页</el-button
      >
      <el-button
        class="zise"
        style="position: absolute; font-size: 17px; margin-left: 120px; top: 5px;z-index:10 "
        link
        @click="go('/cart')"
        ><img
          class="gwdh"
          style="width: 24px; height: auto; margin-right: 3px"
          src="/img/购物车.png"
        />购物车</el-button
      >
      <el-button
        class="zise1"
        style="position: absolute; font-size: 17px; margin-left: 250px; top: 5px;z-index:10 "
        link
        @click="go('/shoucang')"
        ><img
          class="gwdh1"
          style="width: 24px; height: auto; margin-right: 3px"
          src="/public/img/收藏夹.png"
        />收藏夹</el-button
      >
    </div>

    <div style="margin-top: 80px">
      <h2 class="sci-fi-title">个人中心</h2>

      <div v-if="userStore.isLogin">
        <el-card class="user-info-card" shadow="hover" :unstable-disable-deprecated-warning="true">
          <template #header>
            <span class="card-title">用户信息</span>
            <el-button
              style="padding-left: 10px; padding-right: 10px; margin-left: 50px"
              type="danger"
              @click="handleLogout"
              :unstable-disable-deprecated-warning="true"
              >退出登录</el-button
            >
          </template>

          <!--  头像区域 -->
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div class="avatar-wrapper" style="position: relative; margin-right: 20px;">
              <el-avatar :src="currentAvatar" size="80" />
              <div class="avatar-upload-btn" @click="openAvatarDialog">
                <el-icon><Plus /></el-icon>
              </div>
            </div>
            <div>
              <h2 style="margin:0">{{ userStore.user?.username || '未知用户' }}</h2>
            </div>
          </div>

          <div class="user-info-content">
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

            <div style="margin-top: 30px; font-weight: 600">
              <span>
                <strong>个人签名</strong><br />
                <hr style="margin-top: 25px" />
                <br /><span class="qmhh" style="font-size: 13px">{{
                  userStore.user?.sign || '暂无签名'
                }}</span>
              </span>
              <div style="margin-top: 20px; margin-bottom: 20px; margin-left: -9px">
                <el-button type="primary" @click="updetaqm" style="margin-left: 9px">{{
                  km ? '保存签名' : '设置签名'
                }}</el-button>
                <el-button
                  v-show="km === true"
                  type="primary"
                  @click="quxiqm"
                  style="margin-left: 43px; white-space: nowrap"
                >
                  取消修改
                </el-button>
                <br />
                <el-input
                  v-show="km === true"
                  v-model="inputtext"
                  type="textarea"
                  :rows="8"
                  class="sign-input"
                  style="
                    width: 330px;
                    text-align: left;
                    margin-top: 15px;
                    border: 1px solid #000000;
                    border-radius: 15px;
                  "
                  placeholder="请输入个人签名"
                />
              </div>
            </div>
          </template>
        </el-card>

        <!-- 修改头像弹窗 -->
        <el-dialog v-model="showAvatarDialog" title="修改头像" width="500px">
          <el-upload
            class="avatar-uploader"
            :http-request="customUpload"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar
              v-if="previewAvatar"
              :src="previewAvatar"
              size="120"
              class="preview-avatar"
            />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
          <div style="margin-top: 15px; text-align: center; color: #909399; font-size: 13px;">
            支持 jpg/png 格式，大小不超过 2MB
          </div>
          <template #footer>
            <el-button @click="showAvatarDialog = false">取消</el-button>
          </template>
        </el-dialog>

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

        <!-- 修改手机号弹窗 -->
        <el-dialog
          v-model="showEditPhoneDialog"
          title="修改绑定手机号"
          width="550px"
          :close-on-click-modal="false"
          @close="resetPhoneDialog"
        >
          <el-form
            ref="editPhoneFormRef"
            :model="editPhoneForm"
            label-width="110px"
            :rules="editPhoneRules"
          >
            <el-form-item label="身份验证方式">
              <el-radio-group v-model="verifyType">
                <el-radio label="原绑定手机号验证" value="phone" />
                <el-radio label="当前账号密码验证" value="password" />
              </el-radio-group>
            </el-form-item>

            <template v-if="verifyType === 'phone'">
              <el-form-item label="原绑定手机号">
                <el-input v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
              </el-form-item>
              <el-form-item label="原手机验证码" prop="oldSmsCode">
                <div class="code-box">
                  <el-input
                    v-model="editPhoneForm.oldSmsCode"
                    placeholder="请输入6位验证码"
                    maxlength="6"
                  />
                  <el-button type="primary" @click="sendOldPhoneSms" :disabled="smsCountdown > 0">
                    {{ smsCountdown > 0 ? `${smsCountdown}秒后重发` : '发送验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item v-if="showCaptcha" label="安全核验" prop="captcha">
                <div class="captcha-row">
                  <el-input
                    v-model="editPhoneForm.captcha"
                    placeholder="请输入验证码"
                    maxlength="4"
                    style="flex: 1"
                  />
                  <div style="color: #000" class="captcha-img" @click="refreshCaptcha">
                    {{ captchaCode }}
                  </div>
                </div>
              </el-form-item>
            </template>

            <el-form-item v-if="verifyType === 'password'" label="当前账号密码" prop="oldPwd">
              <el-input
                v-model="editPhoneForm.oldPwd"
                type="password"
                placeholder="输入登录密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="success" @click="checkIdentity">验证身份</el-button>
              <span v-if="isPass" style="color: #67c230; margin-left: 12px">✅ 身份验证已通过</span>
            </el-form-item>

            <el-divider />

            <el-form-item label="新手机号" prop="newPhone">
              <el-input
                v-model="editPhoneForm.newPhone"
                placeholder="请输入新手机号"
                maxlength="11"
                :disabled="!isPass"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showEditPhoneDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmEditPhone" :disabled="!isPass"
              >确认修改</el-button
            >
          </template>
        </el-dialog>

        <!-- 订单 -->
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
                  >退货退款</el-button
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, reactive, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { deleteOrder, getUserOrderList } from '@/api/front/order'
import {
  bindPhone,
  sendSmsCode,
  verifyPaySmsCode,
  updateUserInfoApi,
  getSign,
  updasign,
  uploadAvatar,
} from '@/api/front/user'
import dayjs from 'dayjs'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const phone = ref('')

// ===================== 头像功能 =====================
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

const currentAvatar = computed(() => {
  return userStore.user?.avatar || 'https://cube.elemecdn.com/0/5/0df5cf44e51f1197950fddc469d08jpeg.jpeg'
})

const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}

const beforeAvatarUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('头像只能是 JPG/PNG 格式')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB')
    return false
  }
  return true
}

const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      previewAvatar.value = res.data.url
      if (userStore.user) {
        userStore.user.avatar = res.data.url
      }
      showAvatarDialog.value = false
    } else {
       //@ts-ignore
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (err) {
    ElMessage.error('上传失败')
  }
}


const showEditPhoneDialog = ref(false)
const verifyType = ref<'phone' | 'password'>('phone')
const originalPhone = ref('')
const smsCountdown = ref(0)
let smsTimer: any = null

const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const captchaCode = ref('')
const showCaptcha = ref(false) //@ts-ignore
const inputtext = ref(``) //@ts-ignore
const bcqm = ref(``)
const km = ref(false)

const editPhoneForm = ref({
  oldSmsCode: '',
  oldPwd: '',
  newPhone: '',
  captcha: '',
})
const editPhoneFormRef = ref<FormInstance>()
const isPass = ref(false)

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
  '130','131','132','133','134','135','136','137','138','139',
  '150','151','152','153','155','156','157','158','159','166',
  '172','173','175','176','177','178','180','181','182','183',
  '184','185','186','187','188','189','190','191','192','193',
  '195','196','197','198','199',
]
const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  const prefix = phone.slice(0, 3)
  return validMobilePrefixes.includes(prefix)
}
const isValidAccount = (str: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(str)
  const digitMatch = str.match(/\d/g)
  const hasEnoughDigits = digitMatch && digitMatch.length >= 5
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str) //@ts-ignore
  return hasLetter && hasEnoughDigits && onlyLetterAndDigit
}

const editPhoneRules = reactive<FormRules>({
  oldPwd: [
    { required: true, message: '请输入当前账号密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  oldSmsCode: [{ required: true, message: '请输入原手机短信验证码', trigger: 'blur' }],
  captcha: [
    { //@ts-ignore
      validator: (rule, value, callback) => {
        if (value?.toUpperCase() === captchaCode.value) callback()
        else callback(new Error('图片验证码错误'))
      },
    },
  ],
  newPhone: [
    { required: true, message: '请输入新手机号', trigger: 'blur' },
    { //@ts-ignore
      validator: (rule, value, callback) => {
        if (!isValidPhone(value)) return callback(new Error('请输入11位正规手机号'))
        if (value === originalPhone.value) return callback(new Error('不能与原手机号一致'))
        callback()
      },
    },
  ],
})

const handleEditPhone = () => {
  originalPhone.value = userStore.user?.phone || ''
  resetPhoneDialog()
  showEditPhoneDialog.value = true
}

const resetPhoneDialog = () => {
  editPhoneForm.value = { oldSmsCode: '', oldPwd: '', newPhone: '', captcha: '' }
  isPass.value = false
  showCaptcha.value = false
  smsCountdown.value = 0
  clearInterval(smsTimer)
  editPhoneFormRef.value?.clearValidate()
}

const generateCaptcha = () => {
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()

const sendOldPhoneSms = async () => {
  if (!originalPhone.value) return ElMessage.error('未绑定手机号')
  if (!isValidPhone(originalPhone.value)) return ElMessage.error('手机号格式异常')
  if (!showCaptcha.value) {
    showCaptcha.value = true
    generateCaptcha()
    return ElMessage.info('请完成图片验证')
  }
  if (editPhoneForm.value.captcha?.toUpperCase() !== captchaCode.value) {
    refreshCaptcha()
    return ElMessage.error('图片验证码错误')
  }
  try {
    const res = await sendSmsCode({ phone: originalPhone.value })
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('验证码已发送：' + res.data.code)
      smsCountdown.value = 60
      smsTimer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) clearInterval(smsTimer)
      }, 1000)
      showCaptcha.value = false
      editPhoneForm.value.captcha = ''
    }
  } catch (e) {}
  refreshCaptcha()
}

const checkIdentity = async () => {
  if (!editPhoneFormRef.value) return
  if (verifyType.value === 'phone') { //@ts-ignore
    await editPhoneFormRef.value.validate((p) => p === 'oldSmsCode')
    try {
      const res = await verifyPaySmsCode({
        phone: originalPhone.value,
        code: editPhoneForm.value.oldSmsCode,
      })
      //@ts-ignore
      if (res.code === 200) {
        isPass.value = true
        ElMessage.success('✅ 验证成功')
      } else ElMessage.error('验证码错误')
    } catch (e) {}
  } else {
    const p = editPhoneForm.value.oldPwd
    if (p.length >= 6 && p.length <= 13) {
      isPass.value = true
      ElMessage.success('✅ 验证成功')
    } else ElMessage.error('密码格式错误')
  }
}

const confirmEditPhone = async () => {
  if (!editPhoneFormRef.value || !isPass.value) return
  await editPhoneFormRef.value.validate()
  try {
    const res = await bindPhone(editPhoneForm.value.newPhone)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('🎉 修改成功')
      userStore.user.phone = editPhoneForm.value.newPhone
      showEditPhoneDialog.value = false
      resetPhoneDialog()
    }
  } catch (e) {}
}

const handleBind = async () => {
  if (!phone.value) return ElMessage.error('请输入手机号')
  const res = await bindPhone(phone.value)
  //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('绑定成功')
    userStore.user.phone = phone.value
    phone.value = ''
  } else {
    //@ts-ignore
    ElMessage.error(res.msg)
  }
}

const editRules = reactive<FormRules>({
  username: [
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    { //@ts-ignore
      validator: (rule: any, value: string, callback: any) => {
        if (value === originalUsername.value && !editForm.value.password)
          return callback(new Error('未做任何修改'))
        if (isValidAccount(value) || isValidPhone(value)) callback()
        else callback(new Error('格式：字母+数字 或 11位手机号'))
      },
      trigger: 'blur',
    },
  ],
  password: [{ min: 6, max: 13, message: '长度6-13位', trigger: 'blur' }],
  confirmPwd: [
    { //@ts-ignore
      validator: (r, p, cb) => {
        if (editForm.value.password && p !== editForm.value.password) cb(new Error('两次密码不一致'))
        else cb()
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
    const res = await updateUserInfoApi(params)
    //@ts-ignore
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

const go = (path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) => {
  setTimeout(() => router.push(path), 10)
}

const fetchUserSign = async () => {
  try {
    const res = await getSign()
    //@ts-ignore
    if (res.code === 200 && res.data) {
      userStore.user.sign = res.data.sign || ''
    }
  } catch (e) {}
}

const updetaqm = async () => {
  if (!km.value) {
    km.value = true
    inputtext.value = userStore.user?.sign || ''
    return
  }
  try {
    const res = await updasign(inputtext.value)
    //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('🎉 保存成功')
      await fetchUserSign()
      inputtext.value = ''
      km.value = false
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const quxiqm = () => {
  km.value = false
}

const toFixedNumber = (num: any, digits: number) => {
  if (num == null) return '0.00'
  return Number(num).toFixed(digits)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
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
  }
  //@ts-ignore
  return map[status] || 'info'
}

const formatTime = (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无')

const getOrderList = async () => {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getUserOrderList()
    //@ts-ignore
    if (res.code === 200) orderList.value = res.data
  } catch (e) {
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const handleDeleteOrder = async (no: string) => {
  await ElMessageBox.confirm('确定删除？')
  const res = await deleteOrder(no)
  //@ts-ignore
  if (res.code === 200) {
    ElMessage.success('删除成功')
    getOrderList()
  }
}

onUnmounted(() => clearInterval(smsTimer))
onActivated(() => {
  if (userStore.isLogin) {
    getOrderList()
    fetchUserSign()
  }
})
onMounted(() => {
  if (userStore.isLogin) {
    getOrderList()
    fetchUserSign()
  }
})
</script>

<style scoped>
/* 头像容器 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

/* 头像加号按钮 */
.avatar-upload-btn {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 20px;
  height: 20px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 上传组件样式 */
.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 32px;
  color: #c0c4cc;
}

.preview-avatar {
  width: 100%;
  height: 100%;
}
/*全局页面*/
.page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;

  background:
    radial-gradient(circle at top right, rgba(64, 158, 255, 0.12), transparent 22%),
    radial-gradient(circle at bottom left, rgba(255, 170, 0, 0.1), transparent 25%),
    linear-gradient(135deg, #f5f7fb, #eef3ff);

  color: #1f2937;
  overflow-x: hidden;
}

/*顶部导航栏*/
.topse {
  position: fixed;
  top: 0;
  z-index: 999;
margin-left: -23.5px;
  display: flex;
  align-items: center;
  gap: 16px;

  width: 1279px;
  height: 68px;

  padding: 0 24px;
  margin-bottom: 35px;

  border-radius: 18px;

  background: rgba(231, 231, 231, 0.75);
  backdrop-filter: blur(18px);

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.121),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);

  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 返回首页按钮 */
.gwy {
  height: 42px;
  padding: 0 18px !important;

  border-radius: 12px !important;

  background: linear-gradient(135deg, #409eff, #6bc3ff) !important;
  border: none !important;

  font-weight: 700;
  letter-spacing: 0.5px;

  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);

  transition: all 0.25s ease;
}

.gwy:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(64, 158, 255, 0.35);
}

/* 顶部功能按钮 */
.zise,
.zise1 {
  position: static !important;
  margin-left: 0 !important;
  top: auto !important;

  display: flex;
  align-items: center;

  padding: 8px 14px;

  border-radius: 12px;

  font-size: 15px !important;
  font-weight: 700;

  transition: all 0.25s ease;
}

.zise {
  color: #ff7b00;
  background: rgba(255, 180, 0, 0.08);
}

.zise1 {
  color: #ff4d8d;
  background: rgba(255, 77, 141, 0.08);
}

.zise:hover,
.zise1:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
}

/* 图标动画 */
.gwdh,
.gwdh1 {
  width: 24px;
  height: auto;
  margin-right: 6px;
}

.gwdh {
  animation: cartFloat 2s infinite ease-in-out;
}

.gwdh1 {
  animation: favFloat 2s infinite ease-in-out;
}

@keyframes cartFloat {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(8deg) scale(1.08);
  }
}

@keyframes favFloat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

/* 标题区域 */
.sci-fi-title {
  position: relative;

  width: fit-content;

  margin: 0 auto 40px;

  font-size: clamp(32px, 5vw, 46px);
  font-weight: 800;

  color: #1f2937;

  letter-spacing: 2px;
}

.sci-fi-title::before {
  content: '👤';
  margin-right: 12px;
}

.sci-fi-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;

  transform: translateX(-50%);

  width: 70%;
  height: 4px;

  border-radius: 999px;

  background: linear-gradient(
    90deg,
    rgba(64, 158, 255, 0),
    rgba(64, 158, 255, 1),
    rgba(64, 158, 255, 0)
  );
}

/* 卡片主体 */
.user-info-card {
  overflow: hidden;

  border: none !important;
  border-radius: 24px !important;

  background: rgba(255, 255, 255, 0.78) !important;
  backdrop-filter: blur(18px);

  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);

  transition: all 0.3s ease;
}

.user-info-card:hover {
  transform: translateY(0px);
}

/* 卡片标题 */
.card-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

/* 用户信息 */
.user-info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

  gap: 18px;

  margin-top: 10px;

  line-height: 2;
  color: #1f2937;
}

.user-info-content p,
.phone-binded,
.user-info-content h3 {
  padding: 18px;

  border-radius: 18px;

  background: rgba(245, 248, 255, 0.9);

  border: 1px solid rgba(64, 158, 255, 0.08);

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
}

/* 标签 */
:deep(.el-tag) {
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 700;
}

/*个人签名*/
.qmhh {
  display: block;

  width: 100%;

  padding: 20px;

  margin-top: 12px;

  border-radius: 16px;

  line-height: 2;

  background: linear-gradient(135deg, #f7faff, #eef4ff);

  border: 1px solid rgba(64, 158, 255, 0.08);

  color: #374151;

  font-size: 15px !important;
}

/* 输入框 */
.sign-input :deep(.el-textarea__inner) {
  border-radius: 18px !important;

  padding: 18px !important;

  background: rgba(255, 255, 255, 0.9) !important;

  border: 1px solid rgba(64, 158, 255, 0.15);

  color: #111827;

  font-size: 15px;

  transition: all 0.25s ease;
}

.sign-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
}

/* 验证码区域 */
.code-box,
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-img {
  width: 120px;
  height: 42px;

  border-radius: 12px;

  background: linear-gradient(135deg, #409eff, #7ec9ff);

  color: white;

  text-align: center;
  line-height: 42px;

  font-size: 20px;
  font-weight: 800;
  letter-spacing: 3px;

  cursor: pointer;

  user-select: none;

  transition: all 0.25s ease;
}

.captcha-img:hover {
  transform: scale(1.03);
}

/*订单区域*/
.order-section {
  margin-top: 45px;
}

.sci-fi-subtitle {
  display: flex;
  align-items: center;

  font-size: 28px;
  font-weight: 800;

  color: #1f2937;

  margin-bottom: 18px;
}

.sci-fi-subtitle::before {
  content: '📦';
  margin-right: 10px;
}

/* 刷新按钮 */
.refresh-btn {
  margin-bottom: 18px;

  font-size: 16px;
  font-weight: 700;

  color: #409eff;

  transition: all 0.25s ease;
}

.refresh-btn:hover {
  color: #0b7cff;
  transform: translateX(2px);
}

/*表格美化*/
:deep(.el-table) {
  overflow: hidden;

  border-radius: 22px;

  background: rgba(255, 255, 255, 0.92);

  border: none !important;

  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.06);

  --el-table-header-bg-color: #f7faff;
  --el-table-row-hover-bg-color: #f0f7ff;
  --el-table-header-text-color: #1f2937;
  --el-table-text-color: #374151;
}

:deep(.el-table th) {
  height: 58px;

  font-size: 15px;
  font-weight: 800;

  background: #f7faff !important;
}

:deep(.el-table td) {
  padding: 14px 0;
}

:deep(.el-table__row) {
  transition: all 0.25s ease;
}

:deep(.el-table__row:hover) {
  transform: scale(0.997);
}

/* 图书封面 */
.order-book-cover {
  width: 72px;
  height: 96px;

  object-fit: cover;

  border-radius: 12px;

  border: 2px solid rgba(64, 158, 255, 0.08);

  transition: all 0.25s ease;
}

.order-book-cover:hover {
  transform: scale(1.05);
}

/*空订单*/
.empty-order {
  padding: 60px 20px;

  margin-top: 20px;

  border-radius: 24px;

  text-align: center;

  background: rgba(255, 255, 255, 0.78);

  color: #6b7280;

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.05);
}

/*未登录*/
.no-login-tip {
  margin-top: 100px;
  padding: 80px 30px;

  border-radius: 26px;

  text-align: center;

  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.no-login-tip h3 {
  font-size: 34px;
  color: #1f2937;
  margin-bottom: 20px;
}

/*按钮*/
:deep(.el-button--primary) {
  border: none !important;

  background: linear-gradient(135deg, #409eff, #73c0ff) !important;

  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.2);

  transition: all 0.25s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
}

:deep(.el-button--danger) {
  border: none !important;

  background: linear-gradient(135deg, #ff6b6b, #ff8787) !important;
}


:deep(.el-dialog) {
  border-radius: 24px !important;

  overflow: hidden;

  background: rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(20px);

  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

:deep(.el-dialog__header) {
  padding: 24px 24px 10px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.el-dialog__title) {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/*  响应式  */
@media (max-width: 768px) {
  .topse {
    flex-wrap: wrap;
    height: auto;
    padding: 14px;
  }

  .user-info-content {
    grid-template-columns: 1fr;
  }

  .sci-fi-title {
  position: relative;
    font-size: 34px;
    top: -2px !important;
   
  }

  .sci-fi-subtitle {
    font-size: 24px;
  }

  .qmhh {
    width: 100%;
  }

  .code-box,
  .captcha-row {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-img {
    width: 100%;
  }
}

/* 全局基础 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  user-select: none !important;
  -webkit-user-select: none !important;
}

input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
</style>
