<template>
  <div class="car-list-container">
    <div
      class="car-item"
      v-for="(f, index) in xiatu"
      :key="index"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = -1"
    >
      <router-link :to="f.rue" class="car-link">
        <div class="image-container">
          <img class="car-image" :src="f.img" :alt="f.name" />
        </div>
        <span class="car-name">{{ f.name }}</span>
      </router-link>

      <!-- 将悬浮内容放在触发元素内部 -->
      <div class="hover-content" v-if="hoveredIndex === index">
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 0"
          to="/yu7price"
        >
          <div class="price-info">小米YU7报价</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 0"
          to="/yu7参数"
        >
          <div class="spec-info">小米YU7参数</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 3"
          to="/eπ007price"
        >
          <div class="special-info">eπ007报价</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 3"
          to="/eπ007参数"
        >
          <div class="special-infoo">eπ007参数</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 1"
          to="/小米SU7price"
        >
          <div class="special-info">小米SU7报价</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 1"
          to="/小米SU7参数"
        >
          <div class="special-infoo">小米SU7参数</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 2"
          to="/海鸥price"
        >
          <div class="special-info">海鸥报价</div>
        </router-link>
        <router-link
          style="text-decoration: none; font-weight: 600"
          v-if="index === 2"
          to="/海鸥参数"
        >
          <div class="special-infoo">海鸥参数</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const hoveredIndex = ref(-1)

const xiatu = reactive([
  { name: '小米YU7', rue: '/小米YU7', img: '../src/img/yu7.webp' },
  { name: '小米SU7', rue: '/小米SU7', img: '../src/img/su7.webp' },
  { name: '海鸥', rue: '/海鸥', img: '../src/img/haiou.webp' },
  { name: 'eπ007', rue: '/eπ007', img: '../src/img/ep.webp' },
  { name: '海鸥', rue: '/海鸥', img: '../src/img/haiou.webp' },
  { name: '小米SU7', rue: '/小米SU7', img: '../src/img/su7.webp' },
  { name: '海鸥', rue: '/海鸥', img: '../src/img/haiou.webp' },
])
</script>

<style scoped>
.car-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 13px;
  position: relative;
  top: -300px;
  z-index: 18000;
}

.car-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.car-link {
  color: black;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  padding: 10px;
}

.car-link:hover {
  color: rgb(64, 74, 207);
}

.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.car-image {
  width: auto;
  height: 70px;
}

.car-name {
  margin-top: 0px;
  text-align: center;
}

/* 悬浮内容样式 */
.hover-content {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 19000;
  width: max-content;
  white-space: nowrap;
}

.price-info,
.spec-info,
.special-info,
.special-infoo {
  background-color: gainsboro;
  padding: 2px 35px 3px 35px;
  text-align: center;
  color: black;
  font-size: 20px;
}
.price-info:hover,
.spec-info:hover,
.special-info:hover,
.special-infoo:hover {
  color: red;
  background-color: azure;
}
.spec-info {
  border-top: 1px red solid;
  padding: 0px 35px 3px 35px !important;
}
.special-infoo {
  background-color: gainsboro;
  border-top: 1px red solid;
  padding: 0px 35px 3px 35px;
}
.special-info {
  padding: 2px 35px 3px 35px;
}
</style>
