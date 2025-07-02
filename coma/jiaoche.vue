<template>
  <div class="jiaoche">
    <div class="n11">
      <li class="liis">
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 新能源</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 轿车</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> SUV</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> MPV</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 豪华品牌</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 跑车</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 皮卡</router-link>
        <router-link class="aaa" to="jiaoche" @click="jiaoche"> 面包</router-link>
      </li>
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
<style></style>
