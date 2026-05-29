<template>
  <div class="page-container">
    <h2 class="sci-fi-title">个人中心</h2>

    <div v-if="userStore.isLogin">
      <el-card class="user-info-card" shadow="hover" :unstable-disable-deprecated-warning="true">
        <template #header>
          <span class="card-title">用户信息</span>
        </template>
        
        <!-- 头像区域 -->
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <div class="avatar-wrapper" style="position: relative; margin-right: 20px">
            <el-avatar :src="currentAvatar" size="80" />
            <div class="avatar-upload-btn" @click="openAvatarDialog">
              <el-icon><Plus /></el-icon>
            </div>
          </div>
          <div>
            <h2 style="margin: 0">{{ userStore.user?.username || '未知用户' }}</h2>
          </div>
        </div>

        <div class="user-info-content">
          <!-- 手机号绑定 -->
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
                userStore.userRole === 'admin' ? '管理员' :
                userStore.userRole === 'seller' ? '卖家' : '买家'
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
          >修改账密</el-button>
          <el-button
            type="primary"
            size="small"
             style="margin-right: 30px; padding-left: 10px; padding-right: 10px"
            @click="handleEditPhone"
          >修改绑定手机号</el-button>
          <el-button
            style="padding-left: 10px; padding-right: 10px; margin-left:30px"
            type="danger"
            @click="handleLogout"
          >退出登录</el-button>
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
          <el-avatar v-if="previewAvatar" :src="previewAvatar" size="120" />
          <el-icon v-else class="upload-icon"><Plus /></el-icon>
        </el-upload>
        <div style="margin-top: 15px; text-align: center; color: #909399; font-size: 13px;">
          支持 jpg/png/webp 格式，大小不超过 2MB
        </div>
      </el-dialog>

      <!-- ===================== 修改账密弹窗 ===================== -->
      <el-dialog
        v-model="showEditDialog"
        title="修改用户名/密码"
        width="550px"
        :close-on-click-modal="false"
      >
        <div v-if="!isPassEdit" class="verify-section">
          <h3 style="margin-bottom:15px;">身份验证</h3>
          <el-radio-group v-model="verifyTypeEdit" style="margin-bottom:15px;">
            <el-radio label="当前密码验证" value="password" />
            <el-radio label="原绑定手机号验证" value="phone" />
          </el-radio-group>

          <el-form-item v-if="verifyTypeEdit === 'password'" label="当前密码">
            <el-input
              v-model="editPwdVerifyForm.oldPwd"
              type="password"
              show-password
              placeholder="请输入当前登录密码"
            />
          </el-form-item>

          <template v-else>
            <el-form-item label="绑定手机号">
              <el-input v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
            </el-form-item>
            <el-form-item style="margin-top: 10px;margin-bottom: 10px;" label="短信验证码">
              <div class="code-box">
                <el-input v-model="editPwdVerifyForm.smsCode" placeholder="6位验证码" maxlength="6" />
                <el-button type="primary" @click="sendEditPwdSms" :disabled="smsCountdownEdit > 0">
                  {{ smsCountdownEdit > 0 ? `${smsCountdownEdit}秒后重发` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <!-- 默认显示 图片验证码 并行验证 -->
          <el-form-item label="安全验证" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="editPwdVerifyForm.captcha"
                placeholder="请输入图片验证码"
                maxlength="4"
                style="flex:1"
              />
              <div class="captcha-img" @click="refreshCaptchaEdit">{{ captchaCodeEdit }}</div>
            </div>
          </el-form-item>

          <el-button type="success" style="margin-top:10px" @click="checkIdentityEdit">✅ 验证身份</el-button>
          <span v-if="isPassEdit" style="color:#67c230;margin-left:12px">身份验证已通过</span>
        </div>

        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="100px"
          v-if="isPassEdit"
        >
          <el-form-item label="用户名/账号" prop="username">
            <el-input
              v-model="editForm.username"
              maxlength="13"
              placeholder="不修改请保持原样"
              clearable
            />
          </el-form-item>
          <el-form-item label="新密码" prop="password">
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
          <el-button @click="closeEditDialog">取消</el-button>
          <el-button type="primary" @click="submitEdit" :disabled="!isPassEdit">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- ===================== 修改手机号弹窗 ===================== -->
      <el-dialog
        v-model="showEditPhoneDialog"
        title="修改绑定手机号"
        width="550px"
        :close-on-click-modal="false"
        @close="resetPhoneDialog"
      >
        <div v-if="!isPass" class="verify-section">
          <h3 style="margin-bottom:15px;">身份验证</h3>
          <el-radio-group v-model="verifyType" style="margin-bottom:15px;">
            <el-radio label="原绑定手机号验证" value="phone" />
            <el-radio label="当前账号密码验证" value="password" />
          </el-radio-group>

          <template v-if="verifyType === 'phone'">
            <el-form-item label="原绑定手机号">
              <el-input v-model="originalPhone" disabled placeholder="当前账号已绑定手机号" />
            </el-form-item>
            <el-form-item style="margin-top: 10px;margin-bottom: 10px;" label="原手机验证码">
              <div class="code-box">
                <el-input v-model="editPhoneForm.oldSmsCode" placeholder="6位验证码" maxlength="6" />
                <el-button type="primary" @click="sendOldPhoneSms" :disabled="smsCountdown > 0">
                  {{ smsCountdown > 0 ? `${smsCountdown}秒后重发` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <el-form-item v-else label="当前账号密码">
            <el-input
              v-model="editPhoneForm.oldPwd"
              type="password"
              placeholder="输入登录密码"
              show-password
            />
          </el-form-item>

          <!-- 默认显示 图片验证码 并行验证 -->
          <el-form-item label="安全验证" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="editPhoneForm.captcha"
                placeholder="请输入图片验证码"
                maxlength="4"
                style="flex:1"
              />
              <div class="captcha-img" @click="refreshCaptcha">{{ captchaCode }}</div>
            </div>
          </el-form-item>

          <el-button type="success" style="margin-top:10px" @click="checkIdentity">✅ 验证身份</el-button>
          <span v-if="isPass" style="color:#67c230;margin-left:12px">身份验证已通过</span>
        </div>

        <el-form
          ref="editPhoneFormRef"
          :model="editPhoneForm"
          label-width="110px"
          :rules="editPhoneRules"
          v-if="isPass"
        >
          <el-form-item label="新手机号" prop="newPhone">
            <el-input
              v-model="editPhoneForm.newPhone"
              placeholder="请输入新手机号"
              maxlength="11"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showEditPhoneDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditPhone" :disabled="!isPass">确认修改</el-button>
        </template>
      </el-dialog>
    </div>

    <div v-else class="no-login-tip">
      <h3>请先登录</h3>
      <el-button type="primary" @click="$router.push('/login')">立即登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { bindPhone, sendSmsCode, verifyPaySmsCode, updateUserInfoApi, uploadAvatar } from '@/api/front/user'
import dayjs from 'dayjs'

const userStore = useUserStore()
const router = useRouter()
const phone = ref('')

// ---------------------- 头像功能 ----------------------
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
  const isImg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
  if (!isImg) { ElMessage.error('仅支持 JPG/PNG/webp'); return false }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) { ElMessage.error('大小不能超过 2MB'); return false }
  return true
}

const customUpload = async (options: any) => {
  try {
    const res = await uploadAvatar(options.file)
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      if (userStore.user) userStore.user.avatar = res.data.url
      showAvatarDialog.value = false
    } else ElMessage.error('上传失败')
  } catch (e) { ElMessage.error('上传失败') }
}

// ---------------------- 手机号绑定 ----------------------
const handleBind = async () => {
  if (!phone.value) return ElMessage.error('请输入手机号')
  const res = await bindPhone(phone.value)
  if (res.code === 200) {
    ElMessage.success('绑定成功')
    userStore.user.phone = phone.value
    phone.value = ''
  } else ElMessage.error(res.msg)
}

// ---------------------- 工具函数 ----------------------
const validMobilePrefixes = [
  '130','131','132','133','134','135','136','137','138','139',
  '150','151','152','153','155','156','157','158','159','166',
  '172','173','175','176','177','178','180','181','182','183',
  '184','185','186','187','188','189','190','191','192','193','195','196','197','198','199'
]
const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  return validMobilePrefixes.includes(phone.slice(0,3))
}
const isValidAccount = (str: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(str)
  const digitMatch = str.match(/\d/g)
  const hasEnoughDigits = digitMatch && digitMatch.length >=5
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str)
  return hasLetter && hasEnoughDigits && onlyLetterAndDigit
}
const formatTime = (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '暂无'
const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'

// ---------------------- 修改手机号弹窗 ----------------------
const showEditPhoneDialog = ref(false)
const verifyType = ref<'phone'|'password'>('phone')
const originalPhone = ref('')
const smsCountdown = ref(0)
let smsTimer: any = null
const captchaCode = ref('')

const editPhoneForm = ref({ oldSmsCode:'', oldPwd:'', newPhone:'', captcha:'' })
const editPhoneFormRef = ref<FormInstance>()
const isPass = ref(false)

// 图片验证码默认显示 + 表单必填校验
const editPhoneRules = reactive<FormRules>({
  oldPwd: [{ required:true, message:'请输入密码', trigger:'blur' }, { min:6, max:13 }],
  oldSmsCode: [{ required:true, message:'请输入验证码' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    { validator:(r,v,c) => v?.toUpperCase()===captchaCode.value ? c() : c(new Error('验证码错误')) }
  ],
  newPhone: [
    { required:true, message:'请输入新手机号' },
    { validator:(r,v,c) => {
      if (!isValidPhone(v)) return c(new Error('手机号格式错误'))
      if (v===originalPhone.value) return c(new Error('不能与原手机号一致'))
      c()
    }}
  ]
})

const handleEditPhone = () => {
  originalPhone.value = userStore.user?.phone || ''
  resetPhoneDialog()
  showEditPhoneDialog.value = true
}
const resetPhoneDialog = () => {
  editPhoneForm.value = { oldSmsCode:'', oldPwd:'', newPhone:'', captcha:'' }
  isPass.value = false
  smsCountdown.value = 0
  clearInterval(smsTimer)
  editPhoneFormRef.value?.clearValidate()
}
const generateCaptcha = () => {
  let code = ''
  for(let i=0;i<4;i++) code += chars[Math.floor(Math.random()*chars.length)]
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()

const sendOldPhoneSms = async () => {
  if (!originalPhone.value || !isValidPhone(originalPhone.value)) return ElMessage.error('手机号异常')
  
  try {
    const res = await sendSmsCode({ phone:originalPhone.value })
    if (res.code===200) {
      ElMessage.success('验证码已发送：'+res.data.code)
      smsCountdown.value = 60
      smsTimer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value<=0) clearInterval(smsTimer)
      },1000)
      editPhoneForm.value.captcha = ''
      refreshCaptcha()
    }
  } catch(e) {}
}

const checkIdentity = async () => {
  // 先校验图片验证码
  if (editPhoneForm.value.captcha?.toUpperCase() !== captchaCode.value) {
    ElMessage.error('图片验证码错误')
    refreshCaptcha()
    return
  }

  if (verifyType.value==='phone') {
    const res = await verifyPaySmsCode({ phone:originalPhone.value, code:editPhoneForm.value.oldSmsCode })
    if (res.code===200) { isPass.value = true; ElMessage.success('验证成功') }
    else ElMessage.error('验证码错误')
  } else {
    const p = editPhoneForm.value.oldPwd
    if (p.length>=6 && p.length<=13) { isPass.value = true; ElMessage.success('验证成功') }
    else ElMessage.error('密码格式错误')
  }
}

const confirmEditPhone = async () => {
  if (!editPhoneFormRef.value || !isPass.value) return
  await editPhoneFormRef.value.validate()
  const res = await bindPhone(editPhoneForm.value.newPhone)
  if (res.code===200) {
    ElMessage.success('修改成功')
    userStore.user.phone = editPhoneForm.value.newPhone
    showEditPhoneDialog.value = false
    resetPhoneDialog()
  } else ElMessage.error('修改失败')
}

// ---------------------- 修改账密弹窗 ----------------------
const showEditDialog = ref(false)
const isPassEdit = ref(false)
const verifyTypeEdit = ref<'password'|'phone'>('password')
const editFormRef = ref<FormInstance>()

const editPwdVerifyForm = ref({ oldPwd:'', smsCode:'', captcha:'' })
const captchaCodeEdit = ref('')
const smsCountdownEdit = ref(0)
let smsTimerEdit: any = null

const editForm = ref({ username:userStore.user?.username||'', password:'', confirmPwd:'' })
const originalUsername = ref(userStore.user?.username||'')

// 图片验证码默认显示 + 表单必填校验
const editRules = reactive<FormRules>({
  username: [
    { min:6, max:13 },
    { validator:(r,v,c) => {
      if (v===originalUsername.value && !editForm.value.password) return c(new Error('未做任何修改'))
      if (isValidAccount(v) || isValidPhone(v)) c()
      else c(new Error('格式：字母+数字 或 11位手机号'))
    }}
  ],
  password: [{ min:6, max:13 }],
  confirmPwd: [{ validator:(r,p,c) => editForm.value.password && p!==editForm.value.password ? c(new Error('两次密码不一致')) : c() }]
})

// 独立给验证区域加规则
const editPwdVerifyRules = reactive<FormRules>({
  oldPwd: [{ required: true, message: '请输入当前密码', trigger: 'blur' }, { min:6, max:13 }],
  smsCode: [{ required: true, message: '请输入短信验证码' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    { validator:(r,v,c) => v?.toUpperCase()===captchaCodeEdit.value ? c() : c(new Error('验证码错误')) }
  ]
})

const openEditDialog = () => {
  editForm.value.username = userStore.user?.username||''
  editForm.value.password = ''
  editForm.value.confirmPwd = ''
  isPassEdit.value = false
  resetEditPwdVerify()
  showEditDialog.value = true
}
const closeEditDialog = () => { showEditDialog.value = false; resetEditPwdVerify() }
const resetEditPwdVerify = () => {
  isPassEdit.value = false
  smsCountdownEdit.value = 0
  editPwdVerifyForm.value = { oldPwd:'', smsCode:'', captcha:'' }
  clearInterval(smsTimerEdit)
}

const generateCaptchaEdit = () => {
  let code = ''
  for(let i=0;i<4;i++) code += chars[Math.floor(Math.random()*chars.length)]
  captchaCodeEdit.value = code
}
const refreshCaptchaEdit = () => generateCaptchaEdit()

const sendEditPwdSms = async () => {
  if (!originalPhone.value || !isValidPhone(originalPhone.value)) return ElMessage.error('手机号异常')
  
  try {
    const res = await sendSmsCode({ phone:originalPhone.value })
    if (res.code===200) {
      ElMessage.success('验证码已发送：'+res.data.code)
      smsCountdownEdit.value = 60
      smsTimerEdit = setInterval(() => {
        smsCountdownEdit.value--
        if (smsCountdownEdit.value<=0) clearInterval(smsTimerEdit)
      },1000)
      editPwdVerifyForm.value.captcha = ''
      refreshCaptchaEdit()
    }
  } catch(e) {}
}

const checkIdentityEdit = () => {
  // 先校验图片验证码
  if (editPwdVerifyForm.value.captcha?.toUpperCase() !== captchaCodeEdit.value) {
    ElMessage.error('图片验证码错误')
    refreshCaptchaEdit()
    return
  }

  if (verifyTypeEdit.value==='password') {
    const p = editPwdVerifyForm.value.oldPwd
    if (p.length>=6 && p.length<=13) { isPassEdit.value = true; ElMessage.success('验证成功') }
    else ElMessage.error('密码格式错误')
  } else {
    verifyPaySmsCode({ phone:originalPhone.value, code:editPwdVerifyForm.smsCode }).then(res => {
      if (res.code===200) { isPassEdit.value = true; ElMessage.success('验证成功') }
      else ElMessage.error('验证码错误')
    })
  }
}

const submitEdit = async () => {
  if (!editFormRef.value || !isPassEdit.value) return
  await editFormRef.value.validate()
  const params = {
    username: editForm.value.username,
    password: editForm.value.password || undefined,
    originalUsername: originalUsername.value
  }
  const res = await updateUserInfoApi(params)
  if (res.code===200) {
    ElMessage.success('修改成功，请重新登录')
    userStore.logout()
    router.push('/login')
    showEditDialog.value = false
  } else ElMessage.error(res.msg || '修改失败')
}

// ---------------------- 退出登录 ----------------------
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

onUnmounted(() => { clearInterval(smsTimer); clearInterval(smsTimerEdit) })
onMounted(() => { 
  originalPhone.value = userStore.user?.phone || '' 
  generateCaptcha()
  generateCaptchaEdit()
})
</script>
<style scoped>
.page-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.sci-fi-title {
  text-align: center;
  margin: 20px 0;
}
.user-info-card {
  margin-top: 20px;
}
.avatar-upload-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24px;
  height: 24px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  width: 100px;
  height: 38px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  letter-spacing: 2px;
  font-weight: bold;
}
.code-box {
  display: flex;
  gap: 10px;
}
.no-login-tip {
  text-align: center;
  margin-top: 50px;
}
</style>
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

/* 头像样式 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
}
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
</style>