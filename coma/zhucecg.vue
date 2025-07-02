<template>
  <div class="jiaoche">
    <div class="n11">
      <router-link class="aaaa" to="jiaoche" @click="jiaoche"> 欢迎,注册成功</router-link>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'jiaoche',
  //components: { Preson, people },
}
</script>
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const showhover = ref(false)
const showhoverr = ref(false)
const showhove = ref(false)
const router = useRouter()
const jiaoche = () => {
  router.push('/jiaoche')
}
</script>
<style>
.aaaa {
  position: relative;
  left: 100px;
  width: 100%;
  background-color: burlywood;
}
</style>
