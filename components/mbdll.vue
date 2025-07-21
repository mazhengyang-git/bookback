<template>
  <div class="yintiao">
    <div
      class="n1 n2"
      style="
        background-color: black;
        width: 1523px;
        height: 60.5px;
        left: -3px;
        z-index: 9900;
        top: -5px;
      "
    >
      <mbtiao2 />
    </div>
    <div class="mbdbei">
      <div class="login-page">
        <h2 style="position: relative; text-align: center">登录页面</h2>
        <div style="position: relative; text-align: center">
          账号:<input
            style="width: 240px; height: 30px; border: 2px gray solid"
            v-model="shu"
            type="text"
            placeholder="账号"
            maxlength="11"
          /><br />
          密码:<input
            maxlength="14"
            style="width: 240px; height: 30px; border: 2px gray solid; margin-top: 20px"
            type="password"
            placeholder="密码"
          /><br />
          <button
            class="dla"
            style="
              margin-top: 20px;
              background-color: gray;
              width: 90px;
              height: 35px;
              transition: all 0.7s;
              color: white;
            "
            @click="handleLogin"
          >
            登录
          </button>
          <hr style="width: 100%; color: azure" />
          <router-link class="login" to="/zhuce">点我去注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" name="LoginPage" setup>
import { useRouter } from 'vue-router'
import { defineComponent } from 'vue'
import mbtiao2 from '../components/mbtiao2.vue'
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
.yintiao {
  position: relative;
  /* 注释这两行，避免切断滚动上下文，影响 sticky 定位 */
  overflow-x: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  overflow-y: hidden;
  width: 100%;
}
.mbdbei {
  background: url('../img/mbdbjing.png');
  object-fit: cover;
  position: relative;
  z-index: 8800;
  display: block;
  width: 1310px;
  height: 760px;
  transform: scale(1.3, 1.3);
}
.login-page {
  background: linear-gradient(#8f8e8e, #ffffff, #8f8e8e);
  width: 430px;
  height: 550px;
  position: absolute;
  display: block;
  margin-top: 90px;
  margin-left: 575px !important;
  z-index: 9500;
  transform: scale(0.8, 0.8);
  left: -62px;
}
.dla:hover {
  background-color: rgb(223, 113, 11) !important;
}
.login {
  display: block;
  margin-left: 174px;
  margin-top: -47px;
  color: #000;
}
</style>
