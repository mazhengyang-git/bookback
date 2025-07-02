<template>
  <div class="person1">
    <h1>姓名: {{ name }}</h1>
    <h2>年龄: {{ age }}</h2>
    <button @click="changeName">修改名字</button>
    <button @click="changeAge">修改age</button>
    <button @click="sg">查看{{ name }}爱好</button>
  </div>
</template>

<script lang="ts" name="Preson" setup>
import { ref } from 'vue'
let name = ref('牛')
let age = ref(19)
let aihao = '听离歌'
function changeName() {
  name.value = prompt('输入姓名')
}
function changeAge() {
  age.value = prompt('输入年龄')
}
function sg() {
  document.writeln(`<h2>${name.value}爱好:${aihao}</h2>`)
}
let p = [
  {
    ming: '猪头',
    jia: 12,
  },
  {
    ming: '牛头',
    jia: 18,
  },
]
</script>
<style scoped>
.person {
  background-color: aquamarine;
  border: 3px red solid;
}
.person1 {
  background-color: rgb(211, 6, 6);
  border: 3px red solid;
}
</style>
