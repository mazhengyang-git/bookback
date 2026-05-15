<template>
  <div class="wave" v-cloak>
    <!-- 活动内容 -->
    <div class="buttrq">
      <h2 class="logo sci-fi-title">星途科幻图书</h2>
      <div style="position: relative; white-space: nowrap; left: -69px; margin-right: 40px">
        <el-button class="huodong-button1" type="primary" @click="router.push('/')">返回首页</el-button>
        <el-button
          :class="{ active: xianshi === false }"
          class="huodong-button"
          type="primary"
          @click="xianshi = false"
        >读书活动</el-button>
        <el-button
          :class="{ active: xianshi === true }"
          class="huodong-button"
          type="primary"
          @click="xianshi = true"
        >图书资讯</el-button>
        <el-button class="huodong-button" type="primary" @click="router.push('/books')">图书商城</el-button>
      </div>

      <!-- 未登录 -->
      <div
        class="dzwy1"
        style="position: absolute; left: 1000px; margin-left: 30px"
        v-if="!userStore.isLogin"
      >
        <el-button
          style="padding: 5px; color: black; font-weight: 600; font-size: 20px; margin-left: 30px"
          class="szi"
          type="primary"
          link
          @click="go('/login')"
        >登录</el-button>
        <el-button
          style="padding: 5px; color: black; font-weight: 600; font-size: 20px"
          class="szi"
          type="primary"
          link
          @click="go('/register')"
        >注册</el-button>
      </div>

      <!-- 已登录 -->
      <div v-else class="login-bar">
        <el-button
          style="position: relative; background-color: #d5d3d0; font-size: 17px; color: black"
          link
          @click="go('/user')"
        ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button>
        <el-button
          style="position: relative; background-color: #d5d3d0; font-size: 17px; color: red"
          link
          @click="go('/cart')"
        ><img
            class="gwdh"
            style="width: 24px; height: auto; margin-right: 3px"
            src="/img/购物车.png"
          />购物车</el-button>
        <el-button
          style="color: white; background-color: red; position: relative"
          type="danger"
          link
          @click="handleLogout"
        >退出</el-button>
        <span
          style="
            position: relative;
            color: green;
            font-size: 16px;
            margin-left: 9px;
            font-weight: 700;
            z-index: 3000 !important;
          "
          class="hywy"
        >欢迎：{{ userStore.user?.username }}</span>
      </div>
    </div>

    <div class="huodong-container">
      <!-- 读书活动 -->
      <div v-show="xianshi === false" class="home-reading-events section-glow">
        <h2 class="sci-fi-title">读书活动</h2>
        <div v-if="huodongList.length === 0" class="empty-tip"></div>
        <div v-else class="events-list">
          <el-card v-for="e in huodongList" :key="e.id" class="event-card">
            <div class="hddbj">
              <h3>
                <span @click="tz(e)" style="cursor: pointer;">{{ e.title }}</span>
                <span class="notice-tag" style="user-select: none;">{{ getStatusText(e.status) }}</span>
              </h3>
            </div>
            <p class="event-time">时间：{{ e.time }}</p>
            <p>{{ e.content }}</p>
          </el-card>
        </div>
      </div>

      <!-- 图书资讯 -->
      <div v-show="xianshi === true" class="home-book-news section-glow">
        <h2 class="sci-fi-title">图书资讯</h2>
        <div v-if="zixunList.length === 0" class="empty-tip">
          <el-empty class="zixunzi" description="暂无图书资讯" />
        </div>
        <div v-else class="news-list">
          <div v-for="news in zixunList" :key="news.id" class="news-item">
            <h3 class="zixunzi1">{{ news.title }}</h3>
            <p class="zixunzi1">{{ news.content }}</p>
            <span style="margin-top: 5px" class="news-time">{{ news.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElEmpty, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getHuodongListApi } from '@/api/front/huodong'
import { getZixunListApi } from '@/api/front/zixun'
import type { Huodong } from '@/types/front/huodong'
import type { Zixun } from '@/types/front/zixun'

const userStore = useUserStore()
const router = useRouter()
const xianshi = ref(true)

const huodongList = ref<Huodong[]>([])
const zixunList = ref<Zixun[]>([])
const random = ref<Huodong[]>([])


async function getHuodongList() {
  const res = await getHuodongListApi()//@ts-ignore
  if (res.code === 200) {//@ts-ignore
    huodongList.value = res.data
  }
}

async function getZixunList() {
  const res = await getZixunListApi()//@ts-ignore
  if (res.code === 200) {//@ts-ignore
    zixunList.value = res.data
  }
}
//@ts-ignore
function go(path) {
  setTimeout(() => router.push(path), 10)
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 随机推荐
function getRandomList(list: any[], count = 4) {
  if (!list || list.length === 0) return []
  const hdcopy = [...list]
  for (let i = hdcopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[hdcopy[i], hdcopy[j]] = [hdcopy[j], hdcopy[i]]
  }
  return hdcopy.slice(0, count)
}

// 状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '快结束'
    case 3: return '已结束'
    case 4: return '已取消'
    default: return '未知'
  }
}

// 跳转
const tz = (e: Huodong) => {
  if (!e || !e.id || !e.title) return
  router.push(`/activity/${e.id}/${encodeURIComponent(e.title)}`)
}

onMounted(async () => {
  // 先获取数据，再执行随机
  window.scrollTo(0,0)
  await getHuodongList()
  await getZixunList()
  random.value = getRandomList(huodongList.value, 4)
})
</script>

<style scoped>
.gwdh {
  animation: gwdh 2s infinite;
}
@keyframes gwdh {
  0%,100% { transform: scale(1) rotate3d(0, 0, 0, 0deg); }
  25% { transform: scale(1.1) rotate3d(0, 1, 0, 10deg); }
  50% { transform: scale(1.1) rotate3d(0, 1, 1, 12deg); }
  75% { transform: scale(1.1) rotate3d(0, 1, 0, 10deg); }
}
.dzwy1 {
  position: relative;
  white-space: nowrap;
  top: 20px;
  margin-right: 116px;
  right: clamp(-80px, 4.5vw, -30px);
}
.login-bar {
  display: flex;
  position: absolute;
  margin-left: 990px;
  align-items: center;
  margin-top: 20px;
  white-space: nowrap;
}
.login-bar span {
  white-space: nowrap;
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}
.logo {
  position: relative;
  display: block;
  left: -299px;
  top: -9px;
  white-space: nowrap;
}
.buttrq {
  position: sticky;
  z-index: 1000;
  display: flex;
  background-color: rgb(233, 232, 232);
  top: 0;
  height: 83.7px;
  justify-content: center;
}
.huodong-button {
  margin-top: 20px;
  margin-left: 18px;
  margin-bottom: 20px;
}
:deep(.huodong-button1) {
  color: #000 !important;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  background-color: #fff !important;
  transition: all 0.3s ease;
}
:deep(.huodong-button) {
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  color: #000 !important;
  background-color: #fff !important;
  transition: all 0.3s ease;
}
:deep(.huodong-button1:hover),
:deep(.huodong-button:hover) {
  color: #099c2e !important;
  background-color: #fff !important;
  box-shadow: 0 2px 8px rgba(1, 175, 255, 0.15);
}
:deep(.huodong-button.active) {
  color: #000 !important;
  font-weight: 700;
  background: linear-gradient(180deg, #e6693c97 25%, #ceda5d 50%, #e6693c97 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease-in-out;
}
.huodong-button1 {
  margin-top: 20px;
  margin-left: 30px;
  margin-bottom: 20px;
}
.notice-tag {
  padding: 2px 6px;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
  flex-shrink: 0;
}
.wave {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  z-index: 1;
}
.wave::before {
  content: '';
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f4f8;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233aa8ec' fill-opacity='0.12' d='M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,160C672,139,768,149,864,160C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%236288a5' fill-opacity='0.09' d='M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: 1440px 320px, 1440px 320px;
  background-repeat: repeat-x;
  animation: waveMove 18s linear infinite;
  z-index: -1;
  pointer-events: none;
}
@keyframes waveMove {
  0% { background-position: 0 0, 0 120px; }
  100% { background-position: 1440px 0, -1440px 120px; }
}
.huodong-container {
  min-height: 100vh;
  width: 80vw;
  margin-left: 9.36vw;
  z-index: 1000;
  margin-top: 4px;
}
.home-reading-events {
  width: 100%;
  min-height: 660px;
  position: relative;
  background: #fff;
  padding: clamp(15px, 2vw, 20px);
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  margin-bottom: 80.2px;
}
.event-card {
  padding: clamp(15px, 2vw, 20px);
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  border-radius: clamp(8px, 1vw, 12px);
  margin-top: 5px;
}
.event-time {
  color: #666;
  font-size: clamp(12px, 1vw, 14px);
  margin: clamp(5px, 0.5vw, 8px) 0;
  user-select: none;
}
.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #2790f8;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  animation: titlePulse 2s infinite alternate;
}
@keyframes titlePulse {
  0% { text-shadow: 0 0 15px rgba(255,255,255,0.3); }
  100% { text-shadow: 0 0 25px rgba(78,79,79,0.768); }
}
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}
.section-glow {
  border: 1px solid rgba(64, 158, 255, 0.12) !important;
  border-radius: clamp(10px, 1.2vw, 16px) !important;
  box-shadow:
    0 0 15px rgba(64,158,255,0.06),
    0 4px 20px rgba(46,117,248,0.21),
    inset 0 1px 0 rgba(255,255,255,0.8) !important;
  position: relative;
  margin: -1px !important;
  padding: 1px !important;
}
.section-glow::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(64,158,255,0.5) 30%,
    rgba(100,181,246,0.8) 50%,
    rgba(64,158,255,0.5) 70%,
    transparent 100%
  );
  z-index: 2;
  border-radius: clamp(10px,1.2vw,16px) clamp(10px,1.2vw,16px) 0 0;
  animation: glowLine 4s ease-in-out infinite alternate;
}
@keyframes glowLine {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}
.event-card:hover {
  border-color: rgba(64,158,255,0.3) !important;
  box-shadow:
    0 6px 20px rgba(64,158,255,0.1),
    0 4px 15px rgba(0,0,0,0.15) !important;
  transform: translateY(-2px);
}
.home-book-news {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: clamp(20px,2.5vw,30px);
  margin: clamp(30px,3.5vw,40px) 0;
  width: 80vw;
}
.news-list {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 80.2px;
}
.news-item {
  padding: clamp(18px,3vw,33px);
  margin-top: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}
.news-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.zixunzi { margin-top: 5px; color: #000; }
.zixunzi1 { margin-top: 5px; color: #000; }
.news-time { margin-top: 5px; color: #666; user-select: none; }
</style>

<style>
.hddbj {
  background-color: #e7e7e760 !important;
}
:deep(.hddbj) {
  background-color: #e7e7e760 !important;
  display: block;
  width: 100%;
}
</style>
<style scoped>
.gwdh {
  animation: gwdh 2s infinite;
  
}
@keyframes gwdh {
  0%,
  100% {
    transform: scale(1) rotate3d(0, 0, 0, 0deg);
  }
  25% {
    transform: scale(1.1) rotate3d(0, 1, 0, 10deg);
  }
  50% {
    transform: scale(1.1) rotate3d(0, 1, 1, 12deg);
  }
  75% {
    transform: scale(1.1) rotate3d(0, 1, 0, 10deg);
  }
}
.dzwy {
  position: relative;
  /* 偏移量响应式 */
  margin-right: 116px;
  right: clamp(30px, 4.5vw, 0px);
}
.dzwy1 {
  position: relative;
  /* 偏移量响应式 */
  white-space: nowrap;
  top: 20px;
  margin-right: 116px;
  right: clamp(-80px, 4.5vw, -30px);
}
.login-bar {
  display: flex;
  position: absolute;
  margin-left: 990px;
  align-items: center;
  margin-top: 20px;
  white-space: nowrap;
}
.login-bar span {
  white-space: nowrap;
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}
.logo {
  position: relative;
  display: block;
  left: -299px;
  top: -9px;
  white-space: nowrap;
}
.buttrq {
  position: sticky;
  z-index: 1000;
  display: flex;
  background-color: rgb(233, 232, 232);
  top: 0;
  height: 83.7px;

  justify-content: center;
}
.huodong-button {
  margin-top: 20px;
  margin-left: 18px;
  margin-bottom: 20px;
}
:deep(.huodong-button1) {
  color: #000 !important;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  background-color: rgb(255, 255, 255) !important;
  transition: all 0.3s ease;
}
:deep(.huodong-button) {
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  color: #000 !important;
  background-color: rgb(255, 255, 255) !important;
  transition: all 0.3s ease;
}
:deep(.huodong-button1:hover),
:deep(.huodong-button:hover) {
  color: #099c2e !important;
  background-color: rgb(255, 255, 255) !important;
  box-shadow: 0 2px 8px rgba(1, 175, 255, 0.15);
}

:deep(.huodong-button.active) {
  color: #000000 !important;
  font-weight: 700;
  background: linear-gradient(180deg, #e6693c97 25%, #ceda5d 50%, #e6693c97 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease-in-out;
}

.huodong-button1 {
  margin-top: 20px;
  margin-left: 30px;
  margin-bottom: 20px;
}
</style>
<style scoped>


.notice-tag {
  padding: 2px 6px;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
  flex-shrink: 0;
}
.wave {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  z-index: 1;
}
.wave::before {
  content: '';
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f0f4f8;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233aa8ec' fill-opacity='0.12' d='M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,160C672,139,768,149,864,160C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%236288a5' fill-opacity='0.09' d='M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E");
  background-size:
    1440px 320px,
    1440px 320px;
  background-repeat: repeat-x;
  animation: waveMove 18s linear infinite;
  z-index: -1;
  pointer-events: none;
}

@keyframes waveMove {
  0% {
    background-position:
      0 0,
      0 120px;
  }
  100% {
    background-position:
      1440px 0,
      -1440px 120px;
  }
}

/* 容器 */
.huodong-container {
  min-height: 100vh;
  width: 80vw;
  
  margin-left: 9.36vw;
  z-index: 1000;
  margin-top: 4px;
}

/* 读书活动 */
.home-reading-events {
  width: 100%;
  min-height: 660px;
  position: relative;
  background: #ffffff;
  padding: clamp(15px, 2vw, 20px);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
  margin-bottom: 80.2px;
}

.event-card {
  padding: clamp(15px, 2vw, 20px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: clamp(8px, 1vw, 12px);
  margin-top: 5px;
 
}

.event-time {
  color: #666;
  font-size: clamp(12px, 1vw, 14px);
  margin: clamp(5px, 0.5vw, 8px) 0;
  user-select: none;
  position: relative;
}

/* 标题样式 */
.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #2790f8;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  animation: titlePulse 2s infinite alternate;
}

@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(78, 79, 79, 0.768);
  }
}

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
}

/* 区域发光边框效果 */
.section-glow {
  border: 1px solid rgba(64, 158, 255, 0.12) !important;
  border-radius: clamp(10px, 1.2vw, 16px) !important;
  box-shadow:
    0 0 15px rgba(64, 158, 255, 0.06),
    0 4px 20px rgba(46, 117, 248, 0.21),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  position: relative;
  margin: -1px !important;
  padding: 1px !important;
}

/* 区域顶部高光条 */
.section-glow::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(64, 158, 255, 0.5) 30%,
    rgba(100, 181, 246, 0.8) 50%,
    rgba(64, 158, 255, 0.5) 70%,
    transparent 100%
  );
  z-index: 2;
  border-radius: clamp(10px, 1.2vw, 16px) clamp(10px, 1.2vw, 16px) 0 0;
  animation: glowLine 4s ease-in-out infinite alternate;
}

@keyframes glowLine {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 活动卡片增强 */
.event-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  border: 1px solid rgba(64, 158, 255, 0.12) !important;
  transition: all 0.3s ease !important;
}

.event-card:hover {
  border-color: rgba(64, 158, 255, 0.3) !important;
  box-shadow:
    0 6px 20px rgba(64, 158, 255, 0.1),
    0 4px 15px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

/* 图书资讯区域 */
.home-book-news {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: clamp(20px, 2.5vw, 30px);
  margin: clamp(30px, 3.5vw, 40px) 0;
  width: 80vw;
}
.news-list {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 80.2px;
}
/* 资讯卡片 */
.news-item {
  /* 布局 */
  padding: clamp(18px, 3vw, 33px);
  margin-top: 25px;
  cursor: pointer;
  /* 视觉效果 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.news-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.zixunzi {
  margin-top: 5px;
  color: #000000;
}

.zixunzi1 {
  margin-top: 5px;
  color: #000000;
}
.news-time {
  margin-top: 5px;
  color: #666;
  user-select: none;
}
</style>
<style>
.hddbj{
 background-color: #e7e7e760 !important;
}
:deep(.hddbj) {
  background-color: #e7e7e760 !important;
  display: block;
  width: 100%;
}
</style>