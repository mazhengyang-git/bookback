<template>
  <div class="jiaoche">
    <div class="n11">
      <router-link class="aaa" to="jiaoche" @click="jiaoche"> 轿车</router-link>
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
