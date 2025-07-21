<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="overflow-hidden-container">
    <div class="toptiao">
      <div><tiaos /></div>
      <div class="zhantiao"></div>
    </div>
    <div class="soux" :class="{ soudian: soux }">
      <span class="soulan"
        ><input class="sesou" placeholder="EQS" /><RouterLink to=""
          ><img class="sousou" :src="sou" /></RouterLink
      ></span>
      <hr class="souxian1" />
    </div>
    <div class="dengx" :class="{ dengdian: dengx }">
      <span class="denglan"> </span>
    </div>
    <div class="zuosxi" :class="{ zuodian: zuox }">
      <div class="zuoxians">
        <span class="zuoszi">探索车型</span>
        <RouterLink class="zuoszia" to="">全部车型</RouterLink>
        <hr class="zuosxian1" />
        <span class="zuoszi1">官方商城</span>
        <div class="zuozuosw">
          <RouterLink class="zuoszia1" to="">购新车</RouterLink>
          <RouterLink class="zuoszia2" to="">看二手</RouterLink>
          <RouterLink class="zuoszia3" to="">找售后</RouterLink>
          <RouterLink class="zuoszia4" to="">买互联</RouterLink>
        </div>
        <hr class="zuosxian2" />
        <span class="zuoszi11">车主服务</span>
        <div class="zuozuosw">
          <RouterLink class="zuoszia11" to="">服务政策查询</RouterLink>
          <RouterLink class="zuoszia22" to="">保养维修及救援</RouterLink>
          <RouterLink class="zuoszia33" to="">选装配件及精品</RouterLink>
          <RouterLink class="zuoszia44" to="">纯电车型服务</RouterLink>
        </div>
        <hr class="zuosxian22" />
        <span class="zuoszi111">科技创新</span>
        <div class="zuozuosww">
          <RouterLink class="zuoszia111" to="">设计美学</RouterLink>
          <RouterLink class="zuoszia222" to="">动力与效能科技</RouterLink>
          <RouterLink class="zuoszia333" to="">智能科技</RouterLink>
          <RouterLink class="zuoszia444" to="">豪华体验科技与工艺</RouterLink>
          <RouterLink class="zuoszia555" to="">奔驰智造</RouterLink>
        </div>

        <div class="zhanzuo"></div>
        <span></span>
      </div>
    </div>
    <span @click="zuodianx" class="mbhz">梅赛德斯-迈巴赫S级轿车</span>

    <img
      @click="zuodianx"
      :class="'mbtu'"
      alt="Wave Effect"
      ref="bgImg"
      :src="bgSrc"
      loading="eager"
    />
    <span @click="zuodianx" class="mbhz1">-</span><span class="mbhz2">礼待天下</span>
    <div style="position: relative">
      <RouterLink class="syu1" to="">预约品鉴</RouterLink
      ><RouterLink class="syu2" to="">在线预订</RouterLink>
    </div>

    <div class="topsxi" :class="{ zuodiana: zuoxs }">
      <img class="topxians" :src="topb" />
    </div>

    <img @click="zuodianx" class="mbtu2" alt="Wave Effect" :src="bgSrc" loading="lazy" />
  </div>
</template>

<script lang="ts" setup>
import {
  onBeforeUnmount,
  computed,
  inject,
  reactive,
  ref,
  onMounted,
  onUnmounted,
  provide,
} from 'vue'
import tiaos from '../coma/tiaos.vue'
import mbh from '../src/img/mbh.jpg'
import sou from '../src/img/sou.png'
import topb from '../src/img/topb.png'

//懒加载开始代码
const bgSrc = mbh
const allImagesLoaded = ref(false)

// 需要监听的图片元素
const imagesToLoad = [bgSrc, mbh, sou, topb]

function loadImages() {
  const imagePromises = imagesToLoad.map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = src
      img.onload = resolve
    })
  })

  Promise.all(imagePromises)
    .then(() => {
      allImagesLoaded.value = true
    })
    .catch(() => {
      // 即使有图片加载失败，也继续显示内容
      allImagesLoaded.value = true
    })
}
onMounted(() => {
  loadImages()

  // 设置超时作为后备，确保遮罩不会永远存在
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 1000) // 3秒后无论如何都隐藏遮罩
})
//懒加载截止代码
interface RefData<T = any> {
  value: T
}

let zuox: RefData<boolean> = ref(false)
let dengx: RefData<boolean> = ref(false)
let zuoxs: RefData<boolean> = ref(false)
let soux: RefData<boolean> = ref(false)
let souy: RefData<boolean> = ref(false)
provide('soux', soux)
provide('zuox', zuox)
provide('dengx', dengx)
provide('zuoxs', zuoxs)
provide('souy', souy)
let zuodianx = () => {
  zuox.value = false
  soux.value = false
  dengx.value = false
}

onMounted(() => {
  // 在组件卸载前移除事件监听器
  //onBeforeUnmount(() => {})
})
</script>

<style scoped>
.black-mask {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 19999;
}

/* 遮罩淡出动画 */
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
.dengx {
  position: fixed;
  display: none;
  width: 330px;
  height: 330px;
  top: 100px;
  left: 1100px;

  z-index: 0;
  background-color: rgba(25, 25, 25, 0.6);

  border-radius: 10px;
}
.dengx.dengdian {
  backdrop-filter: blur(12px);
  z-index: 10555;
  display: block;
  opacity: 1;
}
.sousou {
  display: block;
  position: absolute;
  top: 15px;
  width: 24px;
  height: 24px;
  left: 66.25%;
}
.souxian1 {
  display: block;
  position: relative;
  top: 10px;
  left: 12px;
  width: 500px;
  border-color: rgba(30, 30, 30, 0.65);
}
.sesou {
  background-color: rgb(29, 28, 28);
  position: relative;
  left: 50%;
  top: 50%;
  border: 0;
  outline-style: none;
  caret-color: aliceblue;
  width: 500px;
  transform: translate(-47.5%, -75%);
}
.soux {
  background-color: rgb(32, 31, 31);
  height: 55px;
  position: fixed;

  width: 1497.2px;
  display: block;
  z-index: 10503;
  top: 60.6px;
  display: none;
}
.soux.soudian {
  display: block;
}
.ced span {
  position: relative;
  display: block;
  padding-top: 30px;
}
.overflow-hidden-container {
  position: relative;
  /* 注释这两行，避免切断滚动上下文，影响 sticky 定位 */
  overflow-x: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  overflow-y: hidden;
  width: 100%;
} /*隐藏滚动条关键*/
.zuosxian1 {
  position: relative;
  top: 100px;
  left: -12px;
  border-color: rgba(7, 7, 7, 0.65);
  width: 340px;
}
.zuosxian2 {
  position: relative;
  top: 291px;
  left: -12px;
  border-color: rgba(7, 7, 7, 0.65);
  width: 340px;
}
.zuosxian22 {
  position: relative;
  top: 486px;
  left: -12px;
  border-color: rgba(7, 7, 7, 0.65);
  width: 340px;
}

.zuoszi111 {
  left: 110px;
  top: 520px;
  font-size: 17px;
  position: relative;
}
zuozuosww {
  margin-top: 20px;
}
.zuoszia111 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 648.5px;
  display: flex;
}
.zuoszia222 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 688.5px;
  display: flex;
}
.zuoszia333 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 728.5px;
  display: flex;
}
.zuoszia444 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 768.5px;
  display: flex;
}
.zuoszia555 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 808.5px;
  display: flex;
  padding-bottom: 45px;
}
.zuosxi {
  position: fixed;
  left: 0;
  top: 0;
  display: block;
  background-color: rgba(7, 7, 7, 0.88); /* 增加透明度以提高可读性 */
  color: white;

  z-index: 10007;
  box-shadow: 2px 3px 10px rgb(66, 65, 65);
  transform: translateX(-100%);
  transition:
    transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  height: 745px;
  width: 495px;
  opacity: 0;
  &::-webkit-scrollbar {
    display: none;
  }
}
.zhanzuo {
  left: 0;
  top: 0;
  display: block;
  height: 745px;
  width: 495px;
  background-color: rgba(7, 7, 7, 0.88);
}
.zuoxians {
  position: relative;

  height: auto;
}
.topsxi {
  width: 1497px;
  height: 760px;
  object-fit: cover;
  z-index: 10008;
  transform: translateY(-220%);
  position: absolute;
  position: fixed;
  display: block;
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.topxians {
  width: 1497.5px;
  height: 760px;
  object-fit: cover;
}
.topsxi.zuodiana {
  transform: translateY(-100%);
}
.zuosxi.zuodian,
.zuoxians.zuodian,
.mbhz.zuodian,
.mbhz1.zuodian {
  transform: translateX(5px);
  opacity: 1;
}

.zuoszi {
  left: 110px;
  top: 60px;
  font-size: 17px;
  position: relative;
}
.zuoszi1 {
  left: 110px;
  top: 135px;
  font-size: 17px;
  position: relative;
}
.zuoszi11 {
  left: 110px;
  top: 325px;
  font-size: 17px;
  position: relative;
}
zuozuosw {
  margin-top: 20px;
}

.zuoszia1 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 179px;
  display: flex;
}
.zuoszia2 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 219px;
  display: flex;
}
.zuoszia3 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 259px;
  display: flex;
}
.zuoszia4 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 299px;
  display: flex;
}
.zuoszia11 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 412px;
  display: flex;
}
.zuoszia22 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 452px;
  display: flex;
}
.zuoszia33 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 492px;
  display: flex;
}
.zuoszia44 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 532px;
  display: flex;
}
.zuoszia11:hover,
.zuoszia22:hover,
.zuoszia33:hover,
.zuoszia44:hover,
.zuoszia2:hover,
.zuoszia3:hover,
.zuoszia4:hover,
.zuoszia1:hover {
  color: rgb(204, 207, 210);
}
.zuoszia {
  position: relative;
  left: 235px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 60px;
}
.zuoszia:hover {
  color: rgb(204, 207, 210);
}
.zhanzuo {
  height: 60.5px;
}
.mbtu {
  width: 1530px;

  left: -5px;
  height: 761px;
  object-fit: cover;
  display: block;
  animation:
    fadetu 0.85s ease-out forwards,
    mtu 4.2s ease-in infinite;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.syu1 {
  background-color: white;
  padding: 10px 0px 10px 55px;
  width: 120px;
  position: relative;
  display: block;
  border-radius: 28px;
  z-index: 10001;
  left: 170px;
  top: -380px;
  color: black;
  text-decoration: none;
  font-weight: 700;
  animation: fadeI 1.3s ease-out;
}
.syu2 {
  background-color: black;
  position: absolute;
  width: 120px;
  display: inline-block;
  z-index: 10001;
  border-radius: 28px;
  top: -380px;
  left: 410px;
  color: white;
  font-weight: 700;
  text-decoration: none;
  padding: 10px 0px 10px 55px;
  border: 0.0001px rgb(58, 37, 37) solid;
  animation: fadeI 1.3s ease-out;
}
.syu1:hover {
  background-color: #d7d2d2ff;
}
.syu2:hover {
  background-color: rgb(44, 40, 40);
}
@keyframes fadeI {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}
.mbhz {
  display: block;
  position: absolute;
  z-index: 10000;
  color: aliceblue;
  font-size: 46px;
  width: 600px;
  left: 180px;
  top: 150px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  animation: fadeIn 1.2s ease-out;
  font-family: '华文楷体';
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}
.mbhz1 {
  font-family: '华文楷体';
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  animation: fadeIn 1.2s ease-out;
  display: block;
  position: absolute;
  z-index: 10000;
  color: aliceblue;
  font-size: 46px;
  left: 180px;

  top: 195px;
}
.mbhz2 {
  font-family: '华文楷体';
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  display: block;
  position: absolute;
  z-index: 10000;
  animation: fadeIn 1.2s ease-out;
  color: aliceblue;
  font-size: 30px;
  left: 180px;
  top: 250px;
}

.mbtu::-webkit-scrollbar {
  display: none;
}

@keyframes fadetu {
  from {
    transform: scale3d(1.05, 1.05, 1);
    filter: blur(3px), hue-rotate(0deg);
    opacity: 0.8;
  }

  to {
    transform: scale3d(1.02, 1.02, 1);
    filter:
      blur(0),
      hue-rotate(60deg) saturate(1.5);
    opacity: 1;
  }
}
@keyframes mtu {
  0% {
    filter: brightness(1) contrast(1);
  }
  25% {
    filter: brightness(1.02) contrast(1.02);
  }
  37.5% {
    filter: brightness(0.93) contrast(1);
  }
  50% {
    filter: brightness(1.02) contrast(1.02);
  }
  100% {
    filter: brightness(1) contrast(1);
  }
}
/* 全局隐藏滚动条 */
</style>
