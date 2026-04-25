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
  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo sci-fi-title">星途科幻图书</h2>
    </div>
    <div class="nav-center">
      <el-button class="sx" type="primary" @click="shoubookshuaxin">刷新页面</el-button>
      <div class="sejb">
        <div class="syws">
          <el-button link class="syse" @click="go('/home')">首页</el-button>
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
        <el-button style="padding: 5px" class="szi" type="primary" link @click="go('/login')"
          >登录</el-button
        >
        <el-button style="padding: 5px" class="szi" type="primary" link @click="go('/register')"
          >注册</el-button
        >
      </div>
      <!-- 已登录 -->
      <div v-else class="login-bar">
        <el-button style="position: relative; background-color: #d5d3d0" link @click="go('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button style="position: relative; background-color: #d5d3d0" link @click="go('/cart')"
          ><img
            class="gwdh"
            style="width: 24px; height: auto"
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
  <div class="home-container">
    <!-- 顶部导航栏 -->

    <!-- 轮播 （增加v-if避免空数据渲染） -->
    <div class="home-banner" v-if="slidesLoaded">
      <div class="banner-content">
        <lunbotu :key="refshua" />
      </div>
    </div>
    <div class="hwy">
      <div class="home-monthly-hot2">
        <!-- 热门标签内部容器 -->
        <div class="monthly-inner2">
          <newbook :key="refreshKey1" />
        </div>
      </div>
      <div class="home-monthly-hot1">
        <!-- 热门标签内部容器 -->
        <div class="monthly-inner1">
          <remenbiaoqian
            :key="refreshKey"
            :category-tags="categoryTags"
            :author-tags="authorTags"
          />
        </div>
      </div>

      <div class="xiatiao1"></div>

      <div class="home-monthly-hot">
        <!-- 热门图书排行内部容器 -->
        <div class="monthly-inner">
          <remenbook />
        </div>
      </div>
    </div>
    <!-- 热门图书 -->
    <div class="home-hot-book">
      <div>
        <h2 class="sci-fi-title" style="position: relative; left: -5%">热门科幻图书</h2>
        <hr style="margin-bottom: 20px; width: 1115.9px; position: relative; left: 46px" />
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

    <!-- 【新增】读书活动 -->
    <div class="home-reading-events">
      <h2 class="sci-fi-title">读书活动</h2>
      <div v-if="readingEvents.length === 0" class="empty-tip">
        <el-empty description="暂无读书活动" />
      </div>
      <div v-else class="events-list">
        <el-card v-for="event in readingEvents" :key="event.id" class="event-card">
          <h3>{{ event.title }}</h3>
          <p class="event-time">时间：{{ event.time }}</p>
          <p>{{ event.content }}</p>
        </el-card>
      </div>
    </div>

    <!-- 【新增】图书资讯 -->
    <div class="home-book-news">
      <h2 class="sci-fi-title">图书资讯</h2>
      <div v-if="bookNews.length === 0" class="empty-tip">
        <el-empty description="暂无图书资讯" />
      </div>
      <div v-else class="news-list">
        <div v-for="news in bookNews" :key="news.id" class="news-item">
          <h3>{{ news.title }}</h3>
          <p>{{ news.content }}</p>
          <span class="news-time">{{ news.time }}</span>
        </div>
      </div>
    </div>

    <!-- 【新增】科幻图书250 -->
    <div class="home-sci-fi-250">
      <h2 class="sci-fi-title">科幻图书250</h2>
      <div v-if="sciFi250.length === 0" class="empty-tip">
        <el-empty description="暂无数据" />
      </div>
      <div v-else class="sci-fi-250-list">
        <el-card
          v-for="book in sciFi250"
          :key="book.id"
          class="sci-fi-250-card"
          @click="go(`/book/${book.id}`)"
        >
          <img
            :src="book.cover || '/img/default-book.jpg'"
            alt="图书封面"
            class="sci-fi-250-cover"
            @error="(e) => (e.target.src = '/img/default-book.jpg')"
          />
          <h3>{{ book.name || '未知图书' }}</h3>
          <p>作者：{{ book.author || '未知作者' }}</p>
          <p class="sci-fi-250-price">¥{{ formatPrice(book.price) }}</p>
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

    <notice v-model="showNotice" />
  </div>
  <div></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElEmpty } from 'element-plus'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, useRouter } from 'vue-router'
import { useBookStore } from '@/store/book'
import { Hide, Search } from '@element-plus/icons-vue'
import lunbotu from '@/views/front/home/lunbotu.vue'
import { getAnnouncementList } from '@/api/front/announcement'
import type { Announcement } from '@/types/index'
import remenbook from '@/views/front/book/remenbook.vue'
import remenbiaoqian from '@/views/front/biaoqian/biaoqian.vue'
import newbook from '@/views/front/home/xinbook.vue'
const allImagesLoaded = ref(false)
// 初始化变量
import notice from '@/views/front/home/notice.vue'
const userStore = useUserStore()
const router = useRouter()
const bookStore = useBookStore()

const hotBooks = ref<Book[]>([])
const refshua = ref(0)
const searchKeyword = ref<string>('')
const slidesLoaded = ref(false)
const bgSrc = bookStore
const showNotice = ref(false) //  boolean
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

const currentPos1 = ref({ x: 6, y: 380 })
const DRAG_THRESHOLD1 = 5
// 安全跳转：解决首次点击卡顿/转圈
//@ts-ignore
let timeleave: NodeJS.Timeout | null = null
const showhover = ref(false)

//biaoqianzichuancan
const refreshKey = ref(0)
const refreshKey1 = ref(0)
// 你可以传自定义标签，不传就用子组件默认值
const categoryTags = ref<any[]>([])
const authorTags = ref<any[]>([])
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
    showNotice.value === true
    return
  }
  if (showNotice.value === true) {
    showNotice.value = false
    return
  } else {
    openNotice()
  }
} //@ts-ignore
// 获取公告
const getNotice = async () => {
  const res = await getAnnouncementList()
  // @ts-ignore
  if (res.code === 200) {
    // @ts-ignore
    noticeList.value = res.data
  }
}
function go(path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric) {
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

// 打开/关闭
const openNotice = () => (showNotice.value = true)
const closeNotice = () => (showNotice.value = false)
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

// 读书活动
const readingEvents = ref([
  {
    id: 1,
    title: '《三体》线上共读会',
    time: '2026-04-25 19:00',
    content: '一起探讨三体宇宙的奥秘',
  },
  {
    id: 2,
    title: '科幻作家沙龙：未来世界的构建',
    time: '2026-05-01 14:00',
    content: '邀请知名科幻作家分享创作经验',
  },
])

// 图书资讯
const bookNews = ref([
  {
    id: 1,
    title: '刘慈欣新作即将发布',
    content: '据悉，刘慈欣的最新科幻小说将于明年年初出版，讲述人类与外星文明的首次接触。',
    time: '2026-04-18',
  },
  {
    id: 2,
    title: '《沙丘》第二部电影定档',
    content: '《沙丘2》电影宣布定档2026年12月，继续讲述保罗·厄崔迪的传奇故事。',
    time: '2026-04-15',
  },
])

// 科幻250
const sciFi250 = ref<Book[]>([
  {
    id: 31,
    name: '银河帝国全集',
    author: '艾萨克·阿西莫夫',
    price: 299.0,
    cover: '/img/default-book.jpg',
    category: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 32,
    name: '基地三部曲',
    author: '艾萨克·阿西莫夫',
    price: 128.0,
    cover: '/img/default-book.jpg',
    category: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 33,
    name: '机器人短篇全集',
    author: '艾萨克·阿西莫夫',
    price: 89.0,
    cover: '/img/default-book.jpg',
    category: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 34,
    name: '2001太空漫游',
    author: '阿瑟·C·克拉克',
    price: 55.0,
    cover: '/img/default-book.jpg',
    category: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
  {
    id: 35,
    name: '与拉玛相会',
    author: '阿瑟·C·克拉克',
    price: 48.0,
    cover: '/img/default-book.jpg',
    category: '',
    desc: '',
    stock: 0,
    mulu: '',
    author_into: '',
  },
])

// 刷新页面
const shoubookshuaxin = () => {
  getHotBooks()
  refshua.value++
  refreshKey.value++ // 改变 key → 强制子组件重新随机
  refreshKey1.value++
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
  }, 0.05) // 3秒后无论如何都隐藏遮罩
})
</script>
<style scoped>
/* ========== 仅优化组件错位的相关样式（其他完全保留原代码） ========== */
/* ========== 终极根治：组件永不跑动，其他代码100%不动 ========== */
.hwy {
  /* 根治核心：取消绝对定位，回归正常文档流 */
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;

  height: auto;
}
/* 父容器：只做容器，不偏移、不嵌套缩放 */
.home-monthly-hot {
  position: relative;
  width: clamp(390px, 30vw, 540px);
  height: auto;
  padding: 0;
  margin: 0;
  top: -1400px;
  z-index: 188;
  left: clamp(815px, 66vw, 1040px);
  /* 取消父级缩放，只让子组件缩放，彻底杜绝错位 */
  transform: none;
}
.home-monthly-hot1 {
  position: relative;
  width: clamp(390px, 30vw, 540px);
  height: auto;
  padding: 0;
  margin: 0;
  top: -1200px;
  z-index: 188;
  left: clamp(1050px, 66vw, 1030px);
  transform: none;
}
.home-monthly-hot2 {
  position: relative;
  width: 100%;
  height: auto;

  top: -390px;
  z-index: 188;
  transition: all 0.3s ease;
  transform: none;
}

/* 子容器：取消固定top！用margin占位，永远不跑 */
.monthly-inner {
  position: static;
  /* 保留你原来的缩放比例 */
  transform: scale(0.73);
  width: 100%;
  height: 100%;
  transform-origin: top left;
  /* 用margin替代固定top，窗口怎么变都不动 */
  margin-top: 0;
}
.monthly-inner1 {
  position: static;
  transform: scale(0.76);
  width: 100%;
  height: 100%;
  transform-origin: top left;
  margin-top: 0;
}
.monthly-inner2 {
  position: static;
  transform: scale(0.9);
  width: 100%;
  height: 100%;
  margin-left: 20px;
  transform-origin: top left;
  margin-top: 30px;
}

/* 分割线：固定位置，不漂移 */
.xiatiao1 {
  height: 2px;
  background: #a9a7a7;
  margin: 10px 0;
  position: relative;
  top: -1400px;
  width: 465px;

  left: clamp(890px, 66vw, 1050px);
  z-index: 88;
}

/* 热门图书：取消疯狂偏移，彻底固定 */
.home-hot-book {
  padding: clamp(15px, 2vw, 9px);
  position: relative;
  margin: 0 auto 100px;
  transform: scale(0.8);
  transform-origin: top center;
  left: 0;
  top: 0;
  overflow: hidden;
}
@media (max-width: 1000px) {
  .home-monthly-hot2 {
    left: -27px;
  }
}
@media (max-width: 900px) {
  .home-monthly-hot2 {
    margin-left: -75px;
  }
}
@media (max-width: 830px) {
  .home-monthly-hot2 {
    margin-left: -100px;
  }
}
@media (max-width: 730px) {
  .home-monthly-hot2 {
    margin-left: -120px;
    transform: scale(0.93);
  }
}
@media (max-width: 650px) {
  .home-monthly-hot2 {
    margin-left: -120px;
    transform: scale(0.86);
  }
}
</style>
<style scoped>
.hywy {
  position: static;
  margin-right: 90px;
  margin-left: 28px;
}
@media (max-width: 1402px) {
  .xiatiao1 {
    left: 890.5px !important;
  }
}
@media (max-width: 1002px) {
  .xiatiao1 {
    left: 790.5px !important;
  }
}
* {
  user-select: none !important;
  -webkit-user-select: none !important;

  box-sizing: border-box;
  margin: 0;
  padding: 0;
  /* 基础字号响应式 */
  font-size: clamp(14px, 1vw, 16px);
}
.banner-content {
  position: relative;
  right: 96px;
  top: -8vh;
} /*默认样式*/

@media (max-width: 1110px) {
  .banner-content {
    transform: scale(1);
    right: 111px;
    top: -11vh;
    /* 每个媒体查询都必须写！ */
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 1060px) {
  .banner-content {
    transform: scale(0.98);
    right: 121px;
    top: -12.8vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 1010px) {
  .banner-content {
    transform: scale(0.95);
    right: 136px;
    top: -14vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 960px) {
  .banner-content {
    transform: scale(0.9);
    right: 151px;
    top: -16vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 910px) {
  .banner-content {
    transform: scale(0.86);
    right: 157px;
    top: -17vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 860px) {
  .banner-content {
    transform: scale(0.82);
    right: 162px;
    top: -17.8vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 810px) {
  .banner-content {
    transform: scale(0.75);
    right: 177px;
    top: -20.8vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 760px) {
  .banner-content {
    transform: scale(0.69);
    right: 183px;
    top: -22.8vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 710px) {
  .banner-content {
    transform: scale(0.69);
    right: 177px;
    top: -23.2vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 660px) {
  .banner-content {
    transform: scale(0.64);
    right: 177px;
    top: -25.2vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 600px) {
  .banner-content {
    transform: scale(0.59);
    right: 169px;
    top: -27vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
}
@media (max-width: 500px) {
  .banner-content {
    transform: scale(0.55);
    right: 166px;
    top: -28.7vh;
    transition:
      top,
      right,
      transform 0.3s ease;
  }
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

/*页面整体：固定最大宽度，所有非图书区域永久固定不滚动*/
.home-container {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 clamp(10px, 2vw, 20px);

  overflow: visible;
  overflow-x: hidden;
  box-sizing: border-box;
}
.home-banner {
  /* 轮播高度响应式 */
  height: clamp(700px, 45vw, 813px);
  background: white;
  position: relative;

  border-radius: clamp(8px, 1vw, 12px);
  margin: clamp(15px, 2vw, 20px) 0;
}

@keyframes zzi {
  0% {
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
  margin-left: clamp(-4%, 5vw, -5.75%);
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

/*热门图书：内置横向滚动条,固定2行5列+首卡完整显示+无页面空白*/

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
  position: relative;
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
  height: clamp(180px, 15vw, 180px);
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
  height: clamp(15px, 1vw, 18px);
}
.hot-book-list::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: clamp(2px, 0.3vw, 3px);
}
.hot-book-list::-webkit-scrollbar-track {
  background: #121a28;
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
  color: brown;
  font-weight: 600;
  background: linear-gradient(180deg, #3f85c7 25%, #a4dff1 50%, #3f85c7 100%);
}
.szi:hover {
  color: #ff8d02;
}

.gwdh {
  animation: gwbian 1s ease infinite;
}
@keyframes gwbian {
  0%,
  100% {
    transform: rotate3d(0, 0, 1, 0deg) translate3d(0, 0, 0);
  }
  12.5% {
    transform: rotate3d(0, 0, 1, 2deg) translate3d(-1.5px, 0, 0);
  }
  25% {
    transform: rotate3d(0, 0, 1, 4deg) translate3d(-3px, 0, 0);
  }
  37.5% {
    transform: translate3d(1.5px, 0, 0) rotate3d(0, 0, 1, -2deg);
  }
  50% {
    transform: translate3d(3px, 0, 0) rotate3d(0, 0, 1, -4deg);
  }
}

.sejb {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
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

/* hover效果 */
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

/* 禁用原生拖拽 */
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
  background: white;
  background-attachment: fixed;
}

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
  position: absolute;
  /* 偏移量响应式 */
  margin-right: 66px;
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
  position: relative;
}

@keyframes cardShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
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

.home-hot-book {
  padding: clamp(15px, 2vw, 9px);
  position: relative;
  margin-left: clamp(-40px, -4.5vw, -50.3px);
  transform: scale(0.8);
  margin-top: -90px;
  left: -8px;

  overflow: hidden;
  position: relative;
  top: 610px;
  margin-bottom: 500px;
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
  height: clamp(195px, 17vw, 240px);
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
  color: #fff;
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

/* 公告按钮 */
.notice-btn {
  position: fixed;
  right: clamp(15px, 2vw, 20px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 99;
  padding: clamp(4px, 1vw, 5px) clamp(10px, 1.5vw, 12px);
  background: linear-gradient(35deg, #1481e6, #ec5823);
  border: none;
  border-radius: clamp(4px, 0.5vw, 6px);
  color: #fff;
  font-size: clamp(14px, 1.2vw, 16px);
  cursor: pointer;

  transition: all 0.3s ease;
}
.notice-btn:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(94, 94, 94, 0.5);
}

/* 读书活动 */
.home-reading-events {
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  max-width: 800px;
  margin: 0 auto;
}
.event-card {
  padding: clamp(15px, 2vw, 20px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: clamp(8px, 1vw, 12px);
}
.event-time {
  color: #666;
  font-size: clamp(12px, 1vw, 14px);
  margin: clamp(5px, 0.5vw, 8px) 0;
}

/* 每月热门图书榜 - 父容器（相对定位，留在文档流） */
/*
@media (max-width: 952px) {
  .home-monthly-hot {
    left: 79vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 922px) {
  .home-monthly-hot {
    left: 78.5vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 822px) {
  .home-monthly-hot {
    left: 78vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 622px) {
  .home-monthly-hot {
    left: 80vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 612px) {
  .home-monthly-hot {
    left: 81vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 592px) {
  .home-monthly-hot {
    left: 82vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 570px) {
  .home-monthly-hot {
    left: 60vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 502px) {
  .home-monthly-hot {
    left: 60vw !important;
    transition: left transform 0.3s ease;
  }
}
*/
@media (max-width: 1452px) {
  .home-monthly-hot1 {
    left: 68vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1402px) {
  .home-monthly-hot1 {
    left: 67vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1382px) {
  .home-monthly-hot1 {
    left: 66.7vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1332px) {
  .home-monthly-hot1 {
    left: 67vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1272px) {
  .home-monthly-hot1 {
    left: 67.7vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1212px) {
  .home-monthly-hot1 {
    left: 69vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1192px) {
  .home-monthly-hot1 {
    left: 71vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1162px) {
  .home-monthly-hot1 {
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1112px) {
  .home-monthly-hot1 {
    left: 75vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1052px) {
  .home-monthly-hot1 {
    left: 69vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 952px) {
  .home-monthly-hot1 {
    left: 69vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 922px) {
  .home-monthly-hot1 {
    left: 69vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 882px) {
  .home-monthly-hot1 {
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 832px) {
  .home-monthly-hot1 {
    left: 68.5vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 822px) {
  .home-monthly-hot1 {
    left: 66vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 722px) {
  .home-monthly-hot1 {
    left: 66.6vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 672px) {
  .home-monthly-hot1 {
    left: 69vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 622px) {
  .home-monthly-hot1 {
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 612px) {
  .home-monthly-hot1 {
    left: 68vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 570px) {
  .home-monthly-hot1 {
    left: 71.5vw !important;
    transition: all transform 0.3s ease;
  }
}
@media (max-width: 542px) {
  .home-monthly-hot1 {
    left: 72.5vw !important;
    transition: all transform 0.3s ease;
  }
}
@media (max-width: 502px) {
  .home-monthly-hot1 {
    left: 72vw !important;
    transition: all transform 0.3s ease;
  }
}

/* 图书资讯 */
.home-book-news {
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
}
.news-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 1.8vw, 20px);
  max-width: 800px;
  margin: 0 auto;
}
.news-item {
  padding: clamp(15px, 2vw, 20px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: clamp(8px, 1vw, 12px);
}
.news-time {
  color: #666;
  font-size: clamp(12px, 1vw, 14px);
  display: block;
  margin-top: clamp(10px, 1.2vw, 15px);
}

/* 科幻图书250 */
.home-sci-fi-250 {
  padding: clamp(15px, 2vw, 20px);
  margin: clamp(30px, 3.5vw, 40px) 0;
}
.sci-fi-250-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, clamp(200px, 20vw, 240px));
  gap: clamp(15px, 1.8vw, 20px);
  justify-content: center;
}
.sci-fi-250-card {
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  padding: clamp(10px, 1.2vw, 15px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.sci-fi-250-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.sci-fi-250-cover {
  width: clamp(100px, 10vw, 120px);
  height: clamp(150px, 15vw, 180px);
  object-fit: cover;
  margin-bottom: clamp(10px, 1.2vw, 15px);
  border-radius: clamp(3px, 0.3vw, 4px);
}
.sci-fi-250-price {
  color: #e6a23c;
  font-weight: bold;
  margin-top: clamp(8px, 1vw, 10px);
}

/* 空数据提示 */
.empty-tip {
  text-align: center;
  padding: clamp(40px, 5vw, 60px) 0;
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
