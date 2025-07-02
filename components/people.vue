<template>
  <div class="car">
    <h2>车型名称{{ car.ming }}</h2>
    <h3>价格:{{ car.jia }}w</h3>
    <button @click="jia">输入新价格</button>
    <br />
    <ul>
      <li v-for="(u, b) in game" :key="(u.ming, u.pifu)">{{ u.ming }} {{ u.pifu }}</li>
    </ul>
    <h2>求和:{{ x }}</h2>
    <button @click="he">求和</button>

    <div style="background-color: rgb(23, 136, 13)">
      <h2>姓名:{{ ren.name }}</h2>
      <h3>年龄:{{ ren.age }}岁</h3>
      <button @click="gaimin">改名</button>
      <button @click="gaiage">换阳寿</button>
    </div>
  </div>
</template>

<script lang="ts" name="people" setup>
import { ref, reactive, toRefs } from 'vue'
let car = reactive({
  ming: '奔驰迈巴赫 s480',
  jia: 232.3,
})
let game = reactive([
  {
    ming: '卤蛋',
    pifu: '电玩小子',
  },
  {
    ming: '孙悟空',
    pifu: '齐天大圣',
  },
])
//Object.asso(car,{b:'',c:''})
function he() {
  let sum = +ref(prompt('输入第一个数'))
  let sum1 = +ref(prompt('输入第二个数'))
  sum = sum + sum1
  return sum.valueOf
}
let x = +he()
function jia() {
  car.jia = prompt('新价格输入')
}
let ren = reactive({
  name: '小三',
  age: 18,
})
let { name, age } = toRefs(ren)
function gaimin() {
  ren.name = '大美'
}
function gaiage() {
  ren.age = 99
}
</script>
<style>
.car {
  background-color: rgb(227, 111, 8);
  box-shadow: 0 0 10px;
  border: 3px rebeccapurple solid;
}
li {
  font-size: 20px;
}
</style>
