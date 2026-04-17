<template>
  <div class="beij">
    <div class="home-top-navwy">
      <div>
        <h2 class="sci-fi-title">星途科幻图书</h2>
      </div>
    </div>
    <div class="login-page">
      <div class="box">
        <el-button class="gwy" type="primary" @click="$router.push('/home')">返回首页</el-button>
        <h2 class="sci-fi-title" style="margin-left: 3px; position: relative; bottom: 5px">
          星途科幻 - 登录
        </h2>

        <!-- 新增：登录方式切换 -->
        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane label="密码登录" name="password" />
          <el-tab-pane label="验证码登录" name="code" />
        </el-tabs>

        <el-form
          :rules="rules"
          style="margin-left: -20px"
          :model="form"
          ref="formRef"
          label-width="80px"
        >
          <el-form-item style="font-weight: 700" label="用户名/手机号" prop="username">
            <el-input
              maxlength="13"
              placeholder="请输入用户名/手机号"
              v-model="form.username"
              @keyup.enter="submitLogin"
              show-word-limit
            />
          </el-form-item>

          <!-- 密码登录：密码框 -->
          <el-form-item
            v-if="loginType === 'password'"
            style="font-weight: 700"
            label="密码"
            prop="password"
          >
            <el-input
              maxlength="13"
              placeholder="请输入密码"
              v-model="form.password"
              type="password"
              @keyup.enter="submitLogin"
              show-password
            />
          </el-form-item>

          <!-- 验证码登录：验证码框 + 发送按钮 -->
          <el-form-item v-else style="font-weight: 700" label="验证码" prop="code">
            <div class="code-box">
              <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" />
              <el-button type="primary" @click="handleSendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item style="font-weight: 700" label="角色">
            <el-radio-group v-model="form.role">
              <el-radio style="font-weight: 700" value="buyer">买家</el-radio>
              <el-radio style="font-weight: 700" value="seller">卖家</el-radio>
              <el-radio style="font-weight: 700" value="admin">管理员</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-button
            style="position: relative; margin-right: 0.5px; left: 117px; font-weight: 700"
            type="primary"
            @click="submitLogin"
            >登录</el-button
          >
          <el-button
            style="position: relative; margin-right: 0.5px; left: 128px; font-weight: 700"
            @click="$router.push('/register')"
            >注册</el-button
          >
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'

import { login, sendSmsCode, loginByCode } from '@/api/front/user'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 登录类型：password 密码登录 / code 验证码登录
const loginType = ref('password')
// 倒计时
const countdown = ref(0)
let timer: any = null

// 表单新增 code 字段
const form = ref({
  username: '',
  password: '',
  code: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
})

const formRef = ref<FormInstance>()

// 校验规则
const rules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名/手机号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
})

// ============== 1. 发送验证码 ==============
const handleSendCode = async () => {
  const phone = form.value.username
  // 校验手机号
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('请输入正确的手机号！')
    return
  }

  try {
    const res = await sendSmsCode({ phone })
    if (res.code === 200) {
      ElMessage.success('验证码已发送，验证码: ' + `${res.data.code}`)
      console.log('【前端控制台】验证码：', res.data.code)
      // 启动倒计时
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('发送失败')
  }
}

// ============== 2. 双模式登录 ==============
const submitLogin = async () => {
  if (!formRef.value) {
    ElMessage.error('表单初始化失败')
    return
  }

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善信息')
    return
  }

  try {
    let res: any
    // 密码登录
    if (loginType.value === 'password') {
      res = await login(form.value)
    } else {
      // 验证码登录
      res = await loginByCode({
        phone: form.value.username,
        code: form.value.code,
        role: form.value.role,
      })
    }

    if (res.code === 200) {
      userStore.login({
        token: res.data.token,
        user: { ...res.data.user, role: form.value.role },
      })
      ElMessage.success('登录成功')

      // 跳转逻辑
      switch (form.value.role) {
        case 'admin':
          router.replace('/admin')
          break
        case 'seller':
          router.replace('/seller')
          break
        default:
          router.replace('/home')
      }
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (err) {
    ElMessage.error('服务器异常')
    console.error(err)
  }
}

// 销毁定时器
onUnmounted(() => clearInterval(timer))
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
.beij {
  width: 100%;
  height: 100vh !important;
  background: url(/public/img/flzc.jpg);
  background-color: #ffffff !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gwy {
  position: absolute;
  font-weight: 700;
  margin-top: -30.5px;
  margin-left: -30px;
  z-index: 10;
  padding: 0 5px 0 5px;
}
.home-top-navwy {
  position: absolute;
  width: 100vw;
  height: 80px;
  background-color: rgb(224, 222, 221);
}
.box {
  width: 440px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgb(0, 0, 0);
}

/*验证码框布局 */
.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
.login-tabs {
  margin-bottom: 20px;
}
</style>
