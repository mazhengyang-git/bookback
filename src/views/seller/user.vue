<template>
  <div class="page-container">
    <div>
      <el-card class="user-info-card" shadow="hover">
        <template #header>
          <div
            v-if="showUser.is_seller_banned == 1"
            style="margin-top: 8px; color: #f53f3f; font-weight: 600; font-size: 15px;white-space: nowrap;position: absolute;margin-left: 120px;"
          >
            申诉电话29931901310
          </div>
          <span class="card-title">欢迎您!</span>
          <!-- 新增：修改账密按钮 -->
          <el-button
            v-if="isMySelf"
            style="margin-left: 30px;"
            type="primary"
            size="small"
            @click="openEditDialog"
          >
            修改账密
          </el-button>
        </template>

        <div class="user-info-content">
          <p>
            <span style="display: flex; align-items: center; margin-bottom: 20px">
              <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
                <el-avatar :src="showUser.avatar" size="80" />
                <div v-if="isMySelf" class="avatar-upload-btn" @click="openAvatarDialog">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>

              <div>
                <h2 style="margin: 0">{{ showUser.username }}</h2>

                <!-- 红色警告提示 -->
                <div
                  v-if="showUser.is_seller_banned == 1"
                  class="xzwy"
                  style="margin-top: 8px; color: #f53f3f; font-weight: 600; font-size: 15px;white-space: nowrap;position: absolute;"
                >
                  ⚠️ 您的账户已被管理员限制,新增或编辑图书权限已受限
                </div>
              </div>
            </span>
          </p>

          <p class="jsjianju">
            <strong>用户角色：</strong>
            <el-tag :type="showUser.role === 'admin' ? 'danger' : 'primary'">
              {{ showUser.role === 'admin' ? '管理员' : showUser.role === 'seller' ? '卖家' : '买家' }}
            </el-tag>
          </p>

         
        
        </div>

        <!-- 卖家统计 -->
        <div class="seller-stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.bookCount }}</div>
            <div class="stat-label">已上架图书</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingCount }}</div>
            <div class="stat-label">待审核申请</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥{{ Number(stats.sales || 0).toFixed(2) }}</div>
            <div class="stat-label">本月销售额</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <div
            class="action-card"
            @click="handleApply"
            :style="{ opacity: showUser.is_seller_banned == 1 ? 0.5 : 1, cursor: showUser.is_seller_banned == 1 ? 'not-allowed' : 'pointer' }"
          >
            <el-icon class="action-icon"><DocumentAdd /></el-icon>
            <span>发布图书</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/apply-list')">
            <el-icon class="action-icon"><List /></el-icon>
            <span>申请管理</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/orders')">
            <el-icon class="action-icon"><DocumentChecked /></el-icon>
            <span>订单管理</span>
          </div>
          <div class="action-card" @click="$router.push('/seller/book-list')">
            <el-icon class="action-icon"><Reading /></el-icon>
            <span>已上架图书</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 头像弹窗 -->
    <el-dialog v-if="isMySelf" v-model="showAvatarDialog" title="修改头像" width="500px">
      <el-upload class="avatar-uploader" :http-request="customUpload" :show-file-list="false" :before-upload="beforeAvatarUpload">
        <el-avatar v-if="previewAvatar" :src="previewAvatar" size="120" />
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </el-upload>
      <div style="margin-top: 15px; text-align: center; color: #909399; font-size: 13px;">
        支持 jpg/png/webp 格式，大小不超过 2MB
      </div>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 新增：修改账密弹窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="修改用户名/密码"
      width="550px"
      style="padding: 20px !important"
      :close-on-click-modal="false"
    >
      <!-- 身份验证区域 -->
      <el-form
        ref="editPwdVerifyFormRef"
        :model="editPwdVerifyForm"
        :rules="editPwdVerifyRules"
        label-width="110px"
        v-if="!isPassEdit"
        class="verify-section"
      >
        <h3 style="margin-bottom:15px;">身份验证（验证通过后才能修改）</h3>
        <el-radio-group v-model="verifyTypeEdit" style="margin-bottom:15px;">
          <el-radio label="当前密码验证" value="password" />
          <el-radio label="原绑定手机号验证" value="phone" />
        </el-radio-group>

        <!-- 密码验证 -->
        <el-form-item v-if="verifyTypeEdit === 'password'" label="当前密码" prop="oldPwd">
          <el-input
            v-model="editPwdVerifyForm.oldPwd"
            type="password"
            show-password
            placeholder="请输入当前登录密码"
          />
        </el-form-item>

        <!-- 手机号验证 -->
        <template v-else>
          <el-form-item label="绑定手机号 ">
            <el-input style="margin-left: 2.8px !important;" v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
          </el-form-item>
          <el-form-item class="yz" label="短信验证码" prop="smsCode">
            <div class="code-box">
              <el-input v-model="editPwdVerifyForm.smsCode" placeholder="6位验证码" maxlength="6" />
              <el-button style="margin-top: 10px !important;" class="yz1" type="primary" @click="sendEditPwdSms" :disabled="smsCountdownEdit > 0">
                {{ smsCountdownEdit > 0 ? `${smsCountdownEdit}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 图片验证码 -->
        <el-form-item label="安全验证" prop="captcha">
          <div class="captcha-row">
            <el-input v-model="editPwdVerifyForm.captcha" placeholder="验证码" maxlength="4" style="flex:1" />
            <div class="captcha-img" @click="refreshCaptchaEdit">{{ captchaCodeEdit }}</div>
          </div>
        </el-form-item>

        <el-button class="yz1" style="margin-top: 10px;" type="success" @click="checkIdentityEdit">✅ 验证身份</el-button>
        <span v-if="isPassEdit" style="color:#67c230;margin-left:12px">身份验证已通过</span>
      </el-form>

      <!-- 修改表单（验证通过才显示） -->
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        v-if="isPassEdit"
      >
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
        <el-button class="yz1" @click="closeEditDialog">取消</el-button>
        <el-button
          class="yz"
          type="primary"
          @click="submitEdit"
          :disabled="!isPassEdit"
        >确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, DocumentAdd, List, Reading, DocumentChecked } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { uploadAvatar, getUserPublicInfo, sendSmsCode, verifyPaySmsCode, updateUserInfoApi } from '@/api/front/user'
import { getSellerStats } from '@/api/seller/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const targetUsername = ref('')
const stats = ref({ bookCount: 0, pendingCount: 0, sales: 0, orderCount: 0 })
const showAvatarDialog = ref(false)
const previewAvatar = ref('')

// 每 2.5 秒自动拉取最新用户状态（实时同步限制）
let refreshTimer: number | null = null
const AUTO_REFRESH_INTERVAL = 2500

const isMySelf = computed(() => !targetUsername.value || targetUsername.value === userStore.user?.username)

const showUser = computed(() => {
  if (isMySelf.value) {
    return {
      ...userStore.user,
      username: userStore.user?.username || '未知用户',
      role: userStore.userRole || 'buyer',
      is_seller_banned: userStore.user?.is_seller_banned || 0
    }
  }
  return userStore.user || {}
})

// 点击发布图书
const handleApply = () => {
  if (showUser.value.is_seller_banned == 1) {
    ElMessage.error('您的账户已被限制，无法发布图书')
    return
  }
  router.push('/seller/apply')
}

// 加载统计
const loadSellerStats = async () => {
  try {
    const res = await getSellerStats()
    if (res.code === 200) stats.value = res.data
  } catch (e) { ElMessage.error('暂无统计数据') }
}

// 后端拉最新用户状态
const refreshUserInfo = async () => {
  try {
    const res = await getUserPublicInfo(userStore.user.username)
    if (res.code === 200) {
      const oldStatus = userStore.user.is_seller_banned
      userStore.user.is_seller_banned = res.data.is_seller_banned

      // 状态变化时提示
      if (oldStatus !== res.data.is_seller_banned) {
        if (res.data.is_seller_banned == 1) {
          ElMessage.warning('您的账户已被管理员限制')
        } else {
          ElMessage.success('您的账户限制已解除')
        }
      }
    }
  } catch (e) {
    console.error('刷新用户信息失败', e)
  }
}

// 自动轮询后端状态
onMounted(async () => {
  if (route.query.username) targetUsername.value = route.query.username

  // 进入页面先拉一次
  await refreshUserInfo()
  await loadSellerStats()

  // 每 2.5 秒自动同步一次
  refreshTimer = window.setInterval(async () => {
    await refreshUserInfo()
  }, AUTO_REFRESH_INTERVAL)
})

// 页面销毁清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  // 清除修改账密的短信定时器
  clearInterval(smsTimerEdit)
})

// 头像逻辑
const openAvatarDialog = () => {
  previewAvatar.value = userStore.user?.avatar || ''
  showAvatarDialog.value = true
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type.includes('image')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能上传图片')
  if (!isLt2M) ElMessage.error('不能超过 2MB')
  return isImg && isLt2M
}
const customUpload = async (options) => {
  try {
    const res = await uploadAvatar(options.file)
    if (res.code === 200) {
      ElMessage.success('上传成功')
      userStore.user.avatar = res.data.url
      showAvatarDialog.value = false
    }
  } catch (e) { ElMessage.error('上传失败') }
}

// ===================== 新增：修改账密功能 =====================
const showEditDialog = ref(false)
const isPassEdit = ref(false)
const verifyTypeEdit = ref<'password' | 'phone'>('password')
const editFormRef = ref<FormInstance>()
const editPwdVerifyFormRef = ref<FormInstance>()

const editPwdVerifyForm = ref({
  oldPwd: '',
  smsCode: '',
  captcha: '',
})

const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const captchaCodeEdit = ref('')
const smsCountdownEdit = ref(0)
let smsTimerEdit: any = null

const editForm = ref({
  username: userStore.user?.username || '',
  password: '',
  confirmPwd: '',
})
const originalUsername = ref(userStore.user?.username || '')
const originalPhone = ref(userStore.user?.phone || '')

// 手机号格式校验
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
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str)
  return hasLetter && hasEnoughDigits && onlyLetterAndDigit
}

// 身份验证表单规则
const editPwdVerifyRules = reactive<FormRules>({
  oldPwd: [
    { required: true, message: '请输入当前登录密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value?.toUpperCase() === captchaCodeEdit.value) callback()
        else callback(new Error('图片验证码错误'))
      },
    },
  ],
})

// 修改表单规则
const editRules = reactive<FormRules>({
  username: [
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    {
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
    {
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
  originalPhone.value = userStore.user?.phone || ''
  editForm.value.password = ''
  editForm.value.confirmPwd = ''
  isPassEdit.value = false
  resetEditPwdVerify()
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  resetEditPwdVerify()
}

const resetEditPwdVerify = () => {
  isPassEdit.value = false
  smsCountdownEdit.value = 0
  editPwdVerifyForm.value = { oldPwd: '', smsCode: '', captcha: '' }
  clearInterval(smsTimerEdit)
  generateCaptchaEdit()
}

const generateCaptchaEdit = () => {
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  captchaCodeEdit.value = code
}
const refreshCaptchaEdit = () => generateCaptchaEdit()

// 发送短信验证码
const sendEditPwdSms = async () => {
  if (!originalPhone.value) return ElMessage.error('未绑定手机号')
  if (!isValidPhone(originalPhone.value)) return ElMessage.error('手机号格式异常')

  try {
    const res = await sendSmsCode({ phone: originalPhone.value })
    if (res.code === 200) {
      ElMessage.success('验证码已发送：' + res.data.code)
      smsCountdownEdit.value = 60
      smsTimerEdit = setInterval(() => {
        smsCountdownEdit.value--
        if (smsCountdownEdit <= 0) clearInterval(smsTimerEdit)
      }, 1000)
    }
  } catch (e) {}
}

// 身份验证
const checkIdentityEdit = async () => {
  if (!editPwdVerifyFormRef.value) return
  
  const validateFields = verifyTypeEdit.value === 'password' 
    ? ['oldPwd', 'captcha'] 
    : ['smsCode', 'captcha']
  
  try {
    await editPwdVerifyFormRef.value.validateField(validateFields)
  } catch {
    return
  }

  if (verifyTypeEdit.value === 'password') {
    isPassEdit.value = true
    ElMessage.success('✅ 密码验证成功')
  } else {
    try {
      const res = await verifyPaySmsCode({
        phone: originalPhone.value,
        code: editPwdVerifyForm.value.smsCode,
      })
      if (res.code === 200) {
        isPassEdit.value = true
        ElMessage.success('✅ 验证码验证成功')
      } else {
        ElMessage.error('验证码错误')
      }
    } catch (e) {}
  }
}

// 提交修改
const submitEdit = async () => {
  if (!editFormRef.value || !isPassEdit.value) return
  await editFormRef.value.validate()

  try {
    const params = {
      username: editForm.value.username,
      password: editForm.value.password || undefined,
      originalUsername: originalUsername.value,
    }
    const res = await updateUserInfoApi(params)
    if (res.code === 200) {
      ElMessage.success('修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
      showEditDialog.value = false
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e) {
    ElMessage.error('修改失败')
  }
}
</script>

<style scoped>
.xzwy{

}
.captcha-img{
  background-color: #666666;
  width: 80px;
  color: #ffffff;
  font-weight: 550;
  margin-top: 10px;
  padding-left: 22.5px;
}
@media (max-width:768px) {
  .xzwy{
    left: 42px;
    z-index: 9;
  transform: translateY(-29px);
  }

}
.jsjianju{ position: relative; margin-left: 100px;}
@media (max-width:768px) {
  .jsjianju{margin-left: 0px;}
}
.jsjianju1{ position: relative; }
.page-container {
  width: 100%; max-width: 1280px; margin: 0 auto; padding: 24px; min-height: 100vh;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.45), transparent 22%),
              radial-gradient(circle at bottom left, rgba(255,255,255,0.1), transparent 25%),
              linear-gradient(135deg, rgba(255,255,255,0.45), #c7c5c5);
  color: #e0e1e2; overflow-x: hidden;
}
.user-info-card {
  min-height: 626px;
   border-radius: 24px;
  
 
  box-shadow: 0 20px 45px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,183,0,0.7);
}
.card-title { font-size: 26px; font-weight: 800; color: #111827; }
.user-info-content {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr));
  gap: 18px; height: 120px; margin-left: 6px; line-height: 3.2; color: #1f2937;
}
.user-info-content p {
  min-height: 90px; padding: 18px; max-width: 390px; border-radius: 18px;
  background: rgba(237,206,200,0.56); border: 1px solid rgba(64,158,255,0.08);
}
.seller-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin: 20px 0; padding: 0 18px; }
@media (max-width:768px) {
  .seller-stats-grid{
    position: relative;
    left: -19px;
    z-index: 9;
  transform: translateY(69px);
  }
  
}

.stat-card { background: rgba(255,255,255,0.8); border-radius: 12px; padding: 16px; text-align: center; }
.stat-value { font-size: 24px; font-weight: 700; color: #165DFF; margin-bottom: 4px; }
.stat-label { font-size: 14px; color: #666; }
.quick-actions { display: flex; justify-content: space-around; margin-top: 24px; padding: 0 18px; }
@media (max-width:768px) {
  .quick-actions {
    position: relative;
    left: -16px;
    z-index: 9;
  transform: translateY(29px);
  }
  
}
.action-card {
  display: flex; flex-direction: column; align-items: center; padding: 16px 24px;
  background: rgba(22,93,255,0.05); border-radius: 12px; cursor: pointer;
}
.action-card:hover { background: rgba(22,93,255,0.1); transform: translateY(-2px); }
.action-icon { font-size: 24px; color: #165DFF; margin-bottom: 8px; }
:deep(.el-tag) { border-radius: 999px; padding: 0 14px; font-weight: 700; }
.avatar-wrapper { position: relative; cursor: pointer; }
.avatar-upload-btn {
  position: absolute; right: -5px; bottom: -5px; width: 20px; height: 20px;
  background: #409eff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 14px;
}
.avatar-uploader { display: flex; justify-content: center; }
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9; border-radius: 50%; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.upload-icon { font-size: 32px; color: #c0c4cc; }
</style>