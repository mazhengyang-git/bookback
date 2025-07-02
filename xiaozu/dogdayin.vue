<template>
  <div>
    <img class="tudog" v-for="(dog, index) in dog" :src="dog" :key="index" />
    <br /><button @click="addog">放松一下?添加小狗照片</button>
  </div>
</template>

<script lang="ts" setup>
import usedog from '../xiaozu/hooks/useDogs'
const { dog, addog } = usedog()
</script>
<style scoped>
.tudog {
  width: 180px;
  height: 200px;
  object-fit: cover; /* Show the whole image */
}
</style>
