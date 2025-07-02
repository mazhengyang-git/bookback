<template>
  <div class="home">
    <div class="n1">
      <tiao1 />
    </div>
    <br />
    <div>
      <lunbotu />
    </div>
    <div>
      <dlzc />
    </div>
    <div class="n2">
      <tiao3 />
    </div>
  </div>
  <dog />
  <div>
    <RouterLink to="/ny">新能源</RouterLink>
    <RouterLink to="/MaiBaHe|S480">迈巴赫</RouterLink>
  </div>
  <div><RouterView></RouterView></div>
</template>

<script lang="ts" setup>
import { RouterView, RouterLink } from 'vue-router'
import tiao1 from '../components/tiao1.vue'
import lunbotu from '../components/lunbotu.vue'
import dlzc from '../components/dlzc.vue'
import tiao3 from '../coma/tiao3.vue'
import xiab from '../coma/xiab.vue'
import dog from '../xiaozu/dogdayin.vue'
import jy from '../coma/jp.vue'
components: {
  tiao3
}
</script>

<style scoped>
.home {
  overflow: hidden;
}
.n1 {
  position: relative;
  width: 1530px;
  height: 60.5px;

  background: linear-gradient(to bottom, rgb(163, 65, 19), rgb(201, 121, 89));
  left: -5px !important;
}
.n2 {
  position: relative;
  width: 1530px;
  height: 660px;
  margin-top: 24.25px;
  background-color: rgb(240, 238, 238);
  left: 0px !important;
}
</style>
