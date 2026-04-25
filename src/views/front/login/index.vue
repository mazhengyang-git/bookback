<template>
  <div class="beij">
    <div class="home-top-navwy">
      <div>
        <h2 class="sci-fi-title">星途科幻图书</h2>
        <h3 class="sci-fi-title" style="color: #000; font-size: 20px">
          管理员热线: 15934213121(如您需要重置密码)
        </h3>
      </div>
    </div>
    <div class="login-page">
      <div class="box">
        <el-button class="gwy" type="primary" @click="$router.push('/home')">返回首页</el-button>
        <h2 class="sci-fi-title" style="margin-left: 3px; position: relative; bottom: 5px">
          星途科幻 - 登录
        </h2>

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
          <el-form-item style="font-weight: 700" label="账号" prop="username">
            <el-input
              maxlength="13"
              placeholder="请输入用户名/手机号"
              v-model="form.username"
              @keyup.enter="submitLogin"
              show-word-limit
            />
          </el-form-item>

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

          <el-form-item v-else style="font-weight: 700" label="验证码" prop="code">
            <div class="code-box">
              <el-input v-model="form.code" placeholder="请输入短信验证码" maxlength="6" />
              <el-button type="primary" @click="handleSendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <!-- ================== 图片验证码 共用区域 ================== -->
          <el-form-item v-if="showCaptcha" style="font-weight: 700" label="核验" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="form.captcha"
                placeholder="请输入图片验证码"
                maxlength="4"
                style="flex: 1"
              />
              <div style="color: #000" class="captcha-img" @click="refreshCaptcha">
                {{ captchaCode }}
              </div>
            </div>
          </el-form-item>

          <el-form-item style="font-weight: 700" label="角色">
            <el-radio-group v-model="form.role">
              <el-radio style="font-weight: 700" value="buyer">买家</el-radio>
              <el-radio style="font-weight: 700" value="seller">卖家</el-radio>
              <el-radio style="font-weight: 700" value="admin">管理员</el-radio>
            </el-radio-group>
          </el-form-item>

          <div class="btn-group">
            <el-button type="primary" @click="submitLogin">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </div>
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

const loginType = ref('password')
const countdown = ref(0)
let timer: any = null

// 图片验证码显示控制
const showCaptcha = ref(false)

const form = ref({
  username: '',
  password: '',
  code: '',
  captcha: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
})

const formRef = ref<FormInstance>()

// ================== 图片验证码生成逻辑 ==================
const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'
const captchaCode = ref('')

const generateCaptcha = () => {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  captchaCode.value = code
}
const refreshCaptcha = () => generateCaptcha()

// ================== 表单校验规则 ==================
const rules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名/手机号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  // 图片验证码不做全局必填校验，我们手动分场景控制
  captcha: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value?.toUpperCase() === captchaCode.value) {
          callback()
        } else {
          callback(new Error('图片验证码错误'))
        }
      },
    },
  ],
})

// ============== 发送短信验证码（原有逻辑100%完全保留） ==============
const handleSendCode = async () => {
  const phone = form.value.username
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('请输入正确的11位手机号！')
    return
  }

  // 第一次点击：显示图片验证码
  if (!showCaptcha.value) {
    showCaptcha.value = true
    generateCaptcha()
    ElMessage.info('请完成图片验证')
    return
  }

  // 第二次点击：校验图片验证码
  if (form.value.captcha?.toUpperCase() !== captchaCode.value) {
    ElMessage.error('图片验证码错误')
    refreshCaptcha()
    return
  }

  // 校验通过 → 发送短信
  try {
    const res = await sendSmsCode({ phone })
    if (res.code === 200) {
      ElMessage.success('短信已发送：' + res.data.code)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
      // 发送成功 → 隐藏图片验证码、清空字段！后续登录不再二次校验
      showCaptcha.value = false
      form.value.captcha = ''
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('发送失败')
  }
  refreshCaptcha()
}

// ============== 登录提交函数【核心改造：分登录方式区分校验逻辑】 ==============
const submitLogin = async () => {
  if (!formRef.value) return ElMessage.error('表单异常')

  // ========== 分支1：密码登录（完整保留图片验证码前置校验） ==========
  if (loginType.value === 'password') {
    // 先校验账号、密码基础表单
    try {
      await formRef.value.validate((prop) => prop !== 'captcha')
    } catch {
      ElMessage.warning('请完善账号、密码信息')
      return
    }

    // 密码登录专属：必须走图片验证码分步校验
    if (!showCaptcha.value) {
      showCaptcha.value = true
      generateCaptcha()
      ElMessage.info('请完成图片安全核验')
      return
    }
    // 校验图片验证码
    if (form.value.captcha?.toUpperCase() !== captchaCode.value) {
      ElMessage.error('图片验证码错误，请重新输入')
      refreshCaptcha()
      return
    }

    // 校验全部通过，执行密码登录
    try {
      const res = await login(form.value)
      if (res.code === 200) {
        // 登录成功清空重置
        showCaptcha.value = false
        form.value.captcha = ''
        userStore.login({
          token: res.data.token,
          user: { ...res.data.user, role: form.value.role },
        })
        ElMessage.success('登录成功')
        // 路由跳转
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
      ElMessage.error('服务器异常，请稍后重试')
    }
  }
  // ========== 分支2：验证码登录【核心修复：不再二次校验图片验证码！】 ==========
  else {
    // 只校验账号、短信验证码基础字段
    try {
      await formRef.value.validate((prop) => prop !== 'captcha')
    } catch {
      ElMessage.warning('请完善账号、短信验证码信息')
      return
    }

    // 【重点】短信登录：发送验证码阶段已经校验过图片验证码了，登录环节不再校验！
    try {
      const res = await loginByCode({
        phone: form.value.username,
        code: form.value.code,
        role: form.value.role,
      })
      if (res.code === 200) {
        userStore.login({
          token: res.data.token,
          user: { ...res.data.user, role: form.value.role },
        })
        ElMessage.success('登录成功')
        // 路由跳转
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
      ElMessage.error('服务器异常，请稍后重试')
    }
  }
}

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* 你原有页面的所有css样式完全保留，这里自动继承，无需改动 */
.code-box {
  display: flex;
  gap: 10px;
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  width: 120px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
}
.beij {
  width: 100%;
  height: 100vh;
}
.home-top-navwy {
  padding: 20px 50px;
}
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
}
.box {
  width: 450px;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.gwy {
  margin-bottom: 20px;
}
.btn-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}
</style>

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
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgb(0, 0, 0);
}

/* 短信验证码框布局 */
.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
.login-tabs {
  margin-bottom: 20px;
}

/* 图片验证码样式 完美适配页面 */
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
  background: #f0f2f5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none !important;
  transition: all 0.2s;
}
.captcha-img:hover {
  background: #e9edf2;
}

/* 按钮布局修复，解决原来错位问题 */
.btn-group {
  display: flex;
  gap: 15px;
  margin-left: 110px;
  margin-top: 10px;
}
</style>
