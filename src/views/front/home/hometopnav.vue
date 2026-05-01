<template>
  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo sci-fi-title">星途科幻图书</h2>
    </div>
    <div class="nav-center">
      <el-button class="sx" type="primary" @click="shoubookshuaxin">刷新页面</el-button>
      <div class="sejb">
        <div class="syws">
          <el-button link class="syse" @click="go('/huodong')">活动咨询</el-button>
        </div>
      </div>
      <div class="sejb" @mouseenter="mouseshow" @mouseleave="mouseleve">
        <div class="syws">
          <el-button link class="syse1" @click="go('/books')">图书商城</el-button>
          <span class="acwy">
            <!-- 严格按照截图从上到下顺序，14个分类完整无重复、路由100%对应 -->
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=太空歌剧')"
              >太空歌剧</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=赛博朋克')"
              >赛博朋克</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=时间旅行')"
              >时间旅行</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=智能纪元')"
              >智能纪元</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=外星文明')"
              >外星文明</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=末世废土')"
              >末世废土</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=星际灾厄')"
              >星际灾厄</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=虚幻惊悚')"
              >虚幻惊悚</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=星系攻略')"
              >星系攻略</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=次元交互')"
              >次元交互</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=梦灵空间')"
              >梦灵空间</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=自然谜团')"
              >自然谜团</el-button
            >
            <el-button v-if="showhover" class="ac1" @click="go('/books?category=平行宇宙')"
              >平行宇宙</el-button
            >
            <el-button v-if="showhover" class="ac2" @click="go('/books?category=意识陷落')"
              >意识陷落</el-button
            >
          </span>
        </div>
      </div>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索并进入图书商城"
        class="ssr"
        style="width: 280px; margin-right: 20px"
        @keyup.enter="handleToBookSearch"
        @clear="searchKeyword = ''"
        clearable
      >
        <template #suffix>
          <el-icon class="search-icon1" @click="handleToBookSearch">
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div class="nav-right">
      <!-- 未登录 -->
      <div class="dzwy" v-if="!userStore.isLogin">
        <el-button
          style="padding: 5px; color: black; font-weight: 600; font-size: 20px"
          class="szi"
          type="primary"
          link
          @click="go('/login')"
          >登录</el-button
        >
        <el-button
          style="padding: 5px; color: black; font-weight: 600; font-size: 20px"
          class="szi"
          type="primary"
          link
          @click="go('/register')"
          >注册</el-button
        >
      </div>
      <!-- 已登录 -->
      <div v-else class="login-bar" style="position: relative; left: 10px">
        <el-button
          style="position: relative; background-color: #d5d3d0; font-size: 17px; color: #000"
          link
          @click="go('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button
          style="position: relative; background-color: #d5d3d0; font-size: 17px; color: red"
          link
          @click="go('/cart')"
          ><img
            class="gwdh"
            style="width: 24px; height: auto; margin-right: 3px"
            src="/img/购物车.png"
          />购物车</el-button
        >
        <el-button
          style="color: white; background-color: red; position: relative"
          type="danger"
          link
          @click="handleLogout"
          >退出</el-button
        >
        <span
          style="
            position: relative;
            color: green;
            font-size: 16px;

            font-weight: 700;
            z-index: 3000 !important;
          "
          class="hywy"
          >欢迎：{{ userStore.user?.username }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 导航栏相关变量
const searchKeyword = ref<string>('')
const showhover = ref(false)
let timeleave: NodeJS.Timeout | null = null

// 定义 emits
const emit = defineEmits(['refresh'])

// 导航栏方法
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}

function mouseshow() {
  if (timeleave) clearTimeout(timeleave)
  showhover.value = true
}

function mouseleve() {
  timeleave = setTimeout(() => {
    if (showhover.value === true) {
      showhover.value = false
    }
  }, 450)
}

const shoubookshuaxin = () => {
  emit('refresh')
}

const handleToBookSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.info('请输入图书名称关键词')
    return
  }
  router.push({ path: '/books', query: { keyword } })
  searchKeyword.value = ''
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
/*导航栏：文字+完全居中对称+LOGO + 响应式缩放*/
.home-top-nav {
  /* 宽度响应式：最小700px，最大850px（原固定值），中间随屏幕缩放 */
  width: clamp(700px, 70vw, 850px);
  /* 高度响应式：最小50px，最大60px */
  height: clamp(50px, 5vw, 60px);
  background: rgba(212, 211, 211, 0.95);
  border-bottom: 1px solid rgba(254, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 clamp(10px, 2vw, 20px);
  top: 0;
  position: fixed;
  /* 偏移量响应式，保留原比例 */
  margin-left: clamp(-10px, -1.2vw, -12.5px);
  z-index: 199;
  /* 行高跟随高度 */
  line-height: clamp(50px, 5vw, 60px);
}

.nav-left {
  /* 宽度响应式 */
  width: clamp(180px, 20vw, 220px);
  flex-shrink: 0;
  text-align: left;
}
.logo {
  color: #409eff;
  /* LOGO文字响应式：最小18px，最大23px */
  font-size: clamp(18px, 2vw, 23px);
  white-space: nowrap;
  line-height: clamp(50px, 5vw, 60px);
  position: relative;
  /* 偏移量响应式，保留原布局 */
  left: clamp(-20px, -3.5vw, -30px);
  top: clamp(-6.6px, -1vw, -9px);
}
.nav-center {
  display: flex;
  /* 间距响应式 */
  gap: clamp(15px, 2vw, 25px);
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: fit-content;
  position: relative;
  left: 3%;
  margin-right: 9%;
}
.nav-right {
  /* 宽度响应式 */
  width: 380px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #e0e6ff;
  /* 间距响应式 */
  gap: clamp(8px, 1vw, 12px);
  white-space: nowrap;
}
.login-bar {
  display: flex;
  position: relative;

  align-items: center;

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
.login-bar1 {
  display: flex;
  position: relative;

  align-items: center;

  white-space: nowrap;
}
.login-bar1 span {
  white-space: nowrap;
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.hywy {
  position: static;
  margin-right: 96px;
  margin-left: 16px;
}

.sejb {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.ssr {
  color: #000000 !important;
}

/* 导航栏：在后面合并 */
.home-top-nav {
  display: flex;

  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(14px, 3vw, 20px);
  height: clamp(50px, 5vw, 60px);
  border-bottom: 1px solid #eee;
  animation: tiao 0.5s forwards ease-in;
  opacity: 0.9;
  background: linear-gradient(
    180deg,
    rgba(215, 213, 213, 0.98) 0%,
    rgba(160, 158, 158, 0.612) 50%,
    rgba(215, 213, 213, 0.98) 100%
  );
  border-bottom: 1px solid rgba(5, 44, 84, 0.3);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  width: 100vw;
  z-index: 88888;
}
.home-top-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(210, 212, 210, 0.558), transparent);
  animation: navShine 6s infinite linear;
  z-index: -1;
}
@keyframes navShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.dzwy {
  position: relative;
  /* 偏移量响应式 */
  margin-right: 116px;
  right: clamp(30px, 4.5vw, 0px);
}

@keyframes tiao {
  0% {
    /* 动画尺寸响应式 */
    height: clamp(90px, 9vw, 110px);
    opacity: 0.7;
  }
  25% {
    height: clamp(90px, 9vw, 110px);
    opacity: 1;
  }
  50% {
    height: clamp(75px, 7.5vw, 90px);
    opacity: 1;
  }
}

/* ========== 导航按钮视觉 ========== */
.syws {
  background: #ffffff;
  border: 1px solid rgba(64, 158, 255, 0.3);
  display: flex;

  border-radius: clamp(4px, 0.5vw, 6px);
  padding: clamp(4px, 0.5vw, 6px) clamp(10px, 1.2vw, 14px);
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.syws:hover {
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}
/*导航按钮样式*/
.syse,
.syse1 {
  color: #000000;
  font-size: clamp(14px, 1.2vw, 16px);
  text-decoration: none;
  line-height: 1.2;
  transition: all 0.3s ease;
}
.syse:hover,
.syse1:hover {
  color: #ec8f33;
  text-shadow: 0 0 8px rgba(220, 223, 226, 0.5);
}
.sx {
  position: relative;
  margin-left: 6px;

  background: #ffffff;
  border-radius: 10px;
  border: none !important;
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  color: #000000 !important;
  right: clamp(20px, 2.5vw, 30px);
  padding-left: clamp(4px, 0.3vw, 6px);
  padding-right: clamp(4px, 0.3vw, 6px);
}
.sx:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(64, 160, 255, 0.549);
}

.acwy {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 所有子按钮强制100%等宽，完全统一 */
  /* 核心居中：和父按钮严格水平居中，零偏移 */
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  margin-top: 2px; /* 和父按钮轻微间距，不遮挡 */
}

/* 所有按钮统一基础样式：宽度、内边距、盒模型完全统一，全部对齐 */
.ac1,
.ac2 {
  /* 统一固定宽度，所有按钮完全等宽 */
  width: clamp(101px, 10vw, 117.7px) !important;
  padding: 7px 20px !important;
  height: auto !important;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
  margin: 0 !important; /* 清除所有自带外边距 */
  border: 1px soild black !important;
}

/* 奇数按钮：仅顶部圆角，底部直角无缝衔接下一个按钮 */
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  /* 完全删除旧代码所有硬编码 left 偏移！！！ */
  left: unset !important;
}

/* 偶数按钮：仅底部圆角，顶部直角无缝衔接上一个按钮 */
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px; /* 消除按钮之间的1px白边缝隙，上下完美拼接 */
  /* 完全删除旧代码所有硬编码 left 偏移！！！ */
  left: unset !important;
}
</style>

<style scoped>
/* 整合导入组件CSS：按钮交互效果 + 大厂风格视觉优化 */
/* 增强的按钮交互效果 */
.syws {
  transition: all 0.2s ease-out;
}

.syws:hover {
  transform: translateY(-1px);
}
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
</style>
