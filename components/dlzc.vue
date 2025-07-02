<template>
  <div class="dlzc">
    <img src="../img/mi.webp" style="width: 300px; height: 200px" />
    <router-link class="dz" to="/dll">登录</router-link>
  </div>
</template>

<script lang="ts">
import dll from './dll.vue'
export default {
  name: 'App',
  components: { dll },
}
</script>
<script lang="ts" setup>
import { ref } from 'vue'
</script>
<style>
template {
  overflow-y: scroll; /*   强制显示滚动条轨道（避免布局跳动） */
}

template::-webkit-scrollbar {
  width: 0 !important; /* 隐藏滚动条（Chrome/Safari） */
}

template {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /*IE/Edge */
}
.dlzc {
  position: relative;
  display: block;
  width: 300px;
  height: 360px;
  position: relative;
  left: 1120px;
  margin-top: -384px;
  background: linear-gradient(
    to bottom,
    rgb(173, 131, 131),
    rgb(235, 229, 229),
    rgb(236, 210, 172)
  );
  border-radius: 3%;
  align-items: center;
  text-align: center;
}
.dz {
  color: black;
  text-decoration: none;
  font-size: 30px;
  background-color: #f05b4e;
  padding: 5px 14px 5px 14px;
  z-index: 18000;
  border-radius: 15px;
  position: relative;
  top: 20px;
  transition: all 0.7s;
}
.dz:hover {
  background-color: rgb(158, 190, 138);
  transition: all 0.7s;
  padding: 5px 16px 5px 16px;
}
</style>
