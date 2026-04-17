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
          <el-form-item label-width="85" style="font-weight: 700" label="用户名" prop="username">
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
          <el-form-item label-width="85" style="font-weight: 700" label="用户类型">
            <el-radio-group v-model="registerForm.role" @change="handleRoleChange">
              <el-radio style="font-weight: 700" value="buyer">买家</el-radio>
              <el-radio style="font-weight: 700" value="seller">卖家</el-radio>
              <el-radio style="font-weight: 700" value="admin">管理员</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 管理员密钥验证（仅管理员显示） -->
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

// 表单数据（适配后端role字段：buyer/seller/admin）
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
  adminKey: '',
})

// 管理员注册密钥
const ADMIN_REGISTER_KEY = 'admin123456'

// ===================== 核心：用户名校验规则 =====================
//合法手机号前3位（真实号段）
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

// 校验：账号规则（1字母+5数字）
const isValidAccount = (str: string): boolean => {
  // 统计字母数量
  const letterMatch = str.match(/[a-zA-Z]/g)
  const letterCount = letterMatch ? letterMatch.length : 0
  // 统计数字数量
  const digitMatch = str.match(/\d/g)
  const digitCount = digitMatch ? digitMatch.length : 0

  // 仅允许字母+数字
  const onlyLetterAndDigit = /^[a-zA-Z0-9]+$/.test(str)

  // 核心规则：字母 1~2 个 + 数字 ≥5 个 + 纯字母数字
  const validLetter = letterCount >= 1 && letterCount <= 2
  const validDigit = digitCount >= 5

  return validLetter && validDigit && onlyLetterAndDigit
}
// 校验：正规11位手机号
const isValidPhone = (phone: string): boolean => {
  if (!/^\d{11}$/.test(phone)) return false
  const prefix = phone.slice(0, 3)
  return validMobilePrefixes.includes(prefix)
}

// 表单校验规则
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名/手机号', trigger: 'blur' },
    { min: 6, max: 13, message: '长度6-13位', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) return callback()
        // 满足任意一种格式即可
        if (isValidAccount(value) || isValidPhone(value)) {
          callback()
        } else {
          callback(new Error('格式：1字母+5位数字 或 11位正规手机号'))
        }
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
      validator: (_rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('请确认密码'))
        } else if (value !== registerForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  adminKey: [
    {
      required: true,
      message: '请输入管理员注册密钥',
      trigger: 'blur',
      validator: (_rule: any, value: string, callback: any) => {
        if (registerForm.role === 'admin') {
          if (!value) {
            callback(new Error('请输入管理员注册密钥'))
          } else if (value !== ADMIN_REGISTER_KEY) {
            callback(new Error('管理员密钥错误'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
    },
  ],
})

// 角色切换清空密钥
const handleRoleChange = () => {
  if (registerForm.role !== 'admin') {
    registerForm.adminKey = ''
  }
}

// 注册逻辑
const handleRegister = async () => {
  if (!registerFormRef.value) {
    ElMessage.error('表单初始化失败，请刷新页面')
    return
  }

  let valid = false
  try {
    await registerFormRef.value.validate()
    valid = true
  } catch (err) {
    ElMessage.warning('请完善注册信息')
    return
  }

  if (!valid) return

  // 管理员密钥校验
  if (registerForm.role === 'admin' && registerForm.adminKey !== ADMIN_REGISTER_KEY) {
    ElMessage.error('管理员密钥错误，无法注册')
    return
  }

  try {
    // 调用后端注册接口，传递role字段
    const res = await register({
      username: registerForm.username,
      password: registerForm.password,
      role: registerForm.role,
    })
    if (!res) {
      ElMessage.error('注册失败：接口无返回数据')
      return
    }
    //@ts-ignore
    if (res.code === 200) {
      //@ts-ignore
      ElMessage.success(res.msg || '注册成功')
      router.push('/login')
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (err) {
    console.error('注册接口异常：', err)
    ElMessage.error('注册失败：服务异常，请稍后重试')
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
  background-color: #ffffff !important;
  background-size: cover;
  background-position: center; /* 向上偏移 */
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.gwy {
  position: absolute;
  margin-top: -20.7px;
  margin-left: -20.5px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
.register-container {
  width: 100%;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
}
.register-box {
  width: 440px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgb(0, 0, 0);
}
.register-form {
  margin-top: 20px;
}
.register-btn {
  width: 100%;
}
</style>
