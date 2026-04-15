<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="doubao-entrance" ref="doubaoBtn" @mousedown="handleMouseDown" draggable="false">
    <a
      href="https://www.doubao.com"
      target="_blank"
      rel="noopener noreferrer"
      class="doubao-btn"
      draggable="false"
      @click="handleLinkClick"
    >
      <img class="doubao" src="/img/doubao.png" alt="豆包" draggable="false" />
    </a>
  </div>
  <div class="login-bar1" style="position: fixed">
    <span
      style="
        position: absolute;
        color: green;
        font-size: 17px;
        top: 17px;
        left: 1347px;
        margin-right: 10px;
        font-weight: 700;
        z-index: 3000 !important;
      "
      >欢迎：{{ userStore.user?.username }}</span
    >
  </div>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="home-top-nav">
      <div class="nav-left">
        <h2 class="logo sci-fi-title">星途科幻图书</h2>
      </div>
      <div class="nav-center">
        <div class="sejb">
          <div class="syws">
            <el-button link class="syse" @click="go('/home')">首页</el-button>
          </div>
        </div>
        <div class="sejb" @mouseenter="mouseshow" @mouseleave="mouseleve">
          <div class="syws">
            <el-button link class="syse1" @click="go('/books')">图书商城</el-button>
            <span class="acwy"
              ><el-button v-if="showhover" class="ac1" @click="go('/books?category=软科幻')"
                >软科幻</el-button
              ><el-button v-if="showhover" class="ac2" @click="go('/books?category=硬科幻')"
                >硬科幻</el-button
              ></span
            >
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
        <el-button class="sx" type="primary" @click="shoubookshuaxin">刷新页面</el-button>
      </div>
      <div class="nav-right">
        <!-- 未登录 -->
        <div class="dzwy" v-if="!userStore.isLogin">
          <el-button class="szi" type="primary" link @click="go('/login')">登录</el-button>
          <el-button class="szi" type="primary" link @click="go('/register')">注册</el-button>
        </div>
        <!-- 已登录 -->
        <div v-else class="login-bar">
          <el-button
            style="position: relative; left: -70px; background-color: #d5d3d0"
            link
            @click="go('/user')"
            ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
          >
          <el-button
            style="position: relative; left: -74px; background-color: #d5d3d0"
            link
            @click="go('/cart')"
            ><img style="width: 24px; height: auto" src="/img/购物车.png" />购物车</el-button
          >
          <el-button
            style="color: white; background-color: red; position: relative; left: -60px"
            type="danger"
            link
            @click="handleLogout"
            >退出</el-button
          >
        </div>
      </div>
    </div>
    <div class="home-top-nav1"></div>

    <!-- 轮播 （增加v-if避免空数据渲染） -->
    <div class="home-banner" v-if="slidesLoaded">
      <div class="banner-content">
        <lunbotu :key="refshua" />
      </div>
    </div>

    <!-- 科幻分类 -->
    <div class="home-category">
      <hr class="hr1" />
      <p class="banner-desc1">探索宇宙的无限可能，尽在星途科幻图书电商平台</p>
      <el-button class="wy" type="primary" size="large" @click="go('/books')">
        进入图书商城
      </el-button>
      <h2 class="sci-fi-title1">科幻分类</h2>
      <div class="category-list">
        <el-card class="category-card1" @click="go('/books?category=软科幻')">
          <div class="category-icon">🧠</div>
          <h3>软科幻</h3>
          <p>侧重人文/社会的科幻作品</p>
        </el-card>
        <el-card class="category-card" @click="go('/books?category=硬科幻')">
          <div class="category-icon">🔭</div>
          <h3>硬科幻</h3>
          <p>基于科学原理的科幻作品</p>
        </el-card>
      </div>
    </div>

    <!-- 热门图书 -->
    <div class="home-hot-book">
      <div>
        <h2 class="sci-fi-title">热门科幻图书</h2>
      </div>
      <!-- 空数据提示 -->
      <div v-if="hotBooks.length === 0" class="empty-tip">
        <el-empty description="暂无热门图书数据" />
      </div>
      <div v-else class="hot-book-list">
        <el-card
          v-for="book in hotBooks"
          :key="book.id"
          class="hot-book-card"
          @click="go(`/book/${book.id}`)"
          v-loading="!book.id"
        >
          <!--@vue-ignore-->
          <img
            :src="book.cover || '/img/default-book.jpg'"
            alt="图书封面"
            class="hot-book-cover"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <h3>{{ book.name || '未知图书' }}</h3>
          <p>作者：{{ book.author || '未知作者' }}</p>
          <p class="hot-book-price">¥{{ formatPrice(book.price) }}</p>
        </el-card>
      </div>
    </div>
    <span
      ref="doubaoBtn1"
      @mousedown="handleMouseDown1"
      draggable="false"
      style="position: fixed; left: 16px; top: 380px; z-index: 999; cursor: move"
    >
      <button
        class="notice-btn"
        @click="notandmouse"
        style="position: static; transform: none"
        rel="noopener noreferrer"
        draggable="false"
      >
        🔔 系统公告
      </button></span
    >

    <!-- 右侧渐变背景公告抽屉 -->
    <div class="notice-drawer" :class="showNotice ? 'open' : 'close'">
      <div class="drawer-header">
        <h3>官方公告</h3>
        <span class="close" @click="closeNotice">×</span>
      </div>

      <div class="notice-content">
        <div v-for="item in noticeList" :key="item.id" class="notice-item">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
          <span>{{ item.create_time }}</span>
        </div>
        <div v-if="noticeList.length === 0" class="empty">暂无公告</div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div class="mask" v-if="showNotice" @click="closeNotice"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElEmpty } from 'element-plus'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/store/book'
import { Hide, Search } from '@element-plus/icons-vue'
import lunbotu from '@/views/front/home/lunbotu.vue'
import { getAnnouncementList } from '@/api/front/announcement'
import type { Announcement } from '@/types/index'
const allImagesLoaded = ref(false)
// 初始化变量
const userStore = useUserStore()
const router = useRouter()
const bookStore = useBookStore()

const hotBooks = ref<Book[]>([])
const refshua = ref(0)
const searchKeyword = ref<string>('')
const slidesLoaded = ref(false)
const bgSrc = bookStore
const showNotice = ref(0)
// 公告列表
const noticeList = ref<Announcement[]>([])
const doubaoBtn = ref(null)
const doubaoBtn1 = ref(null)
const isDragging = ref(false)
const hasDragged1 = ref(false) //@ts-ignore
const hasDragged = ref(false) //@ts-ignore
const startPos = ref({ x: 0, y: 0 })
const currentPos = ref({ x: 6, y: 110 })
const DRAG_THRESHOLD = 5
const isDragging1 = ref(false)
const startPos1 = ref({ x: 0, y: 0 })
const currentPos1 = ref({ x: 6, y: 380 })
const DRAG_THRESHOLD1 = 5
// 安全跳转：解决首次点击卡顿/转圈
//@ts-ignore
let timeleave: NodeJS.Timeout | null = null
const showhover = ref(false)
function mouseleve() {
  timeleave = setTimeout(() => {
    if (showhover.value === true) {
      showhover.value = false
    }
  }, 450)
}
function mouseshow() {
  if (timeleave) clearTimeout(timeleave)
  showhover.value = true
}
function notandmouse() {
  if (hasDragged1.value) {
    //@ts-ignore
    handleLinkClick1()
    showNotice.value === 1
    return
  }
  if (showNotice.value === 1) {
    showNotice.value = 0
    return
  } else {
    openNotice()
  }
} //@ts-ignore
function go(path) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}
// 拆分鼠标按下事件（区分拖动/点击）
//@ts-ignore
const handleMouseDown = (e) => {
  isDragging.value = true
  hasDragged.value = false
  const startX = e.clientX
  const startY = e.clientY
  const initialLeft = currentPos.value.x
  const initialTop = currentPos.value.y //@ts-ignore
  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
      hasDragged.value = true
    }
    currentPos.value.x = initialLeft + deltaX
    currentPos.value.y = initialTop + deltaY
    if (doubaoBtn.value) {
      //@ts-ignore
      doubaoBtn.value.style.left = currentPos.value.x + 'px' //@ts-ignore
      doubaoBtn.value.style.top = currentPos.value.y + 'px'
    }
  }
  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  // 添加全局事件
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
} //@ts-ignore
const handleMouseDown1 = (p) => {
  isDragging1.value = true
  hasDragged1.value = false
  const startX1 = p.clientX
  const startY1 = p.clientY
  const initialLeft1 = currentPos1.value.x
  const initialTop1 = currentPos1.value.y //@ts-ignore
  const handleMouseMove1 = (e) => {
    const deltaX1 = e.clientX - startX1
    const deltaY1 = e.clientY - startY1
    if (Math.abs(deltaX1) > DRAG_THRESHOLD1 || Math.abs(deltaY1) > DRAG_THRESHOLD1) {
      hasDragged1.value = true
    }
    currentPos1.value.x = initialLeft1 + deltaX1
    currentPos1.value.y = initialTop1 + deltaY1
    if (doubaoBtn1.value) {
      //@ts-ignore
      doubaoBtn1.value.style.left = currentPos1.value.x + 'px' //@ts-ignore
      doubaoBtn1.value.style.top = currentPos1.value.y + 'px' //@ts-ignore
      doubaoBtn1.value.style.right = 'unset' //@ts-ignore
      doubaoBtn1.value.style.transform = 'unset'
    }
  }
  const handleMouseUp1 = () => {
    isDragging1.value = false
    document.removeEventListener('mousemove', handleMouseMove1)
    document.removeEventListener('mouseup', handleMouseUp1)
  }
  // 添加全局事件
  document.addEventListener('mousemove', handleMouseMove1)
  document.addEventListener('mouseup', handleMouseUp1)
}
//@ts-ignore
const handleLinkClick = (e) => {
  if (hasDragged.value) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
} //@ts-ignore
const handleLinkClick1 = (p) => {
  if (hasDragged1.value) {
    p.preventDefault()
    p.stopPropagation()
    return false
  }
}
// 获取公告
const getNotice = async () => {
  const res = await getAnnouncementList() //@ts-ignore
  if (res.code === 200) {
    //@ts-ignore
    noticeList.value = res.data
  }
}

// 打开/关闭
const openNotice = () => (showNotice.value = 1)
const closeNotice = () => (showNotice.value = 0)
// 需要监听的图片元素
const imagesToLoad = [bgSrc, bookStore]
// 价格格式化函数
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}

// 随机抽取图书
const getRandomBooks = (list: Book[], count: number = 4): Book[] => {
  if (!list || list.length === 0) return []
  const tempList = JSON.parse(JSON.stringify(list)) as Book[]
  const result: Book[] = []
  for (let i = 0; i < count && tempList.length; i++) {
    const randomIndex = Math.floor(Math.random() * tempList.length)
    result.push(tempList.splice(randomIndex, 1)[0])
  }
  return result
}

// 获取热门图书（异步函数）
const getHotBooks = async () => {
  try {
    await bookStore.fetchBookList()
    const fullList = bookStore.bookList || []
    const list = getRandomBooks(fullList, 10)

    if (list.length > 0) {
      for (let i = list.length - 1; i > 0; i--) {
        const j: number = Math.floor(Math.random() * (i + 1))
        const temp = list[i]
        list[i] = list[j]
        list[j] = temp
      }
    }

    hotBooks.value = list
    slidesLoaded.value = true
  } catch (error) {
    //console.error('获取图书失败', error)
    //ElMessage.error('加载热门图书失败，请稍后重试')
    hotBooks.value = []
    slidesLoaded.value = true
  }
}

// 刷新页面
const shoubookshuaxin = () => {
  getHotBooks()
  refshua.value++
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 搜索跳转
const handleToBookSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.info('请输入图书名称关键词')
    return
  }
  router.push({ path: '/books', query: { keyword } })
  searchKeyword.value = ''
}

function loadImages() {
  const imagePromises = imagesToLoad.map((src) => {
    //@ts-ignore
    return new Promise((resolve, reject) => {
      const img = new Image() //@ts-ignore
      img.src = src
      img.onload = resolve
    })
  })

  Promise.all(imagePromises)
    .then(() => {
      allImagesLoaded.value = true
    })
    .catch(() => {
      // 即使有图片加载失败，也继续显示内容
      allImagesLoaded.value = true
    })
}
// 初始化
onMounted(async () => {
  loadImages()
  getNotice()
  requestIdleCallback(() => {
    //预加载页面
    import('@/views/front/book/detail.vue')
    import('@/views/front/book/list.vue')
    import('@/views/front/user/index.vue')
    import('@/views/front/cart/index.vue')
  })
  await getHotBooks()
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.1) // 3秒后无论如何都隐藏遮罩
})
</script>

<style scoped>
* {
  user-select: none !important;
  -webkit-user-select: none !important;

  box-sizing: border-box;
  margin: 0;
  padding: 0;
  /* 基础字号响应式，保证整体文字缩放协调 */
  font-size: clamp(14px, 1vw, 16px);
}

input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}

/*导航栏：文字+完全居中对称+LOGO + 响应式缩放*/
.home-top-nav {
  /* 宽度响应式：最小700px，最大850px（原固定值），中间随屏幕缩放 */
  width: clamp(700px, 70vw, 850px);
  /* 高度响应式：最小50px，最大60px */
  height: clamp(50px, 5vw, 60px);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
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
  left: clamp(-30px, -3.5vw, -40px);
  top: clamp(-8px, -1vw, -10px);
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
  left: 4%;
  margin-right: 1%;
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
  position: absolute;
  margin-left: 10px !important;
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
  position: absolute;

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

/*页面整体：固定最大宽度，所有非图书区域永久固定不滚动*/
.home-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(10px, 2vw, 20px);

  overflow: visible;
  overflow-x: hidden;
  box-sizing: border-box;
}
.home-banner {
  /* 轮播高度响应式 */
  height: clamp(400px, 45vw, 543px);
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, #121a28 100%);
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.1);
  border-radius: clamp(8px, 1vw, 12px);
  margin: clamp(15px, 2vw, 20px) 0;
}

/*进入图书商城按钮*/
.wy {
  position: relative;
  top: clamp(-15px, -2vw, -20px);
  left: 0px;
  z-index: 10;
  background: linear-gradient(90deg, #409eff, #1b61e2) !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: clamp(10px, 1.5vw, 15px);
  padding-left: clamp(3px, 0.5vw, 5px);
  padding-right: clamp(3px, 0.5vw, 5px);
}
.wy:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  filter: brightness(1.1);
  background: linear-gradient(90deg, #8796a7, #2b537a) !important;
}
.hr1 {
  border-top: 1px dashed rgba(0, 0, 0, 0.749);
}
.banner-desc1 {
  color: #3c73e1;
  text-align: center;
  margin-top: 120px;
  margin-bottom: 20px;
  line-height: 1.5;
  animation: zzi 1.1s forwards ease-in;
  font-weight: 700;
  background: linear-gradient(90deg, #3c73e1, #64b5f6);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 10px rgba(232, 128, 43, 0.24);
}
@keyframes zzi {
  d 0% {
    opacity: 0;
  }
  25% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}
/*标题统一居中*/
.sci-fi-title {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #409eff;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);
  margin-left: clamp(40px, 5vw, 57.5px);
}
.sci-fi-title1 {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #409eff;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);
}
.sci-fi-title,
.sci-fi-title1 {
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 20px rgba(237, 254, 2, 0.4);
  animation: titlePulse 2s infinite alternate;
}
@keyframes titlePulse {
  0% {
    text-shadow: 0 0 15px rgba(245, 118, 118, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(1, 15, 30, 0.768);
  }
}
/*科幻分类：居中对称，固定布局*/
.home-category {
  margin: clamp(30px, 3.5vw, 40px) 0;
}
.category-list {
  display: flex;
  justify-content: center;
  gap: clamp(20px, 2.5vw, 30px);
  margin-top: clamp(15px, 2vw, 20px);
  flex-wrap: wrap; /*永不溢出空白*/
}
.category-card,
.category-card1 {
  width: clamp(280px, 27vw, 320px);
  height: clamp(180px, 17vw, 200px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}
.category-card:hover,
.category-card1:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}
.category-icon {
  font-size: clamp(30px, 3.5vw, 40px);
  margin-bottom: clamp(10px, 1.2vw, 15px);
}

/*热门图书：内置横向滚动条,固定2行5列+首卡完整显示+无页面空白*/
.home-hot-book {
  margin: clamp(30px, 3.5vw, 40px) 0 clamp(45px, 5vw, 60px);
  overflow: hidden;
  margin-left: clamp(-1px, -0.2vw, -2px); /*防止滚动条溢出到页面其他部分*/
}

.hot-book-list {
  display: grid;
  /*严格固定5列，每列宽度响应式*/
  grid-template-columns: repeat(5, clamp(180px, 17vw, 200px));
  grid-template-rows: repeat(2, auto);
  gap: clamp(15px, 1.8vw, 20px);
  /*左右20px安全留白*/
  padding: clamp(8px, 1vw, 10px) clamp(15px, 2vw, 20px);
  /*图书区域内部横向滚动*/
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  box-sizing: border-box;
  scroll-behavior: smooth;
  /*左对齐，滚动时首卡最左*/
  justify-content: start;
  margin-left: clamp(15px, 2vw, 25px);
}

.hot-book-card {
  width: clamp(180px, 17vw, 200px);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  padding: clamp(10px, 1.2vw, 15px) clamp(8px, 1vw, 10px);
  overflow: visible !important; /*禁止卡片内滚动条*/
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.hot-book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}
.hot-book-cover {
  width: clamp(100px, 10vw, 120px);
  height: clamp(150px, 15vw, 180px);
  object-fit: cover;
  margin: 0 auto clamp(10px, 1.2vw, 15px);
  border-radius: clamp(3px, 0.3vw, 4px);
  flex-shrink: 0; /*封面*/
}
.hot-book-price {
  color: #e6a23c;
  font-weight: bold;
  margin-top: clamp(8px, 1vw, 10px);
  font-size: clamp(14px, 1.2vw, 16px);
}

/*滚动条极简样式（图书区域）*/
.hot-book-list::-webkit-scrollbar {
  height: clamp(8px, 1vw, 12px);
}
.hot-book-list::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: clamp(2px, 0.3vw, 3px);
}
.hot-book-list::-webkit-scrollbar-track {
  background: #121a28;
}

/*导航按钮样式*/
.syws {
  display: flex;
  background: linear-gradient(0deg, #5073c7 0%, #121a28 100%);
  border-radius: clamp(4px, 0.5vw, 6px);
  padding: clamp(4px, 0.5vw, 6px) clamp(10px, 1.2vw, 14px);
  align-items: center;
  justify-content: center;
}
.syse,
.syse1 {
  color: rgb(255, 255, 255);
  font-size: clamp(14px, 1.2vw, 16px);
  text-decoration: none;
  line-height: 1.2;
}
.syse:hover,
.syse1:hover {
  color: #29a7ef;
}
.search-icon1 {
  cursor: pointer;
  color: #000000;
  font-size: clamp(18px, 1.8vw, 22px);
  margin-right: clamp(1px, 0.2vw, 2px);
  transition: color 0.2s;
}
.search-icon1:hover {
  color: #eb791c;
}
.szi {
  color: #653601;
  font-weight: 600;
  background: linear-gradient(180deg, #3f85c7 25%, #a4dff1 50%, #3f85c7 100%);
}
.szi:hover {
  color: #ff8d02;
}
</style>

<style scoped>
.sejb {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

/* 父按钮容器（保持你原来的样式，不变） */

/* 子菜单容器：垂直排列、自动拉伸、完美居中 */
.acwy {
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 子按钮自动填满容器宽度，永远等宽 */

  /* 核心定位：零硬凑，100%靠谱的居中方案 */
  position: absolute;
  top: 100%; /* 父按钮正下方，无缝衔接 */
  left: 50%; /* 父容器水平中点 */
  transform: translateX(-50%); /* 子菜单自身居中，完美对齐父按钮 */
  z-index: 999;
  margin-top: 0px; /* 父按钮和子菜单的美观间距 */
}

/* 两个按钮共用样式：统一宽度、内边距、盒模型 */
.ac1,
.ac2 {
  width: clamp(101px, 10vw, 117.7px) !important;
  padding: 7px 20px !important;
  height: auto !important;
  text-align: center;
  box-sizing: border-box; /* 关键：padding不撑大宽度，永远等宽 */
  border-radius: 0; /* 统一圆角，再单独设置 */
}

/* 上按钮：仅保留顶部圆角 */
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  position: relative;
  left: 5.9px;
}

/* 下按钮：仅保留下圆角，无缝拼接 */
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px; /* 消除按钮之间的缝隙，标准写法 */
  position: relative;
  left: -5.95px;
}
.doubao {
  width: 40px;
  height: auto;
  display: block;
  cursor: inherit !important;
}

.doubao-entrance {
  position: fixed;
  top: 110px;
  left: 0;
  z-index: 9999;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  /* 扩大可拖动热区 */
  padding: 25px;
  width: 80px;
  height: 80px;
  /* 关键：透明背景确保空白区域也能触发事件 */
  background: transparent !important;
  pointer-events: auto;
}

.doubao-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ffffff;
  text-decoration: none;
  box-shadow:
    0 0 5px rgba(102, 177, 255, 0.8),
    0 0 10px rgba(102, 177, 255, 0.6),
    0 0 25px rgba(102, 177, 255, 0.4);
  transition: all 0.3s ease;
  border: 2px solid rgba(102, 177, 255, 0.5);
  /* 恢复点击光标 */
  cursor: pointer !important;
  /* 移除pointer-events: none */
  pointer-events: auto !important;
}

/* hover效果保留 */
.doubao-btn:hover {
  border-radius: 50%;
  transform: scale(1.05);
}

/* 统一光标样式（拖动时是move，静止时是pointer） */
.doubao-entrance:not(.dragging) .doubao-btn,
.doubao-entrance:not(.dragging) .doubao {
  cursor: pointer !important;
}
.doubao-entrance.dragging,
.doubao-entrance.dragging .doubao-btn,
.doubao-entrance.dragging .doubao {
  cursor: move !important;
}

/* 禁用原生拖拽（保留） */
.doubao,
.doubao-btn,
.doubao-entrance {
  -webkit-user-drag: none !important;
  user-drag: none !important;
}
.ssr {
  color: #000000 !important;
}
.home-container {
  width: 100%;
  background: linear-gradient(180deg, #e5e3e373 0%, #dfdddd 50%, #ffffff73 100%);
  background-attachment: fixed;
}

.home-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(10px, 2vw, 20px);
  height: clamp(50px, 5vw, 60px);
  border-bottom: 1px solid #eee;
  animation: tiao 0.5s forwards ease-in;
  opacity: 0.7;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.98) 50%,
    rgba(255, 255, 255, 0.98) 100%
  );
  border-bottom: 1px solid rgba(5, 44, 84, 0.3);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  backdrop-filter: blur(10px);
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
  position: absolute;
  /* 偏移量响应式 */
  left: 1000px;
  right: clamp(30px, 4.5vw, 0px);
}
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
}

/* 遮罩淡出动画 */
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
.home-top-nav1 {
  /* 第二个导航栏响应式 */
  width: clamp(300px, 32vw, 370px);
  height: clamp(50px, 5vw, 60px);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(95, 166, 237, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(10px, 2vw, 20px);
  top: 0;
  position: fixed;
  /* 偏移量响应式，保留原布局 */
  margin-left: clamp(650px, 70vw, 800px);
  z-index: 98;
  border-bottom: 1px solid #eee;
  animation: tiao 0.5s forwards ease-in;
  opacity: 0.7;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.98) 50%,
    rgba(255, 255, 255, 0.98) 100%
  );
  border-bottom: 1px solid rgba(5, 44, 84, 0.3);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  backdrop-filter: blur(10px);
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
  75% {
    height: clamp(60px, 6vw, 71.5px);
    opacity: 1;
  }
  100% {
    height: clamp(50px, 5vw, 60px);
    opacity: 1;
  }
}
.nav-center {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.8vw, 10px);
  margin-left: -35px;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 10px);
}
.home-banner {
  margin: clamp(15px, 2vw, 20px) 0;
}
.home-category {
  padding: clamp(15px, 2vw, 20px);
  text-align: center;
}
.category-list {
  display: flex;
  justify-content: center;
  gap: clamp(20px, 2.5vw, 30px);
  margin-top: clamp(15px, 2vw, 20px);
}
.category-card,
.category-card1 {
  cursor: pointer;
  width: clamp(240px, 23vw, 280px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(9, 26, 94, 0.558) 100%);
  border: 1px solid rgba(64, 158, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.404);
  position: relative;
  overflow: hidden;
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.category-card::before,
.category-card1::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.133), transparent);
  animation: cardShine 4s infinite linear;
}
@keyframes cardShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
.category-card:hover,
.category-card1:hover {
  animation: 1.7s zlist ease-in-out;
}
@keyframes zlist {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.02);
  }
  50% {
    transform: scale(1.01);
  }
  75% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.category-icon {
  font-size: clamp(30px, 3.5vw, 40px);
  margin-bottom: clamp(8px, 1vw, 10px);
  filter: drop-shadow(0 0 10px rgba(64, 158, 255, 0.3));
  animation: iconFloat 3.2s ease-in-out infinite;
}
@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: rotate(-7deg);
  }
  50% {
    transform: translateY(-5px) rotate(7deg);
  }
}
.home-hot-book {
  padding: clamp(15px, 2vw, 9px);
  position: relative;
  margin-left: clamp(-40px, -4.5vw, -50.3px);
}
.hot-book-list {
  flex-wrap: wrap;
  gap: clamp(15px, 1.8vw, 20px);
}
.hot-book-card {
  width: clamp(200px, 20vw, 240px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.9) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);

  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.hot-book-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 35px rgba(143, 141, 141, 0.574);
  border-color: rgba(0, 0, 0, 0.4);
}
.hot-book-cover {
  width: 100%;
  height: clamp(170px, 17vw, 220px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.785);
  transition: all 0.3s ease;
}
.hot-book-card:hover .hot-book-cover {
  box-shadow: 0 0 20px rgba(153, 163, 174, 0.4);
}
.hot-book-price {
  background: linear-gradient(90deg, #e6a23c, #fbbf24);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(230, 162, 60, 0.3);
}
/*滚动条视觉*/
.hot-book-list::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #409eff, #64b5f6);
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}
.hot-book-list::-webkit-scrollbar-track {
  background: rgba(18, 26, 40, 0.5);
}
/* ========== 导航按钮视觉 ========== */
.syws {
  background: linear-gradient(0deg, #ffffff 0%, #022d8a 100%);
  border: 1px solid rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}
.syws:hover {
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}
.syse,
.syse1 {
  color: #fff;
  transition: all 0.3s ease;
}
.syse:hover,
.syse1:hover {
  color: #64b5f6;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}
.sx {
  position: relative;
  margin-left: 6px;
  background: linear-gradient(0deg, #a7afc2 0%, #02488f 100%);
  border: none !important;
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  color: #fff !important;
  right: clamp(20px, 2.5vw, 30px);
  padding-left: clamp(2px, 0.3vw, 3px);
  padding-right: clamp(2px, 0.3vw, 3px);
}
.sx:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}
.notice-btn {
  position: fixed;
  right: clamp(15px, 2vw, 20px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 99;
  padding: clamp(6px, 1vw, 9px) clamp(6px, 1.2vw, 8px);
  background: linear-gradient(135deg, #4e73df, #224abe);
  color: #fff;
  width: 88px;
  border-radius: clamp(40px, 4vw, 50px);
  font-size: clamp(0.28cm, 0.3vw, 0.32cm);
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: noticePulse 4s infinite;
  transition: 0.9s;
}
@keyframes noticePulse {
  0% {
    box-shadow: 0 4px 15px rgba(8, 13, 26, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(210, 201, 201, 0.5);
  }
  100% {
    box-shadow: 0 0px 4px 4px rgba(8, 13, 26, 0.3);
  }
}
.notice-btn:hover {
  transform: translateY(-50%) scale(1.06);
}

/* ========== 右侧渐变抽屉 ========== */
.notice-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: clamp(320px, 35vw, 400px);
  height: 100vh;
  z-index: 9999;
  background: linear-gradient(180deg, #ffffff 0%, #eaeaea 100%);
  box-shadow: -5px 0 30px rgba(64, 158, 255, 0.2);
  border-left: 1px solid rgba(190, 191, 193, 0.3);
  transition: all 0.3s ease;
  overflow-y: auto;
}
/* 打开/关闭动画 */
.notice-drawer.open {
  right: 0;
}
.notice-drawer.close {
  right: clamp(-400px, -40vw, -450px);
}

/* 抽屉头部 */
.drawer-header {
  padding: clamp(15px, 2vw, 20px);
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(18, 26, 40, 0.95);
  color: #e0e6ff;
  background: #fff;
}
.drawer-header h3 {
  margin: 0;
  color: #333;
  font-size: clamp(16px, 1.5vw, 18px);
  transition: all 0.2s ease;
}
.drawer-header .close {
  font-size: clamp(20px, 2vw, 26px);
  cursor: pointer;
  color: #666;
}
.drawer-header .close:hover {
  color: #ff4d4f;
  transform: scale(1.1);
}
/* 公告列表 */
.notice-content {
  padding: clamp(15px, 2vw, 20px);
}
.notice-item {
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.333);
  border: 1px solid rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
  color: #000000;
  padding: clamp(10px, 1.2vw, 15px);
  border-radius: clamp(8px, 1vw, 10px);
  margin-bottom: clamp(10px, 1.2vw, 15px);
}
.notice-item h4 {
  margin: 0 0 clamp(6px, 0.8vw, 8px) 0;
  color: #333;
  font-size: clamp(14px, 1.2vw, 16px);
}
.notice-item p {
  color: #666;
  line-height: 1.5;
  margin: 0 0 clamp(6px, 0.8vw, 8px) 0;
  font-size: clamp(13px, 1.1vw, 14px);
}
.notice-item span {
  font-size: clamp(10px, 1vw, 12px);
  color: #999;
}
.notice-item:hover {
  border-color: rgba(215, 222, 228, 0.3);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.15);
}
.empty {
  text-align: center;
  padding: clamp(40px, 4vw, 50px) 0;
  color: #999;
}

/* 遮罩 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.3);
  z-index: 99;
}

/* 搜索框单独适配（穿透scoped） */
:deep(.el-input) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  width: clamp(220px, 25vw, 280px);
  margin-right: clamp(10px, 1.8vw, 20px);
}
:deep(.el-input__inner) {
  background: transparent !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
  color: #000000 !important;
  font-size: clamp(14px, 1.2vw, 16px);
  padding: clamp(6px, 0.8vw, 8px);
}
:deep(.el-input__inner) ::placeholder {
  color: #515151 !important;
}
:deep(.el-button) {
  font-size: clamp(14px, 1.2vw, 16px);
  padding: clamp(6px, 0.8vw, 8px) clamp(10px, 1.2vw, 12px);
}
.logo {
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 15px rgba(100, 91, 91, 0.5);
  animation: logoGlow 2s ease-in-out infinite alternate;
}
@keyframes logoGlow {
  0% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(1.2);
  }
}
/* 欢迎文字单独放大适配 */
</style>
