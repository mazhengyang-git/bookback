<template>
  <div class="se">
    <div class="asss">
      <router-link
        v-for="(item, index) in slides"
        :key="index"
        :to="item.rue"
        v-show="lunxian === index + 1"
      >
        <span class="lunbotuzi">{{ item.title }}</span>
        <img class="tu" :src="item.image" />
      </router-link>

      <button @click="next" class="pw prev">></button>
      <button @click="prev" class="pw next"><</button>
    </div>
    <div class="dots">
      <span
        v-for="(item, index) in slides"
        :key="index"
        :class="{ active: lunxian === index + 1 }"
        @click="godianlun(index + 1)"
      >
      </span>
    </div>
    <div class="xiatiao1"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue'
import mdlun from '../src/img/md.webp'

import redh9 from '../src/img/红旗H9.webp'
import xmisu7 from '../src/img/su7.webp'
import ada8 from '../src/img/GTR.webp'
const slides = ref([
  { title: '阿斯顿.马丁vanquish', image: mdlun, rue: '/阿斯顿.马丁vanquish' },
  { title: '红旗H9', image: redh9, rue: '红旗H9' },
  { title: '小米SU7', image: xmisu7, rue: '小米SU7' },
  { title: '奥迪A8', image: ada8, rue: '奥迪A8' },
])

let lunxian = ref(1)
const cdlun = slides.value.length
let next = () => {
  lunxian.value = (lunxian.value % cdlun) + 1
}
let prev = () => {
  if (lunxian.value === 1) {
    lunxian.value = cdlun
  } else {
    lunxian.value = lunxian.value - 1
  }
}
let godianlun = (index: number) => {
  lunxian.value = index
}
//if=1,1-1===0->4.  2-1===1!=0->1.  3-1->切换到2.  4-1!=0->4-1->3
let zilun: number | null = null
onMounted(() => {
  zilun = +setInterval(next, 4000)
})

onUnmounted(() => {
  if (zilun) {
    clearInterval(zilun)
  }
})
</script>
<style>
.dots {
  position: absolute;
  bottom: 30px;
  z-index: 19800;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
.lunbotuzi {
  position: absolute;
  top: 19px;
  font-size: 25px;
  color: brown;
  left: 10px;
  z-index: 9750;
}
.lunbotuzi:hover {
  color: rgb(198, 111, 43);
}
.dots span {
  width: 10px;
  height: 10px;
  background-color: rgba(5, 5, 5, 0.5);
  border-radius: 50%;
  cursor: pointer;
}

.dots span.active {
  background-color: rgb(249, 6, 6);
}
.xiatiao1 {
  height: 24px;
  bottom: 0px;
  background: linear-gradient(to bottom, rgb(201, 121, 89), rgb(163, 65, 19));
  position: absolute;
  width: 100%;
}
template {
  overflow: hidden; /*   强制显示滚动条轨道（避免布局跳动） */
}
.pw {
  position: relative;
  width: 70px;
  height: 50px;
  font-size: 40px;
  z-index: 9700;
  background-color: rgb(247, 244, 244);
  transition: transform 0.7s;
}
.pw:hover {
  background-color: rgb(193, 193, 193);

  transform: scale(1.05);
  transition: all 0.7s;
}
.pw:active {
  background-color: rgb(72, 203, 12);

  transform: scale(1.01);
  transition: all 0.7s;
}
.pw.prev {
  left: 620px;
  top: -220px;
}
.pw.next {
  top: -220px;
  right: 82px;
}
template::-webkit-scrollbar {
  width: 0 !important; /* 隐藏滚动条（Chrome/Safari） */
}

template {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /*IE/Edge */
}
.asss {
  width: 730px;
  height: 350px;
  z-index: 9000;
  margin-top: 20px;
  margin-left: 414.5px;
  position: relative;
  display: block;
}
.se {
  background: linear-gradient(
    to bottom,
    rgb(235, 225, 225),
    rgb(161, 157, 157),
    rgb(235, 225, 225)
  );
  height: 423.5px;
  width: 1530px;
  position: relative;
  left: 0px !important;
  margin-top: -22.75px;
  display: block;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.ce a {
  font-size: 20px;
  display: block;
  position: absolute;
  margin-left: 300px;
  background-color: antiquewhite;
  text-decoration: none;
}
.ce1 {
  text-decoration: none;
  position: absolute;
  top: 50px;
  left: 300px;
  font-size: 20px;
  background-color: antiquewhite;
}
.ce a:hover,
.ce1:hover {
  background-color: rgb(217, 122, 13);
}
.tu {
  width: 700px;
  height: 400px;
  position: relative;
  left: -5px;
  z-index: 9600;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-pixelated;
  image-rendering: pixelated;
}
</style>
