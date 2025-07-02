<template>
  <div class="luny">
    <div class="youlun1">
      <span class="s1" :class="{ active: stx === 1 }" @click="youlunaa">经典豪车</span>
    </div>
    <div class="youlun2">
      <span class="s2" :class="{ active: stx === 2 }" @click="youlunbb">更多豪车</span>
    </div>
    <hr class="yyyyyyx" />
    <div class="xianyou1" v-for="(r, index) in youlunb" :key="index" v-show="stx === 1">
      <router-link :to="r.rue"
        ><img :src="r.img" class="youluntu" />
        <span class="youlunzi">{{ r.name }}</span></router-link
      >
    </div>
    <div class="xianyou2" v-for="(r, index) in youluna" :key="index" v-show="stx === 2">
      <router-link :to="r.rue"
        ><img :src="r.img" class="youluntu" />
        <span class="youlunzi">{{ r.name }}</span></router-link
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
let youluna = reactive([
  {
    name: '阿斯顿马丁DBS GT',
    img: '../img/阿斯顿马丁DBS GT.jfif',
    rue: 'asidun|mading|DBS GT',
  },
  {
    name: '布加迪威龙',
    img: '../img/布加迪威龙.webp',
    rue: 'bujiadi|weilong',
  },
  {
    name: '红旗S9',
    img: '../img/红旗S9.webp',
    rue: 'hongqi|S9',
  },
])

let youlunb = reactive([
  {
    name: '日产 GTR',
    img: '../img/日产 GTR.webp',
    rue: 'richan|GTR',
  },
  {
    name: '迈巴赫S480',
    img: '../img/迈巴赫S480.webp',
    rue: 'MaiBaHe|S480',
  },
  {
    name: '道奇地狱猫 恶魔V8',
    img: '../img/道奇地狱猫V8.webp',
    rue: 'daoqidiyumao|emoV8',
  },
])
let stx = ref(1)
let youlunaa = () => {
  stx.value = 1
}

let youlunbb = () => {
  stx.value = 2
}
</script>

<style scoped>
.youlun1,
.youlun2 {
  display: inline-flex;
  position: relative;
  grid-template-rows: auto;
  width: 100px;
  height: 40px;

  padding-left: 5.5%;
  padding-top: 2%;

  left: 1%;
  margin-left: 10px;
  top: 30px;
  transition: all 0.5s;
}
.youlun1:hover,
.youlun2:hover {
  cursor: pointer;
}
.active {
  background-color: rgb(236, 155, 41);

  transition: all 0.5s;
}

.youlun2 {
  top: 15.75px;
}
.youlun1 {
  top: 30.3px;
}
.s1 {
  color: #ffffff;
  font-size: 23px;
  padding-top: 3px;
  padding-left: 3px;
  border: 1px rgb(207, 120, 96) solid;
  padding-bottom: 3px;
  transition: all 0.5s;
}
.s2 {
  color: #ffffff;
  position: relative;
  font-size: 23px;
  padding-top: 3px;
  padding-left: 3px;
  border: 1px rgb(207, 120, 96) solid;
  padding-bottom: 3px;
  transition: all 0.5s;
}
.yyyyyyx {
  position: relative;
  top: 40px;
}
.xianyou1 {
  position: relative;
  top: 45px;
  display: block;
  left: 6px;
  margin-bottom: 10px;
}
.xianyou2 {
  position: relative;
  top: 50px;
  left: 6px;
  margin-bottom: 10px;
}
.youluntu {
  width: 270px;
  height: 140px;
  object-fit: cover;
}
.luny {
  position: absolute;
  right: 50px;
  top: 1.5px;
  width: 280px;
  height: 657px;

  background: linear-gradient(
    to top,
    rgb(255, 255, 255),
    rgb(205, 202, 202),
    rgb(202, 180, 180),
    rgb(86, 63, 63)
  );
  z-index: 15000;
  right: 40px;
}
.youlunzi {
  color: #37642e;
  font-weight: bold;
  position: relative;
  left: 5px;
}
</style>
