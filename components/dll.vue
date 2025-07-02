<template>
  <div
    class="n1 n2"
    style="background-color: rgb(171, 85, 35); width: 1523px; height: 60.5px; left: -3px"
  >
    <tiao2 />
  </div>
  <div class="login-page">
    <h2 style="position: relative; text-align: center">登录页面</h2>
    <div style="position: relative; text-align: center">
      账号:<input
        style="width: 240px; height: 30px; border: 2px green solid"
        v-model="shu"
        @input="shur"
        type="text"
        placeholder="账号"
        maxlength="11"
      /><br />
      密码:<input
        maxlength="14"
        style="width: 240px; height: 30px; border: 2px green solid; margin-top: 20px"
        type="password"
        placeholder="密码"
      /><br />
      <button
        class="dla"
        style="
          margin-top: 20px;
          background-color: #34fd34;
          width: 90px;
          height: 35px;
          transition: all 0.7s;
        "
        @click="handleLogin"
      >
        登录
      </button>
      <hr style="width: 100%; color: azure" />
      <router-link class="login" to="/zhuce">点我去注册</router-link>
    </div>
  </div>
</template>

<script lang="ts" name="LoginPage" setup>
import { useRouter } from 'vue-router'
import { defineComponent } from 'vue'
import tiao2 from '../components/tiao2.vue'
import { ref } from 'vue'

const router = useRouter()
const shu = ref('')
const shur = (e: { target: { value: string } }) => {
  shu.value = e.target.value.replace(/[^\d]/g, '')
  if (shu.value.length > 11) {
    shu.value = shu.value.slice(0, 11)
  }
}
const handleLogin = () => {
  console.log('登录逻辑...')

  // 在这里添加你的登录验证逻辑
  // 假设登录成功...
  // 跳转到首页
  router.push('/denglucg')
}
</script>
<style scoped>
.login-page {
  background-color: bisque;
  width: 400px;
  height: 550px;
  position: absolute;
  display: block;
  margin-top: 90px;
  margin-left: 575px !important;
  z-index: 9000;
}
.dla:hover {
  background-color: rgb(223, 219, 11) !important;
}
.login {
  display: block;
  margin-left: 174px;
  margin-top: -47px;
}
</style>
