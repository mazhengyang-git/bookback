<template>
  <div class="beij">
    <div class="home-top-navwy">
      <div>
        <h2 class="sci-fi-title">星途科幻图书</h2>
      </div>
    </div>
    <div class="register-container">
      <div class="register-box">
        <el-button class="gwy" type="primary" @click="$router.push('/home')">返回首页</el-button>
        <h2 class="sci-fi-title">星途科幻 - 注册</h2>
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="80px"
          class="register-form"
        >
          <el-form-item label-width="85" style="font-weight: 700" label="账号" prop="username">
            <el-input
              style="font-weight: 700"
              maxlength="13"
              v-model="registerForm.username"
              placeholder="请输入用户名/手机号"
              clearable
              show-word-limit
            />
          </el-form-item>

          <el-form-item style="font-weight: 700" label="密码" label-width="85" prop="password">
            <el-input
              label-width="85"
              style="font-weight: 700 !important"
              v-model="registerForm.password"
              type="password"
              placeholder="至少6位"
              maxlength="13"
              show-password
            />
          </el-form-item>

          <el-form-item
            label-width="85"
            style="font-weight: 700"
            label="确认密码"
            prop="confirmPassword"
          >
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              maxlength="13"
              show-password
            />
          </el-form-item>

          <!-- 图片验证码  -->
          <el-form-item label="验证" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="registerForm.captcha"
                placeholder="请输入图片验证码"
                maxlength="4"
                style="flex: 1"
              />
              <div style="color: #000" class="captcha-img" @click="refreshCaptcha">
                {{ captchaCode }}
              </div>
            </div>
          </el-form-item>

          <el-form-item label-width="85" style="font-weight: 700" label="用户类型">
            <el-radio-group v-model="registerForm.role" @change="handleRoleChange">
              <el-radio style="font-weight: 700" value="buyer">买家</el-radio>
              <el-radio style="font-weight: 700" value="seller">卖家</el-radio>
              <el-radio style="font-weight: 700" value="admin">管理员</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            style="font-weight: 700"
            label="管理密钥"
            label-width="85"
            prop="adminKey"
            v-if="registerForm.role === 'admin'"
          >
            <el-input
              v-model="registerForm.adminKey"
              type="password"
              placeholder="请输入管理员注册密钥"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              style="font-weight: 700"
              type="primary"
              @click="handleRegister"
              class="register-btn"
              >注册</el-button
            >
            <el-button
              style="margin-top: 10px; font-weight: 700"
              @click="$router.push('/login')"
              link
              >返回登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { register } from '@/api/front/user'

const router = useRouter()
const registerFormRef = ref<FormInstance>()

// captcha放入表单对象
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
  adminKey: '',
  captcha: '', // 图片验证码
})

const ADMIN_REGISTER_KEY = 'admin123456'

// 图片验证码 
const captchaCode = ref('')
const chars = '0123456789ABCDEFGHIJKLMNPQRSTWXYZ'

const generateCaptcha = () => {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()
generateCaptcha()

// 手机号/账号校验
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
  const letterMatch = str.match(/[a-zA-Z]/g)
  const letterCount = letterMatch ? letterMatch.length : 0
  const digitMatch = str.match(/\d/g)
  const digitCount = digitMatch ? digitMatch.length : 0
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str)
  return letterCount >= 1 && letterCount <= 2 && digitCount >= 5 && onlyLetterAndDigit
}
const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  const prefix = phone.slice(0, 3)
  return validMobilePrefixes.includes(prefix)
}

//验证码加入表单校验
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名/手机号', trigger: 'blur' },
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    { //@ts-ignore
      validator: (rule, value, cb) => {
        if (!value) return cb()
        if (isValidAccount(value) || isValidPhone(value)) cb()
        else cb(new Error('格式：1字母+5数字 或 11位手机号'))
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_, v, cb) =>
        v === registerForm.password ? cb() : cb(new Error('两次密码不一致')),
    },
  ],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    { //@ts-ignore
      validator: (rule, value, cb) => {
        if (value?.toUpperCase() === captchaCode.value) cb()
        else cb(new Error('图片验证码错误'))
      },
      trigger: 'blur',
    },
  ],
  adminKey: [{ required: true, message: '请输入管理员密钥', trigger: 'blur' }],
})

const handleRoleChange = () => {
  if (registerForm.role !== 'admin') registerForm.adminKey = ''
}

// 注册逻辑
const handleRegister = async () => {
  if (!registerFormRef.value) return ElMessage.error('表单异常')

  try {
    await registerFormRef.value.validate()
  } catch {
    ElMessage.warning('请完善信息')
    refreshCaptcha()
    return
  }

  if (registerForm.role === 'admin' && registerForm.adminKey !== ADMIN_REGISTER_KEY) {
    ElMessage.error('管理员密钥错误')
    refreshCaptcha()
    return
  }

  try {
    const res = await register({
      username: registerForm.username,
      password: registerForm.password,
      role: registerForm.role,
    }) //@ts-ignore
    if (res.code === 200) {
      ElMessage.success('注册成功')
      router.push('/login')
    } else { //@ts-ignore
      ElMessage.error(res.msg || '注册失败')
      refreshCaptcha()
    }
  } catch (e) {
    ElMessage.error('服务异常')
    refreshCaptcha()
  }
}
</script>

<style scoped>
* {
  user-select: none !important;
  -webkit-user-select: none !important;
}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
.home-top-navwy {
  position: absolute;
  width: 100vw;
  height: 80px;
  background-color: rgb(224, 222, 221);
}
.beij {
  width: 100%;
  height: 100vh !important;
  background: url(/public/img/flzc.jpg);
  background-color: #fff !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.gwy {
  position: absolute;
  margin-top: -20.7px;
  margin-left: -20.5px;
  z-index: 10;
  padding: 0 5px;
}
.register-container {
  width: 100%;
  height: 100vh;
  position: relative;
  top: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.register-box {
  width: 440px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #000;
}
.register-form {
  margin-top: 20px;
}
.register-btn {
  width: 100%;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  width: 100px;
  height: 38px;
  line-height: 38px;
  text-align: center;
  background: #f5f5f5;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none !important;
}
</style>
