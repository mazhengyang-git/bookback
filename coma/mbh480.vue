<template>
  <div class="overflow-hidden-container">
    <div class="n1s"><tiaos /></div>
    <div class="zuosxi">
      <div class="zuoxians" :class="{ zuodian: zuox }">
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
      </div>
    </div>
    <span class="mbhz">梅赛德斯-迈巴赫S级轿车</span
    ><img @click="zuodianx" class="mbtu" src="../img/mbh.jpg" alt="主视觉图" />
    <span class="mbhz1">-</span><span class="mbhz2">礼待天下</span>
    <div style="position: relative">
      <RouterLink class="syu1" to="">预约品鉴</RouterLink
      ><RouterLink class="syu2" to="">在线预订</RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, reactive, ref, onMounted, onUnmounted, provide } from 'vue'
import tiaos from '../coma/tiaos.vue'
let zuox = ref(false)
provide('zuox', zuox)
let zuodianx = () => {
  zuox.value = false
}
</script>

<style scoped>
.overflow-hidden-container {
  overflow-x: hidden;
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
.zuosxi {
  position: relative;
}

.zuoxians {
  position: absolute;
  width: 495px;
  height: 750px;
  background-color: rgba(7, 7, 7, 0.9); /* 增加透明度以提高可读性 */
  color: white;
  z-index: 10007;
  box-shadow: 2px 3px 10px rgb(66, 65, 65);
  transform: translateX(-100%);
  transition:
    transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.zuoxians.zuodian {
  transform: translateX(0);
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
  top: 178px;
  display: flex;
}
.zuoszia2 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 218px;
  display: flex;
}
.zuoszia3 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 258px;
  display: flex;
}
.zuoszia4 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 298px;
  display: flex;
}
.zuoszia11 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 411.5px;
  display: flex;
}
.zuoszia22 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 451.5px;
  display: flex;
}
.zuoszia33 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 491.5px;
  display: flex;
}
.zuoszia44 {
  position: absolute;
  left: 302.5px;
  color: rgb(139, 136, 136);
  text-decoration: none;
  top: 531.5px;
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
.n1s {
  position: relative;
  width: 1530px;
  height: 60.5px;
  background: linear-gradient(to bottom, rgb(14, 1, 1), rgb(4, 4, 4), rgb(14, 1, 1));
  left: -5px;
}
.syu1 {
  background-color: white;
  padding: 10px 0px 10px 55px;
  width: 120px;
  position: absolute;
  display: inline-block;
  border-radius: 28px;
  z-index: 10001;
  left: 170px;
  top: -480px;
  color: black;
  text-decoration: none;
  font-weight: 700;
}
.syu2 {
  background-color: black;
  position: absolute;
  width: 120px;
  display: inline-block;
  z-index: 10001;
  border-radius: 28px;
  top: -480px;
  left: 410px;
  color: white;
  font-weight: 700;
  text-decoration: none;
  padding: 10px 0px 10px 55px;
  border: 0.0001px rgb(58, 37, 37) solid;
}
.syu1:hover {
  background-color: #d7d2d2ff;
}
.syu2:hover {
  background-color: rgb(44, 40, 40);
}
.mbhz {
  display: block;
  position: absolute;
  z-index: 10000;
  color: aliceblue;
  font-size: 46px;
  left: 180px;
  top: 150px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.mbhz1 {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  display: block;
  position: absolute;
  z-index: 10000;
  color: aliceblue;
  font-size: 46px;
  left: 180px;
  top: 195px;
}
.mbhz2 {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  display: block;
  position: absolute;
  z-index: 10000;
  color: aliceblue;
  font-size: 30px;
  left: 180px;
  top: 250px;
}
.mbtu {
  width: 1530px;
  position: relative;
  left: -5px;
  height: auto;
  object-fit: cover;
  display: block;
}

/* 全局隐藏滚动条 */
</style>
