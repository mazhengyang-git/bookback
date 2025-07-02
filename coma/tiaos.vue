<template>
  <div class="zongg">
    <div class="n11">
      <img />
      <div>
        <router-link to="" @click="zuoxian">
          <img class="stu" src="../img/三横杠.png"
        /></router-link>
        <router-link class="sa1" to="">探索车型</router-link>
        <router-link class="sa2" to="">预约品鉴</router-link>
        <router-link class="sa3" to="">找经销商</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, provide, inject } from 'vue'
let zuox = inject('zuox')
let zuoxian = () => {
  if (zuox.value === true) {
    zuox.value = false
  } else {
    zuox.value = true
  }
}
</script>
<style scoped>
.n11 {
  position: relative;
  margin-left: 80px;
}

.stu {
  margin-right: 25px;
  width: 30px;
  height: 30px;
  top: -3px;
  position: relative;
}
.sa1,
.sa2,
.sa3 {
  color: aliceblue;
  text-decoration: none;
  position: relative;
  display: inline-flex;
  top: -12px;
}
.sa1 {
  transition: all 0.5s;
  margin-right: 20px;
}
.sa2 {
  transition: all 0.5s;
  margin-right: 20px;
}
.sa3 {
  transition: all 0.5s;
}
.sa1:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #ede325;
  top: -11.75px;
  font-weight: 700;
  transform: rotateY(20deg);
}
.sa2:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #ede325;
  top: -11.75px;
  transform: rotateY(20deg);
  font-weight: 700;
}
.sa3:hover {
  transform: scale(1.1);
  transition: all 0.5s;
  color: #ede325;
  top: -11.75px;
  transform: rotateY(20deg);
  font-weight: 700;
}
</style>
