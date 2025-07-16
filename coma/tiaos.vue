<template>
  <nav class="n1s" @click="soudianx"></nav>

  <div class="n11">
    <img />
    <div class="ssstiao">
      <span style="cursor: pointer" @click="zuoxian">
        <img class="stu" src="../img/hengsan.png"
      /></span>
      <span style="cursor: pointer" @click="zuoxians" class="sa1" to="">探索车型</span>
      <router-link class="sa2" to="">预约品鉴</router-link>
      <router-link class="sa3" to="">找经销商</router-link>
      <router-link to=""> <img class="stua" src="../img/mbhbz.png" /></router-link>

      <a alt="void(0)" href="javascript:void(0)"
        ><img @click="soudian" title="搜索" alt="void(0)" class="sa11" src="../img/sou.png" />
      </a>
      <router-link to=""><img class="sa22" src="../img/zanxin.png" /></router-link>
      <span @click="dengdian" to=""><img class="sa33" src="../img/mdl.png" /></span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, provide, inject } from 'vue'
let zuox = inject('zuox')
let soux = inject('soux')
let zuoxs = inject('zuoxs')
let souy = inject('souy')
let dengx = inject('dengx')
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
</script>
<style scoped>
.n1s {
  /* 关键：改为粘性定位，滚动到 top: 0 时置顶 */
  position: fixed;
  top: 0;
  display: block;
  width: 1497.2px; /* 确保占满宽度，适配滚动 */
  height: 61px;

  background: linear-gradient(to bottom, rgb(14, 1, 1), rgb(4, 4, 4), rgb(14, 1, 1));
  z-index: 10200; /* 保持层级，覆盖下方内容 */
  animation: tiao 0.75s forwards;
  /* 移除 left: -5px，避免错位，如需调整位置用 margin 等 */
  opacity: 0.5;
}
@keyframes tiao {
  from {
    height: 122px;
    opacity: 0.5;
  }
  to {
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
