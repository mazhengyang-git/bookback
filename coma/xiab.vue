<template>
  <!-- 循环渲染每个汽车类别 -->
  <div class="containerr">
    <div class="category-row">
      <div class="category-item" v-for="category in carCategories" key="category">
        <div class="car-list">
          <!-- 循环渲染每个类别下的汽车 -->
          <div class="car-item" v-for="car in category.cars" :key="car.name">
            <router-link class="rx1" :to="car.rue">
              <div class="car-name">{{ car.name }}</div></router-link
            >
            <hr />
            <div class="car-links">
              <router-link class="rx2" to="car.rueb"><span>报价</span></router-link> |
              <router-link class="rx3" to="car.ruet"><span>图库</span></router-link> |
              <router-link class="rx4" to="car.rues"><span>社区</span></router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" name="xiab" setup>
import { reactive } from 'vue'
interface Car {
  name: string
  rue: string // 必选属性（必须有）
  rueb?: string // 可选属性（可能有）
  ruet?: string // 可选属性（可能有）
  rues?: string // 可选属性（可能有）
}
interface CarCategory {
  cars: Car[] // 每个分类包含 Car 数组
}

let carCategories = reactive<CarCategory[]>([
  {
    cars: [
      { name: 'επ007', rue: '/jiaoche', rueb: '/jiaoche', ruet: '/jiaoche', rues: '/jiaoche' },
      {
        name: '特斯拉 Model 3',
        rue: '/特斯拉M3',
        rueb: '/特斯拉M3报价',
        ruet: '/特斯拉M3图库',
        rues: '/特斯拉M3社区',
      },
      {
        name: '比亚迪汉 EV',
        rue: '/ByD汉',
        rueb: '/比亚迪汉EV报价',
        ruet: '/比亚迪汉EV图库',
        rues: '/比亚迪汉EV社区',
      },
    ],
  },
  {
    cars: [
      { name: '朗逸', rue: '/朗逸' },
      { name: '卡罗拉', rue: '/卡罗拉' },
      { name: '轩逸', rue: '/轩逸' },
    ],
  },
  {
    cars: [
      { name: '捷途旅行者', rue: '/捷途旅行者' },
      { name: '丰田 RAV4', rue: '/丰田R4' },
      { name: '本田 CR5', rue: '/本田 CR5' },
    ],
  },
  // 增加其他类别
  {
    cars: [
      { name: '别克 GL8', rue: '/别克 GL8' },
      { name: '广汽传祺 M8', rue: '/广汽传祺 M8' },
      { name: '本田 奥德赛', rue: '/本田.奥德赛' },
    ],
  },
  {
    cars: [
      { name: '奔驰 C级', rue: '/奔驰C级' },
      { name: '宝马 5系', rue: '/宝马5系' },
      { name: '奥迪 A6', rue: '/奥迪A6' },
    ],
  },
  {
    cars: [
      { name: '保时捷 911', rue: '/保时捷911' },
      { name: '红旗H9', rue: '/红旗H9' },
      { name: '沃尔沃S60', rue: '/沃尔沃S60' },
    ],
  },
])
// 定义汽车类别和对应汽车信息的数组
</script>

<style scoped>
.containerr {
  padding: 10px;
  position: relative;
  left: 250px;
  font-size: 14px;
}

.category-row {
  position: absolute;
  /* 均匀分布类别 */
  display: inline-flex;
  white-space: nowrap; /* 防止折行 */
  overflow-x: auto; /* 水平滚动，防止超出 */
}

.category-item {
  display: flex;
  text-align: center; /* 让内容居中 */
}

.category-icon {
  font-size: 1.5em;
  margin-bottom: 5px;
}

.category-name {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.car-item {
  padding: 5px;
}

.car-name {
  margin-bottom: 3px;
}

.car-links {
  font-size: 0.75em;
  color: #888;
}

.car-links span {
  margin: 0 3px;
}
.rx1 {
  text-decoration: none;
  color: #000;
  font-weight: 400;
  font-size: 17px;
}
.rx2 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}
.rx3 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}
.rx4 {
  text-decoration: none;
  color: #a19d9d;
  font-weight: 400;
  font-size: 15px;
}
.rx2:hover,
.rx3:hover,
.rx4:hover {
  color: rgb(84, 71, 71);
}
.rx1:hover {
  font-weight: 800;
  transition: all 0.3s;
}
</style>
