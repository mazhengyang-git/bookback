<template>
  <div class="zong">
    <div>
      <div class="ju">
        <span class="s1" v-show="sr"
          ><span style="color: rgb(466, 1129, 68) !important">欢迎:</span> {{ sr.name }}&nbsp;</span
        >
        <span
          ><input
            style="position: absolute; left: 3px; top: 88px; width: 180px; height: 30px"
            type="text"
            v-model="sr.name"
            @input="slength"
            maxlength="11"
            placeholder="输入手机号"
            inputmode="numeric"
        /></span>
      </div>
      <div class="n1">
        <div style="position: relative; display: flex; margin-left: 305px !important">
          <a class="a1" href="#">首页</a>
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
        to="/jinpai"
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
import { useRouter } from 'vue-router'

const router = useRouter()
const jp = () => {
  router.push('/')
}
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
.s1 {
  position: absolute;

  top: 1px;
  color: aliceblue;
  font-size: 26px;
}
.ju {
  display: block;
  position: relative;
  margin-left: 15px !important;
}
.zong {
  position: absolute;
  z-index: 9500;
  transition: all 0.5s;
}
.n1 {
  position: relative;
}
.n1 a {
  display: inline-block;
  margin-top: 8px;
  text-decoration: none;
  color: aliceblue;

  font-size: 26px;
  transition: all 0.5s;
}
.a1 {
  background-color: rgb(230, 220, 229);
  color: black !important;
  margin-top: 0px !important;
  height: 60px;
  line-height: 60px;
  padding-left: 43px;
}
.a2,
.a3,
.a4,
.a5 {
  margin-top: 0.5px !important;
  line-height: 60px;
  padding-left: 42.5px;
  flex-direction: column;
}

.a55 {
  color: aliceblue;
  position: absolute;
  top: 61px;

  width: 147.5px;
  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  padding-right: 158px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
}
.a55,
.a56 {
  left: 797px !important;
}
.a56 {
  color: aliceblue;
  position: absolute;
  top: 122px;
  width: 104.5px;
  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  padding-left: 43px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
}
.a57 {
  color: aliceblue;
  position: absolute;
  top: 61px;

  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
  padding-left: 42.5px;
}
.a58 {
  color: aliceblue;
  position: absolute;
  top: 122px;

  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  display: none;
  padding-left: 42.5px;
}
.a59 {
  color: aliceblue;
  position: absolute;
  top: 183px;

  padding-left: 42.5px;
  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
}
.a57,
.a58,
.a59 {
  left: 988.79997px !important;
}
.a60 {
  color: aliceblue;
  position: absolute;
  top: 61px;
  width: 104.5px;
  padding-left: 42.5px;
  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
}
.a61 {
  color: aliceblue;
  position: absolute;
  top: 122px;
  width: 104.5px;
  padding-left: 42.5px;
  background-color: rgb(171, 35, 35);
  margin-left: 30px;
  margin-top: 0.5px !important;
  line-height: 60px;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  display: none;
}
.a60,
.a61 {
  left: 605.2645px;
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
