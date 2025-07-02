<template>
  <div class="se">
    <div class="gitju">
      <div class="gitz" style="color: chocolate">
        账号<input type="text" placeholder="账号" style="margin-bottom: 40px" /><br />
        密码<input type="password" maxlength="12" placeholder="密码" style="margin-bottom: 40px" />
        <br /><button onclick="" style="margin-right: 20px; font-size: 23px">登录</button>
        <span style="color: aliceblue">没有账号?去注册</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue'
</script>
<style>
.se {
  background: linear-gradient(#ffffff, #333333);
  width: 100%;
  height: 500px;
}
.gitju {
  position: relative;
}
.gitz {
  position: absolute;
  justify-content: center;
  text-align: center;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
