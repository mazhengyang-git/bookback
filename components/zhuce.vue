<template>
  <div class="loginn">
    <h2 style="position: relative; text-align: center; color: aliceblue; top: 15px; left: 21px">
      注册页面
    </h2>
    <div style="position: relative; text-align: center; top: 20px">
      <span style="color: #cccccc; position: relative; left: 16px">账号:</span
      ><input
        v-model="shu"
        @input="shuru"
        style="
          width: 240px;
          height: 30px;
          border: 2px green solid;
          position: relative;
          left: 15.5px;
        "
        type="text"
        placeholder="注册账号"
      /><br />
      <span style="color: #cccccc">确认账号:</span
      ><input
        style="width: 240px; height: 30px; border: 2px green solid; margin-top: 10px"
        type="text"
        v-model="shu"
        @input="shuru"
        placeholder="确认账号"
      /><br />
      <span style="color: #cccccc; position: relative; left: 16px">密码:</span
      ><input
        c
        style="
          width: 240px;
          height: 30px;
          border: 2px green solid;
          margin-top: 20px;
          position: relative;
          left: 15.5px;
        "
        type="password"
        maxlength="14"
        placeholder="注册密码"
      /><br />
      <span style="color: #cccccc">确认密码:</span
      ><input
        c
        style="width: 240px; height: 30px; border: 2px green solid; margin-top: 10px"
        type="password"
        maxlength="14"
        placeholder="确认密码"
      /><br />
      <button
        class="dla"
        style="
          margin-top: 20px;
          background-color: #cccccc;
          width: 90px;
          height: 35px;
          position: relative;
          left: 26px;
        "
        @click="Login"
      >
        注册
      </button>
    </div>
  </div>
</template>

<script lang="ts" name="Login" setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
const router = useRouter()
const shu = ref('')
const shuru = (e: Event) => {
  // 需指定 target 为 HTMLInputElement 类型（类型断言）
  const input = e.target as HTMLInputElement
  shu.value = input.value.replace(/[^\d]/g, '')
  if (shu.value.length > 11) {
    shu.value = shu.value.slice(0, 11)
  }
}
const Login = () => {
  console.log('注册逻辑...')

  // 在这里添加你的注册验证逻辑
  // 假设注册成功...
  // 跳转到首页
  router.push('/zhucecg')
}
</script>
<style>
.loginn {
  background-color: black;
  height: 390px;
}
</style>
