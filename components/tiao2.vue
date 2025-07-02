<template>
  <div class="zongg">
    <div>
      <div class="n11">
        <div style="position: relative; display: flex; margin-left: 305px !important; top: 5px">
          <router-link class="a11" to="/">首页</router-link>
          <a class="a2" href="#">更多品牌</a>
          <span @mouseenter="showhove = true" @mouseleave="showhove = false"
            ><a class="a3" href="#">关于我们</a></span
          >

          <span @mouseenter="showhover = true" @mouseleave="showhover = false">
            <a class="a4" href="#">客服咨询</a>
          </span>
          <span @mouseenter="showhoverr = true" @mouseleave="showhoverr = false">
            <a class="a5" href="#">商业合作</a></span
          >
        </div>
      </div>
      <a
        v-show="showhoverr"
        @mouseenter="showhoverr = true"
        @mouseleave="showhoverr = false"
        href="#"
        class="a57"
        >品牌联名</a
      >
      <a
        v-show="showhoverr"
        @mouseenter="showhoverr = true"
        @mouseleave="showhoverr = false"
        href="#"
        class="a58"
        >项目投资</a
      >
      <a
        v-show="showhoverr"
        @mouseenter="showhoverr = true"
        @mouseleave="showhoverr = false"
        href="#"
        class="a59"
        >定制计划</a
      >
      <a
        v-show="showhover"
        @mouseenter="showhover = true"
        @mouseleave="showhover = false"
        class="a55"
        href="#"
        ><span style="margin-left: -6px !important">价格</span></a
      >
      <a
        v-show="showhover"
        @mouseenter="showhover = true"
        @mouseleave="showhover = false"
        class="a56"
        href="#"
        >详细参数</a
      >
      <a
        v-show="showhove"
        @mouseenter="showhove = true"
        @mouseleave="showhove = false"
        href="#"
        class="a60"
        >公司介绍</a
      >
      <router-link
        v-show="showhove"
        @mouseenter="showhove = true"
        @mouseleave="showhove = false"
        to="/金牌员工"
        class="a61"
        >金牌员工</router-link
      >
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
  //components: { Preson, people },
}
</script>
<script lang="ts" setup>
import { ref } from 'vue'
const showhover = ref(false)
const showhoverr = ref(false)
const showhove = ref(false)
const sr = ref({ name: '' })
const slength = () => {
  sr.value.name = sr.value.name.toString().replace(/[^\d]/g, '')
  if (sr.value.name && sr.value.name.toString().length > 11) {
    sr.value.name = sr.value.name.toString().slice(0, 11)
  }
  const num = Number(sr.value.name)
  if (sr.value.name && !isNaN(num) && num > 0 && sr.value.name.toString() !== 'e') {
    console.log('有效输入：', sr.value.name) // 可替换为实际逻辑
  } else {
    console.error('请输入有效的正数') // 改用更友好的提示方式（如 UItoast）
  }
}
</script>
<style>
template {
  overflow-y: scroll; /* 
   强制显示滚动条轨道（避免布局跳动） */
}

template::-webkit-scrollbar {
  width: 0 !important; /* 隐藏滚动条（Chrome/Safari） */
}

template {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /*IE/Edge */
}
.zongg {
  left: 16px;
  position: relative;
  display: inline-block;
}
.n11 {
  position: relative;
  margin-top: -5px;
}
.n1 a {
  display: inline-block;
  margin-top: 8px;
  text-decoration: none;
  color: aliceblue;
  padding-right: 45px;
  font-size: 26px;
}
.a11 {
  background-color: rgb(142, 85, 85);
  color: black !important;
  margin-top: 0px !important;
  height: auto;
  line-height: 60px;
  padding-left: 42.5px;
}

.a60:hover,
.a61:hover,
.a57:hover,
.a58:hover,
.a59:hover,
.a56:hover,
.a55:hover,
.a2:hover,
.a3:hover,
.a4:hover,
.a5:hover {
  background-color: rgb(151, 148, 142);
}

.v-show {
  display: flex !important;
}
</style>
