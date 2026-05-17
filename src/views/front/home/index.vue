<template>
  <!-- 遮罩 -->
  <div v-if="!slidesLoaded" class="simple-mask"></div>

  <div
    v-cloak
    class="doubao-entrance"
    ref="doubaoBtn"
    @mousedown="handleMouseDown"
    draggable="false"
  >
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

  <HomeTopNav @refresh="shoubookshuaxin" />
    <el-button
         link class="ziwy2" @click="dingbu"
         
         
          ><span >↑</span></el-button>
  <div class="home-container">
    <div class="home-banner" v-if="slidesLoaded">
      <div class="banner-content" style="position: relative; z-index: 100">
        <lunbotu :key="refshua" />
      </div>
    </div>

    <div class="home-monthly-hot2">
      <div class="monthly-inner2">
        <newbook :key="refreshKey1" />
      </div>
      <div class="editor-recommend-container">
        <editorrecommend  :key="refreshKey"/>
      </div>
    </div>

    <div class="hwy">
      <div class="home-monthly-hot1">
        <div class="monthly-inner1">
          <remenbiaoqian
            :key="refreshKey"
            :category-tags="categoryTags"
            :author-tags="authorTags"
          />
        </div>
      </div>

      <div class="home-monthly-hot">
        <div class="monthly-inner">
          <remenbook />
        </div>
      </div>
    </div>

    <div class="home-hot-book">
      <div class="hot-book-back">
        <h2
          class="sci-fi-title-custom"
          style="text-align: left; width: 100%; margin: 20px 0; padding-left: 50px"
        >
          热门科幻图书
        </h2>
        <hr style="margin-bottom: 20px; width: 1115.9px; left: 46px" />

        <div v-if="hotBooks.length === 0" class="empty-tip">
          <el-empty description="暂无热门图书数据" />
        </div>
        <div v-else class="hot-book-list">
          <el-card
            v-for="book in hotBooks"
            :key="book.id"
            style="margin-left: 40px !important"
            class="hot-book-card"
            @click="go(`/book/${book.id}`)"
          >
           <pj class="pjwy" v-if="book.id != null" :book-id="book.id" source="normal"/>
            <!--@vue-ignore--><img
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
    </div>
<div style="margin-top: -400px;"><hbottom /></div>
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
      </button>
    </span>

    <notice v-model="showNotice" />
  </div>

 <span style=""><footere /></span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
//@ts-ignore
import { ElMessage, ElEmpty } from 'element-plus'
import type { Book } from '@/types/index'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/store/book'
import lunbotu from '@/views/front/home/lunbotu.vue'
import { getAnnouncementList } from '@/api/front/announcement'
import type { Announcement } from '@/types/index'
import remenbook from '@/views/front/book/remenbook.vue'
import remenbiaoqian from '@/views/front/biaoqian/biaoqian.vue'
import newbook from '@/views/front/home/xinbook.vue'
import editorrecommend from '@/views/front/home/editorrecommend.vue'
import HomeTopNav from '@/views/front/home/hometopnav.vue'
import notice from '@/views/front/home/notice.vue'
import footere from '@/views/front/biaoqian/footer.vue'
import hbottom from '@/views/front/biaoqian/homebottom.vue'
import pj from '@/views/front/book/抽离短评价.vue'
const router = useRouter()
const bookStore = useBookStore()

// 跳转
const go = (path: string) => router.push(path)

const hotBooks = ref<Book[]>([])
const refshua = ref(0)
const slidesLoaded = ref(false)
const showNotice = ref(false)
const noticeList = ref<Announcement[]>([])

// 拖拽
const doubaoBtn = ref(null)
const doubaoBtn1 = ref(null)
const isDragging = ref(false)
const hasDragged = ref(false)//@ts-ignore
const startPos = ref({ x: 0, y: 0 })
const currentPos = ref({ x: 6, y: 110 })
const DRAG_THRESHOLD = 5

const isDragging1 = ref(false)
const hasDragged1 = ref(false)
const currentPos1 = ref({ x: 6, y: 380 })
const DRAG_THRESHOLD1 = 5

const refreshKey = ref(0)
const refreshKey1 = ref(0)
const categoryTags = ref<any[]>([])
const authorTags = ref<any[]>([])

// 价格格式化
const formatPrice = (price: any): string => (Number(price) || 0).toFixed(2)

// 随机图书
const getRandomBooks = (list: Book[], count = 10): Book[] => {
  if (!list?.length) return []
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}


// 双线路加载：本地静态优先+后端兜底

const loadHomeData = async () => {
  try {
    // 1. 优先加载本地静态JSON
    const res = await fetch('/home-static.json')
    const data = await res.json()

    // 2. 如果本地有数据 → 直接用
    if (data?.bookList?.length) {//@ts-ignore
      bookStore.setBookList(data.bookList)
      hotBooks.value = getRandomBooks(data.bookList, 10)
      console.log('✅ 首页使用本地加速数据')
      return
    }
  } catch (e) {}

  // 3. 本地无数据 → 自动走后端
  console.log('⚠️ 本地数据为空，使用后端接口')
  await bookStore.fetchBookList()
  hotBooks.value = getRandomBooks(bookStore.bookList || [], 10)
}

const getNotice = async () => {
  try {
    const res = await getAnnouncementList()//@ts-ignore
    if (res?.code === 200) noticeList.value = res.data
  } catch (e) {}
}

// 刷新
const shoubookshuaxin = async () => {
  await loadHomeData()
  refshua.value++
  refreshKey.value++
  refreshKey1.value++
}

// 拖拽逻辑
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  hasDragged.value = false
  const startX = e.clientX
  const startY = e.clientY
  const left = currentPos.value.x
  const top = currentPos.value.y

  const move = (e: MouseEvent) => {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      hasDragged.value = true
    }
    currentPos.value.x = left + dx
    currentPos.value.y = top + dy
    if (doubaoBtn.value) {//@ts-ignore
      doubaoBtn.value.style.left = currentPos.value.x + 'px'//@ts-ignore
      doubaoBtn.value.style.top = currentPos.value.y + 'px'
    }
  }

  const up = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

const handleMouseDown1 = (e: MouseEvent) => {
  isDragging1.value = true
  hasDragged1.value = false
  const startX = e.clientX
  const startY = e.clientY
  const left = currentPos1.value.x
  const top = currentPos1.value.y

  const move = (e: MouseEvent) => {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) > DRAG_THRESHOLD1 || Math.abs(dy) > DRAG_THRESHOLD1) {
      hasDragged1.value = true
    }
    currentPos1.value.x = left + dx
    currentPos1.value.y = top + dy
    if (doubaoBtn1.value) {//@ts-ignore
      doubaoBtn1.value.style.left = currentPos1.value.x + 'px'//@ts-ignore
      doubaoBtn1.value.style.top = currentPos1.value.y + 'px'//@ts-ignore
      doubaoBtn1.value.style.right = 'unset'//@ts-ignore
      doubaoBtn1.value.style.transform = 'unset'
    }
  }

  const up = () => {
    isDragging1.value = false
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

const handleLinkClick = (e: Event) => {
  if (hasDragged.value) e.preventDefault()
}//@ts-ignore
const handleLinkClick1 = (e: Event) => {
  if (hasDragged1.value) e.preventDefault()
}

const notandmouse = () => {
  if (!hasDragged1.value) showNotice.value = !showNotice.value
}
const dingbu=()=>{
  window.scrollTo(0,0)
}
// 初始化
onMounted(async () => {
  getNotice()
  await loadHomeData() // 使用双线路加载
  slidesLoaded.value = true
})
</script>
<style scoped>
.simple-mask {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 9999;
}
</style>
<style scoped>
[v-cloak] {
  display: none !important;
}
.hwy {
  /* 正常文档流 */
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;
  margin-top: 80px;
  height: auto;
}
/* 标题蓝线效果 */
.sci-fi-title-custom {
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #409eff;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);

  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;

  animation: titlePulse1 2s infinite alternate;

  /* 短蓝线伪元素 */
  position: relative;
  padding-bottom: 8px; /* 蓝线空间 */
}
@keyframes titlePulse1 {
  0% {
    text-shadow: 0 0 15px rgba(236, 218, 218, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(120, 121, 121, 0.768);
  }
}
/* 蓝线样式和文字绑定 */
.sci-fi-title-custom::after {
  content: '';
  position: absolute;
  bottom: 840px;
  left: 74.5px; /* 0 = 和文字左对齐，50% = 居中 */
  width: 100px; /* 蓝线长度 */
  height: 2px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
  border-radius: 2px;
}
/* 父容器 */

@media (max-width: 1430px) {
  .home-monthly-hot {
    left: 976px;
  }
}
@media (max-width: 1380px) {
  .home-monthly-hot {
    left: 969px;
  }
}
@media (max-width: 1330px) {
  .home-monthly-hot {
    left: 966px;
  }
}
@media (max-width: 1278px) {
  .home-monthly-hot {
    left: 960px;
  }
}
@media (max-width: 1238px) {
  .home-monthly-hot {
    left: 960px;
  }
}
@media (max-width: 1208px) {
  .home-monthly-hot {
    left: 950px;
  }
}
@media (max-width: 1178px) {
  .home-monthly-hot {
    left: 930px;
  }
}
@media (max-width: 1108px) {
  .home-monthly-hot {
    left: 900px;
  }
}
@media (max-width: 968px) {
  .home-monthly-hot {
    left: 890px;
  }
}
@media (max-width: 868px) {
  .home-monthly-hot {
    left: 990;
  }
}
@media (max-width: 768px) {
  .home-monthly-hot {
    left: 890px;
  }
}
.home-monthly-hot {
  position: absolute;
  width: clamp(390px, 30vw, 540px);
  height: auto;
  padding: 0;
  margin: 0;
  top: 100px;
  z-index: 218;
  margin-left: 130px;
  left: clamp(845px, 67.5vw, 880px);
  /* 子组件缩放*/
  transform: none;
}
.home-monthly-hot1 {
  position: absolute;
  width: clamp(390px, 30vw, 540px);
  height: auto;
  padding: 0;
  margin: 0;
  top: -1176px !important;
  z-index: 18888;
  left: clamp(1033px, 66vw, 1020px);
  transform: none;
}
.home-monthly-hot2 {
  position: absolute;
  width: 100%;
  height: auto;
  top: -10px;

  transform: none;
  margin-left: 80px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
/* 页面容器 */
.home-banner {
  /* 轮播高度响应式 */
  height: clamp(700px, 45vw, 813px);
  background: white;
  position: relative;
  top: 120px;

  border-radius: clamp(8px, 1vw, 12px);
  margin: clamp(15px, 2vw, 20px) 0;
}
/* 轮播区域：*/
.home-banner {
  /* 轮播高度响应式 */
  height: clamp(700px, 45vw, 813px);
  background: #ffffff;
  position: relative;
  top: 120px;
  height: 1160px;

  border-radius: 12px;
  margin: clamp(15px, 2vw, 20px) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
/* 子容器：margin占位 */
.monthly-inner {
  position: static;
  /* 缩放比例 */
  transform: scale(0.73);
  width: 100%;
  height: 100%;
  transform-origin: top left;

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
  flex: 1;
  min-width: 0;
}

.editor-recommend-container {
  position: absolute;
  transform: scale(0.83);
  width: 499px;
  height: 100%;
 right: 57px;
  margin-top: 699px;
  transform-origin: top left;
  flex-shrink: 0;
  margin-right: 20px;
}
@media (max-width: 1520px) {
  .editor-recommend-container {
    right: 40px;
   
  }

}
@media (max-width: 1490px) {
  .editor-recommend-container {
    right: 10px;
   
  }

}
@media (max-width: 1460px) {
  .editor-recommend-container {
    right: 12px;
   
  }

}
@media (max-width: 1430px) {
  .editor-recommend-container {
    right: 3px;
   
  }

}
@media (max-width: 1350px) {
  .editor-recommend-container {
    right: -53px;
   
  }

}
@media (max-width: 1280px) {
  .editor-recommend-container {
    right: -148px;
   top: 20px;
    transform: scale(0.75);
  }

}
@media (max-width: 1240px) {
  .editor-recommend-container {
    right: -140px;
  
  }

}
@media (max-width: 1200px) {
  .editor-recommend-container {
    right: -170px;
   
  }

}
@media (max-width: 1160px) {
  .editor-recommend-container {
    right: -266px;
  
  }

}
@media (max-width: 1100px) {
  .editor-recommend-container {
    right: -300px;
   
  }

}

@media (max-width: 1080px) {
  .editor-recommend-container {
    right: -329px;
   
  }

}
@media (max-width: 1050px) {
  .editor-recommend-container {
    right: -346px;
   
  }

}
@media (max-width: 1010px) {
  .editor-recommend-container {
    right: -370px;
   
  }

}
@media (max-width: 970px) {
  .editor-recommend-container {
    right: -420px;
   
  }

}
@media (max-width: 930px) {
  .editor-recommend-container {
    right: -1280px;
   
  }

}
@media (max-width: 1350px) {
  .home-monthly-hot2 {
    margin-left: 80px;
   right: 7px;
    top: -53px;
  }

}
@media (max-width: 1300px) {
  .home-monthly-hot2 {
    margin-left: 80px;
   right: 10px;
    top: -53px;
  }

}
@media (max-width: 900px) {
  .home-monthly-hot2 {
    margin-left: 40px;
    top: -53px;
     right: 16px;
  }

}
@media (max-width: 850px) {
  .home-monthly-hot2 {
    margin-left: -45px;
    top: -113px;
    right: 57px;
    transform: scale(0.93);
  }

}
@media (max-width: 780px) {
  .home-monthly-hot2 {
    margin-left: -55px;
    transform: scale(0.9);
     right: 66px;
    top: -130px;
  }

}
@media (max-width: 730px) {
  .home-monthly-hot2 {
    margin-left: -55px;
    transform: scale(0.9);
     right: 86px;
    top: -130px;
  }

}
@media (max-width: 690px) {
  .home-monthly-hot2 {
    margin-left: -70px;
    transform: scale(0.85);
    right: 102px;
    top: -160px;
  }

}
@media (max-width: 650px) {
  .home-monthly-hot2 {
    margin-left: -80px;
    transform: scale(0.8);
    top: -310px;
     right: 106px;
  }

}
@media (max-width: 630px) {
  .home-monthly-hot2 {
    margin-left: -80px;
    transform: scale(0.7);
    top: -330px;
     right: 120px;
  }

}
@media (max-width: 600px) {
  .home-monthly-hot2 {
    margin-left: -80px;
    transform: scale(0.7);
    top: -350px;
    
  }

}
@media (max-width: 580px) {
  .home-monthly-hot2 {
    margin-left: -80px;
    transform: scale(0.6);
    top: -450px;
     right: 126px;
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
  transition: all 0.05s ease-in;
} 

@media (max-width: 1110px) {
  .banner-content {
    transform: scale(1);
    right: 111px;
    top: -11vh;
    
   
}}
@media (max-width: 1060px) {
  .banner-content {
    transform: scale(0.98);
    right: 121px;
    top: -8.8vh;
  
}}
@media (max-width: 1010px) {
  .banner-content {
    transform: scale(0.95);
    right: 136px;
    top: -10vh;
 
}}
@media (max-width: 960px) {
  .banner-content {
    transform: scale(0.9);
    right: 151px;
    top: -11vh;
   
}}
@media (max-width: 910px) {
  .banner-content {
    transform: scale(0.86);
    right: 157px;
    top: -12vh;
  
}}
@media (max-width: 860px) {
  .banner-content {
    transform: scale(0.82);
    right: 162px;
    top: -12.8vh;
   
}}
@media (max-width: 810px) {
  .banner-content {
    transform: scale(0.75);
    right: 177px;
    top: -14.8vh;
   
}}
@media (max-width: 760px) {
  .banner-content {
    transform: scale(0.69);
    right: 183px;
    top: -15vh;
   
}}
@media (max-width: 710px) {
  .banner-content {
    transform: scale(0.69);
    right: 177px;
    top: -16.5vh;
   
}}
@media (max-width: 660px) {
  .banner-content {
    transform: scale(0.64);
    right: 177px;
    top: -18.2vh;
   
}}
@media (max-width: 600px) {
  .banner-content {
    transform: scale(0.59);
    right: 169px;
    top: -19.6vh;
  
}}
@media (max-width: 500px) {
  .banner-content {
    transform: scale(0.55);
    right: 166px;
    top: -20.7vh;
   
}}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}

/*页面整体：固定最大宽度，所有非图书区域永久固定不滚动*/

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
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  }
  100% {
    text-shadow: 0 0 25px rgba(78, 79, 79, 0.768);
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
  left: -19px;
}

.hot-book-card {
  width: clamp(180px, 17vw, 200px);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  padding: clamp(9px, 1.2vw, 14px) clamp(8px, 1vw, 10px);
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
  box-shadow: 0 0 20px rgba(153, 163, 174, 0.4);
}
.hot-book-price {
  color: #e6a23c;
  font-weight: bold;
  margin-top: clamp(8px, 1vw, 10px);
  font-size: clamp(14px, 1.2vw, 16px);
}

/*滚动条极简样式（图书区域）*/
.hot-book-list::-webkit-scrollbar {
  height: clamp(16px, 1vw, 19px);
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
  /* 透明背景确保空白区域也能触发事件 */
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
 
  pointer-events: auto !important;
}

/* hover效果 */
.doubao-btn:hover {
  border-radius: 50%;
  transform: scale(1.05);
}

/* 光标样式（拖动时是move，静止时是pointer） */
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
/* 页面容器 */
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
  pointer-events: none;
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
/* 轮播区域 */

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
  margin-left: clamp(-83px, -4.8vw, -86.3px);
  transform: scale(0.8);

  left: -9px;

  overflow: hidden;
  position: relative;
  top: 369px;
  margin-bottom: 500px;
}

@media (max-width: 900px) {
  .home-hot-book {
    top: -100px;
  }
}

@media (max-width: 730px) {
  .home-hot-book {
    top: -120px;
  }
}
@media (max-width: 650px) {
  .home-hot-book {
    top: -140px;
  }
}
.hot-book-list {
  flex-wrap: wrap;
  z-index: 300;
  gap: clamp(15px, 1.8vw, 20px);
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
/*滚动条视觉*/
.hot-book-list::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #409eff, #64b5f6);
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}
.hot-book-list::-webkit-scrollbar-track {
  background: rgba(18, 26, 40, 0.5);
}

/* 公告按钮 */
.notice-btn {
  position: fixed;
  right: clamp(15px, 2vw, 20px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 199999;
  padding: clamp(4px, 1vw, 5px) clamp(10px, 1.5vw, 12px);
  background: linear-gradient(35deg, #1481e6, #ec5823);
  border: none;
  border-radius: clamp(4px, 0.5vw, 6px);
  color: #fff;
  font-size: clamp(14px, 1.2vw, 16px);
  cursor: pointer;
}
.notice-btn:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(94, 94, 94, 0.5);

  transition: all 0.3s ease;
}

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
    transform: scale(0.9);
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
    transform: scale(0.85);
  }
}
@media (max-width: 1212px) {
  .home-monthly-hot1 {
    left: 67vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1192px) {
  .home-monthly-hot1 {
    left: 66vw !important;
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
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 1052px) {
  .home-monthly-hot1 {
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 952px) {
  .home-monthly-hot1 {
    left: 70vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 922px) {
  .home-monthly-hot1 {
    left: 73vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 882px) {
  .home-monthly-hot1 {
    left: 72vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 832px) {
  .home-monthly-hot1 {
    left: 74.5vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 822px) {
  .home-monthly-hot1 {
    left: 77vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 722px) {
  .home-monthly-hot1 {
    left: 81.6vw !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 690px) {
  .home-monthly-hot1 {
    top: -976px !important;
    transform: scale(0.8);
      top: -1060px !important;
  }
}
@media (max-width: 672px) {
  .home-monthly-hot1 {
    left: 84vw !important;
   
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 650px) {
  .home-monthly-hot1 {
    top: -1100px !important;
  }
}
@media (max-width: 630px) {
  .home-monthly-hot1 {
    top: -820px !important;
  }
}
@media (max-width: 622px) {
  .home-monthly-hot1 {
    left: 82vw !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 600px) {
  .home-monthly-hot1 {
    left: 79.7vw !important;
    transform: scale(0.74);
    top: -820px !important;
    transition: left transform 0.3s ease;
  }
}
@media (max-width: 580px) {
  .home-monthly-hot1 {
    left: 79.7vw !important;
    transform: scale(0.7);
    top: -760px !important;
    transition: left transform 0.3s ease;
  }
}

@media (max-width: 560px) {
  .home-monthly-hot1 {
    left: 80.5vw !important;
 top: -750px !important;
 transform: scale(0.7);
    transition: all transform 0.3s ease;
  }
}
@media (max-width: 542px) {
  .home-monthly-hot1 {
    left: 84.5vw !important;
    transition: all transform 0.3s ease;
  }
}
@media (max-width: 502px) {
  .home-monthly-hot1 {
    left: 86vw !important;
    transition: all transform 0.3s ease;
  }
}
</style>

<style scoped>
.ziwy2{
   position: fixed !important;
  top: 69.5vh !important;
  right: 0 !important;
  z-index: 99999 !important;
 
  height: 36px;
  background-color: #79787881 !important ;
 font-size: 39px !important;
 font-weight: 900 !important;
 padding-left: 9px;
 padding-right: 9px;
  transform: translateX(-12.8px) scale(1.5);
  padding-top: 7px;
  padding-bottom: 7px !important;
  padding-left: 9px !important;
  padding-right: 9px !important;
  width: 37px;
  color: #ffffff;
transition: all 0.25s ease;
}
.ziwy2:hover{
  
  transform: translateX(-12.8px) scale(1.5);
  color: #ff0000;
  
}
.pjwy{
  position: absolute;
  margin-top: -31px;
  margin-left: -18px;
  white-space: nowrap;
}
* {
}
/* 豆包按钮效果 */
.doubao-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.doubao-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.5);
}



/* 页面背景*/
.home-container {
  /* 布局 */
  width: 100%;
  max-width: 1505.9px;
  margin: 0 auto;
  padding: 0 clamp(10px, 2vw, 20px);
  overflow: visible;
  overflow-x: hidden;
  box-sizing: border-box;
  background-color: #dededf6c;
 
  /* 视觉效果 */
}

@media (max-width: 690px) {
  .home-banner {
    height: 1000px;
  }
}
@media (max-width: 630px) {
  .home-banner {
    height: 730px;
  }
}
@media (max-width: 580px) {
  .home-banner {
    height: 630px;
  }
}
/* 热门图书区域 */
.home-hot-book {
  /* 布局 */
  position: relative;
  transform-origin: top center;
  z-index: 200;
  top: 200px;
  padding: clamp(15px, 2vw, 9px);
  margin-left: clamp(-83px, -4.8vw, -86.3px);
  transform: scale(0.8);
  left: -9px;
  height: 1000px;
  /* 视觉效果 */
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.521);
  width: 112vw;
  border-radius: 12px;
}

/* 图书卡片 */
.hot-book-card {
  /* 基础布局 */
  width: clamp(190px, 18vw, 216px);
  cursor: pointer;
  text-align: center;
  height: auto;
  overflow: visible !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  
left: -10px;
  /* 七彩边框效果 */
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  padding: 2px;
  padding-top: 13px;
}

.hot-book-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(
    45deg,
    #575656,
    #f2eeee,
    #575656,
    #f2eeee,
    #ff80005a,
    #f2eeee,
    #575656,
    #f2eeee
  );
  background-size: 400% 400%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rainbow-border 4s ease infinite;
}

@keyframes rainbow-border {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.hot-book-card > * {
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 10px;
}

.hot-book-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.614);
  transform: translateY(-2px);
}

/* 图书封面 */
.hot-book-cover {
  /* 尺寸和布局 */
  width: 103%;
  height: clamp(195px, 17vw, 240px);
  object-fit: cover;
  margin: 0 auto clamp(8px, 1.2vw, 3px);
margin-top: 2px;
  /* 视觉效果 */
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.785);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.hot-book-card:hover .hot-book-cover {
  transform: scale(1.08);
}

/* 价格 */
.hot-book-price {
  color: #1d1d1f;
  font-weight: 600;
  background: linear-gradient(90deg, #e6a23c, #fbbf24);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(230, 162, 60, 0.3);
  margin-top: clamp(8px, 1vw, 10px);
  font-size: clamp(14px, 1.2vw, 16px);
}

/* 标题 */
.sci-fi-title {
  /* 基础样式 */
  text-align: center;
  margin: clamp(20px, 2.5vw, 30px) 0;
  color: #409eff;
  font-size: 20px;
  text-shadow: 0 0 clamp(8px, 1vw, 10px) rgba(64, 158, 255, 0.3);

  /* 渐变效果 */
  background: linear-gradient(90deg, #409eff, #64b5f6, #409eff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;

  /* 定位和下划线 */
  position: relative;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.sci-fi-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #0071e3;
  border-radius: 2px;
}

</style>
