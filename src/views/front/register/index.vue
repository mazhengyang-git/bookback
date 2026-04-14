<template>
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
        <el-form-item label="用户名" prop="username">
          <el-input
            maxlength="13"
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="至少6位"
            maxlength="13"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            maxlength="13"
            show-password
          />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-radio-group v-model="registerForm.role" @change="handleRoleChange">
            <el-radio value="buyer">买家</el-radio>
            <el-radio value="seller">卖家</el-radio>
            <el-radio value="admin">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 管理员密钥验证（仅管理员显示） -->
        <el-form-item label="管理密钥" prop="adminKey" v-if="registerForm.role === 'admin'">
          <el-input
            v-model="registerForm.adminKey"
            type="password"
            placeholder="请输入管理员注册密钥"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
          <el-button style="margin-top: 10px" @click="$router.push('/login')" link
            >返回登录</el-button
          >
        </el-form-item>
      </el-form>
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

// 管理员注册密钥（可自行修改，建议配置到.env文件）
const ADMIN_REGISTER_KEY = 'admin123456'

// 表单校验规则
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 13, message: '用户名长度6-13位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名仅支持字母、数字、下划线', trigger: 'blur' },
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

// 注册逻辑（适配后端接口）
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
    } //@ts-ignore
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
//管理员账号注册时的key:admin123456
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
.gwy {
  position: absolute;
  margin-top: -30px;
  margin-left: -30px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
.register-container {
  width: 100%;
  height: 100vh;
  background-color: #0a0e17;
  display: flex;
  justify-content: center;
  align-items: center;
}
.register-box {
  width: 400px;
  padding: 30px;
  background-color: rgba(18, 26, 40, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.2);
}
.register-form {
  margin-top: 20px;
}
.register-btn {
  width: 100%;
}
</style>
