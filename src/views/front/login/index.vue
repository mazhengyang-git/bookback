<template>
  <div class="beij">
    <div class="home-top-navwy">
      <div>
        <h2 style="margin-top: 0px;" class="sci-fi-title">星途科幻图书</h2>
      
      </div>
    </div>
    <div class="login-page">
      <div class="box">
        <el-button class="gwy" type="primary" @click="$router.push('/home')">返回首页</el-button>
        <h2 class="sci-fi-title" style="margin-left: 3px; position: relative; bottom: 5px">
          星途科幻 - 登录
        </h2>

        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane @click="" label="密码登录" name="password" />
          <el-tab-pane @click="" label="验证码登录" name="code" />
        </el-tabs>

        <el-form
          :rules="rules"
          style="margin-left: -20px"
          :model="form"
          ref="formRef"
          label-width="80px"
        >
          <el-form-item   style="font-weight: 700" label="账号" prop="username">
            <el-input
              maxlength="13"
              :placeholder="loginType==='password'?'请输入用户名':'请输入手机号'"
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

          <!-- 图片验证码并行验证 -->
          <el-form-item label="验证" prop="captcha">
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



const form = ref({
  username: '',
  password: '',
  code: '',
  captcha: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin',
})

const formRef = ref<FormInstance>()

// 图片验证码
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
generateCaptcha()

//图片验证码必填 
const rules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名/手机号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入图片验证码', trigger: 'blur' },
    {//@ts-ignore
      validator: (rule: any, value: string, callback: any) => {
        if (value?.toUpperCase() === captchaCode.value) callback()
        else callback(new Error('图片验证码错误'))
      },
    },
  ],
})

// 发送短信验证码 
const handleSendCode = async () => {
  const phone = form.value.username
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error('请输入正确的11位手机号！')
    return
  }

  try {
    const res = await sendSmsCode({ phone })//@ts-ignore
    if (res.code === 200) {
      ElMessage.success('短信已发送：' + res.data.code)
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {//@ts-ignore
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败')
  }
}

// 登录校验 
const submitLogin = async () => {
  if (!formRef.value) return ElMessage.error('表单异常')

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('请完善信息')
    return
  }

  if (loginType.value === 'password') {
    try {
      const res = await login(form.value)//@ts-ignore
      if (res.code === 200) {//@ts-ignore
        userStore.login({ token: res.data.token, user: { ...res.data.user, role: form.value.role } })
        ElMessage.success({message:'登录成功',offset:80})
        switch (form.value.role) {
          case 'admin': router.replace('/admin'); break
          case 'seller': router.replace('/seller'); break
          default: router.replace('/home')
        }
      } else {//@ts-ignore
        ElMessage.error({message:res.msg || '登录失败',offset:80})
        refreshCaptcha()
      }
    } catch (err) {
      ElMessage.error('服务器异常')
      refreshCaptcha()
    }
  } else {
    try {
      const res = await loginByCode({
        phone: form.value.username,
        code: form.value.code,
        role: form.value.role,
      })//@ts-ignore
      if (res.code === 200) {//@ts-ignore
        userStore.login({ token: res.data.token, user: { ...res.data.user, role: form.value.role } })
        ElMessage.success({message:'登录成功',offset:80})
        switch (form.value.role) {
          case 'admin': router.replace('/admin'); break
          case 'seller': router.replace('/seller'); break
          default: router.replace('/home')
        }
      } else {//@ts-ignore
        ElMessage.error({message:res.msg || '登录失败',offset:80})
        refreshCaptcha()
      }
    } catch (err) {
      ElMessage.error('服务器异常')
      refreshCaptcha()
    }
  }
}

onUnmounted(() => clearInterval(timer))
</script>



<style scoped>
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
  position: relative;
  top: 30px;
  
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

.code-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
.login-tabs {
  margin-bottom: 20px;
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

.btn-group {
  display: flex;
  gap: 15px;
  margin-left: 110px;
  margin-top: 10px;
}
</style>