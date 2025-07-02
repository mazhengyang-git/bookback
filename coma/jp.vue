<template>
  <div class="cewei" v-for="(i, index) in sccccc" :key="index" v-show="celun === index + 1">
    <img style="width: 270px; height: 330px; object-fit: cover" :src="i.img" />
    <span style="position: relative; top: 335px; left: -179px"> {{ i.name }}</span>
  </div>
  <button @click="next" style="position: relative; right: -1100px">></button>
  <button @click="prev" style="position: relative; left: 300px"><</button>
  <div class="diance">
    <span
      v-for="(i, index) in sccccc"
      :key="index"
      :class="{ active: celun === index + 1 }"
      @click="gotoo(index + 1)"
    ></span>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
let celun = ref(1)
let sccccc = ref([
  { img: '../img/dh.webp', name: '天神下凡德华' },
  { img: '../img/fd.webp', name: '歌神四川芬达' },
])
let cdlun = sccccc.value.length
let next = () => {
  celun.value = (celun.value % cdlun) + 1
}
let prev = () => {
  if (celun.value === 1) {
    celun.value = cdlun
  } else {
    celun.value = celun.value - 1
  }
}
let gotoo = (index: number) => {
  celun.value = index
}
let pp: number | null = null
onMounted(() => {
  pp = +setInterval(prev, 3000)
})
onUnmounted(() => {
  if (pp) {
    clearInterval(pp)
  }
})
const checkImages = () => {
  sccccc.value.forEach((item, index) => {
    const img = new Image()
    img.src = item.img

    img.onerror = () => {
      // 图片加载失败时替换为默认图片
      sccccc.value[index].img = '../img/GTR.webp'
      console.warn(`Using default image for: ${item.name}`)
    }
  })
}
</script>

<style scoped>
.cewei {
  display: flex;
  text-align: center;
  justify-content: center;
}
.diance {
  position: absolute;
  left: 47.2%;
  display: flex;
  gap: 10px;
  transform: translateX(-50%);
  z-index: 19800;
  text-align: center;
  justify-content: center;
}
.diance span {
  width: 12px;
  height: 12px;
  background-color: black;
  border-radius: 50%;
  cursor: pointer;
}
.diance span.active {
  background-color: rgb(231, 6, 6);
}
</style>
