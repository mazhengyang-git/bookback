<template>
  <nav class="n1s" @click="soudianx"></nav>

  <div class="n11">
    <img loading="lazy" />
    <div class="ssstiao">
      <span style="cursor: pointer" @click="zuoxian">
        <img class="stu" :src="hengsan" loading="lazy" />
      </span>
      <span style="cursor: pointer" @click="zuoxians" class="sa1" to="">探索车型</span>
      <router-link class="sa2" to="">预约品鉴</router-link>
      <router-link class="sa3" to="">找经销商</router-link>
      <router-link to="">
        <img class="stua" :src="mbhb" loading="lazy" />
      </router-link>

      <a alt="void(0)" href="javascript:void(0)">
        <img @click="soudian" title="搜索" alt="void(0)" class="sa11" :src="sou" loading="lazy" />
      </a>
      <router-link to="">
        <img class="sa22" :src="mxin" loading="lazy" />
      </router-link>
      <span @click="dengdian" to="">
        <img class="sa33" :src="mdengdian" loading="lazy" />
      </span>
    </div>
  </div>
  <div class="mbyoukuai1">.</div>
  <div class="viewport-wrapper">
    <div class="mbyoukuai">
      <div class="mb-item">
        <div @click="zuoxians">
          <img class="yousitu" :src="yousitu1" loading="lazy" />
          <span class="yousizi">探索车型</span>
        </div>
      </div>
      <div class="mb-item">
        <div @click="yousi2">
          <img class="yousitu" :src="yousitu2" loading="lazy" />
          <span class="yousizi">在线购车</span>
        </div>
      </div>
      <div class="mb-item">
        <div @click="yousi3">
          <img class="yousitu" :src="yousitu3" loading="lazy" />
          <span class="yousizi">金融试算</span>
        </div>
      </div>
      <div class="mb-item">
        <div @click="yousi4">
          <img class="yousitu" :src="yousitu4" loading="lazy" />
          <span class="yousizi">找经销商</span>
        </div>
      </div>
    </div>
  </div>
  <div style="display: none; transform: scale(1.1, 1.1); transition: transfrom 0.5s linear">
    {{ usedImages }}
  </div>
</template>
<script lang="ts" setup>
import router from '../src/router'
import { ref, provide, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import mbhb from '../src/img/mbhbz.png'
import sou from '../src/img/sou.png'
import yousitu1 from '../src/img/youtu1.png'
import yousitu2 from '../src/img/youtu2.png'
import yousitu3 from '../src/img/youtu3.png'
import yousitu4 from '../src/img/youtu4.png'
import mdengdian from '../src/img/mdl.png'
import mxin from '../src/img/zanxin.png'
import hengsan from '../src/img/hengsan.png'
import type { Ref } from 'vue' // 类型单独导入
const usedImages = [yousitu1, yousitu2, yousitu3, yousitu4, mdengdian, mxin, sou, mbhb, hengsan]
let zuox = inject<Ref<boolean>>('zuox')!
let soux = inject<Ref<boolean>>('soux')!
let zuoxs = inject<Ref<boolean>>('zuoxs')!
let souy = inject<Ref<boolean>>('souy')!
let dengx = inject<Ref<boolean>>('dengx')!

let dengdian = () => {
  soux.value = false
  if (dengx.value === true) {
    dengx.value = false
  } else {
    dengx.value = true
  }
}
let soudian = () => {
  dengx.value = false
  if (soux.value === true) {
    soux.value = false
    souy.value = false
  } else {
    soux.value = true
    souy.value = true
  }
}
let soudianx = () => {
  dengx.value = false
  if (soux.value === true) {
    soux.value = false
    souy.value = false
  } else {
    souy.value = true
  }
}
let zuoxian = () => {
  dengx.value = false
  if (zuox.value === true) {
    zuox.value = false
    zuoxs.value = false
  } else {
    zuox.value = true
    zuoxs.value = false
  }
  soux.value = false
}
let zuoxians = () => {
  dengx.value = false
  if (zuoxs.value === true) {
    zuoxs.value = false
  } else {
    zuoxs.value = true
  }
  soux.value = false
}
const yousi2 = () => {
  router.push('/mbdll')
}
const yousi3 = () => {
  router.push('/mbdll')
}
const yousi4 = () => {
  router.push('/mbdll')
}
</script>
<style scoped>
/* 以下样式完全覆盖旧的，直接复制即可 */
.mbyoukuai {
  top: 400px;
  z-index: 16666;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 32px;
  position: fixed;
  right: 7.75px;
  height: 100vh;
  width: 100px; /* 裁剪宽度设置为工具栏可视区域 */
  overflow-x: hidden; /* 超出部分自动隐藏 */
  pointer-events: auto; /* 允许点击穿透到下层 */
}

.mb-item {
  --offset: 84px;
  position: relative;
  width: 120px;
  height: 45px;
  background-color: rgb(79, 78, 78);
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  transition: transform 0.35s linear;
  transform: translateX(var(--offset));
}
.mb-item:hover {
  --offset: 11.25px;
  transform: translateX(var(--offset));
}

.yousitu {
  width: 30px;
  height: 30px;
  object-fit: cover;
  position: relative;
  margin: 7px 10px 7.5px 11px;
}

.yousizi {
  margin-left: 0;
  font-size: 14px;
  position: relative;
  top: -17.5px;
  color: #ffffff;
}
.n1s {
  /* 关键：改为粘性定位，滚动到 top: 0 时置顶 */
  position: fixed;
  top: 0;
  display: block;
  width: 1497.2px; /* 确保占满宽度，适配滚动 */
  height: 61px;

  background: linear-gradient(to bottom, rgb(14, 1, 1), rgb(4, 4, 4), rgb(14, 1, 1));
  z-index: 10200; /* 保持层级，覆盖下方内容 */
  animation: tiao 0.5s forwards ease-in;

  opacity: 0.7;
}
@keyframes tiao {
  0% {
    height: 122px;
    opacity: 0.7;
  }
  25% {
    height: 122px;
    opacity: 1;
  }
  50% {
    height: 122px;
    opacity: 1;
  }
  75% {
    height: 91.5px;
    opacity: 1;
  }
  100% {
    height: 61px;
    opacity: 1;
  }
}

.sa11,
.sa22,
.sa33 {
  position: relative;
  display: inline-block;
  left: 975px;
  top: -9px;
  width: 25px;
  height: 25px;
  padding-left: 20px;
  cursor: pointer;
}
.sa11 {
  cursor: pointer;
}
.n11 {
  position: fixed;
  margin-left: 80px;
  display: block;
  z-index: 10202;
  top: -1.5px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.stu {
  margin-right: 25px;
  width: 30px;
  height: 30px;
  top: -9px;
  position: relative;
  animation: fades 0.7s ease-out;
}

.stua {
  margin-right: 25px;
  width: 34px;
  height: 34px;
  top: -5.5px;
  left: 100%;
  transform: translateX(-50%);
  position: relative;
  animation: fadess 1s ease-in forwards;
}
@keyframes fadess {
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(1.2, 1.2);
  }
}
.sa1,
.sa2,
.sa3 {
  font-family: '华文宋体';
  color: aliceblue;
  text-decoration: none;
  position: relative;
  font-size: 14px;
  display: inline-flex;
  top: -18.5px;
  font-weight: 600;
}
.ssstiao {
  position: relative;
  left: -65px;
}
.sa1 {
  transition: all 0.5s;
  margin-right: 20px;
  animation: fades 0.7s ease-out;
}
.sa2 {
  transition: all 0.5s;
  margin-right: 20px;
  animation: fades 0.7s ease-out;
}
.sa3 {
  transition: all 0.5s;
  animation: fades 0.7s ease-out;
}
.sa1:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #25c5ed;
  top: -18.75px;
  font-weight: 700;
  transform: rotateY(20deg);
}
@keyframes fades {
  from {
    opacity: 0;
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
}
.sa2:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #25c5ed;
  top: -18.75px;
  transform: rotateY(20deg);
  font-weight: 700;
}
.sa3:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #25c5ed;
  top: -18.75px;
  transform: rotateY(20deg);
  font-weight: 700;
}
</style>
