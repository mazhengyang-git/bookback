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
        <el-form
          :rules="rules"
          style="margin-left: -20px"
          :model="form"
          ref="formRef"
          label-width="80px"
        >
          <el-form-item style="font-weight: 700" label="用户名" prop="username">
            <el-input
              maxlength="13"
              placeholder="请输入用户名/手机号"
              v-model="form.username"
              @keyup.enter="submitLogin"
              show-word-limit
            />
          </el-form-item>
          <el-form-item style="font-weight: 700" label="密码" prop="password">
            <el-input
              maxlength="13"
              placeholder="请输入密码"
              v-model="form.password"
              type="password"
              @keyup.enter="submitLogin"
              show-password
            />
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
import { ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { login } from '@/api/front/user'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 修复：明确角色类型，避免隐式类型转换
const form = ref({
  username: '',
  password: '',
  role: 'buyer' as 'buyer' | 'seller' | 'admin', // 显式指定角色类型
})

const formRef = ref<FormInstance>()

// 完善校验规则（类型更严谨）
const rules = ref<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 13, message: '用户名长度6-13位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名仅支持字母、数字、下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 13, message: '密码长度6-13位', trigger: 'blur' },
  ],
})

// 登录逻辑（适配管理员角色跳转+完善异常处理）
const submitLogin = async () => {
  // 第一步：校验表单实例
  if (!formRef.value) {
    ElMessage.error('表单初始化失败，请刷新页面')
    return
  }

  // 第二步：执行表单校验
  try {
    await formRef.value.validate()
  } catch (err) {
    ElMessage.warning('请完善登录信息')
    return
  }

  // 第三步：调用登录接口
  try {
    const res = await login(form.value)

    // 严格校验接口返回值
    if (!res || !res.data) {
      ElMessage.error('登录失败：接口返回数据异常')
      return
    } //@ts-ignore

    if (res.code === 200) {
      //@ts-ignore
      // 存储用户信息到Pinia（包含角色）
      userStore.login({
        //@ts-ignore
        token: res.data.token,
        user: {
          //@ts-ignore
          ...res.data.user,
          role: form.value.role, // 确保角色信息正确存储
        },
      })

      ElMessage.success('登录成功')

      // 按角色跳转对应页面
      switch (form.value.role) {
        case 'admin':
          router.replace('/admin') // 管理员跳后台首页
          break
        case 'seller':
          router.replace('/seller') // 卖家跳卖家中心
          break
        case 'buyer':
        default:
          router.replace('/home') // 买家跳首页
          break
      }
    } else {
      //@ts-ignore
      ElMessage.error(res.msg || '账号或密码错误')
    }
  } catch (err) {
    console.error('登录接口请求异常：', err)
    ElMessage.error('登录失败：服务器异常，请稍后重试')
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
</style>
