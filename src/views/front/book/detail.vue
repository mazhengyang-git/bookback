<template>
  <!-- 顶部导航栏（首页，显示个人中心） -->
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo1 sci-fi-title1">星途科幻图书</h2>
    </div>
    <div class="nav-center1">
      <div class="sejb">
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        </div>
      </div>
      <div class="sejb" @mouseenter="mouseshow" @mouseleave="mouseleve">
        <div class="syws">
          <el-button link class="syses" @click="go('/books')">图书商城</el-button>
          <span class="acwy"
            ><el-button v-if="showhover" class="ac1" @click="go('/books?category=软科幻')"
              >软科幻</el-button
            ><el-button v-if="showhover" class="ac2" @click="go('/books?category=硬科幻')"
              >硬科幻</el-button
            ></span
          >
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <!-- 未登录：显示登录、注册 -->
      <div v-if="!userStore.isLogin">
        <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
        <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
      </div>

      <!-- 已登录：显示用户名、个人中心、购物车、退出 -->
      <div v-else class="login-bar">
        <span
          style="
            user-select: none !important;
            -webkit-user-select: none !important;
            color: green;
            font-size: 22px;
            position: relative;
            left: 10px;
          "
          >欢迎：{{ userStore.user?.username }}</span
        >
        <el-button link @click="$router.push('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button link @click="$router.push('/cart')"
          ><img style="width: 24px; height: auto" src="/img/购物车.png" />购物车</el-button
        >
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>
  </div>

  <div v-if="book" class="book-detail-container">
    <div style="display: inline-block; margin-left: 5px; margin-bottom: 15px"></div>
    <div class="book-detail-content">
      <!-- 封面 -->
      <div class="book-detail-cover" ref="coverRef">
        <el-image
          :src="book.cover || '/img/default-book.jpg'"
          referrerpolicy="no-referrer"
          alt="图书封面"
          :preview-src-list="[book.cover || '/img/default-book.jpg']"
          fit="cover"
          @show="handlePreviewShow"
          @error="(e: { target: { src: string } }) => (e.target.src = '/img/default-book.jpg')"
        />
      </div>
      <!-- 信息 -->
      <div class="book-detail-info">
        <h1 class="book-detail-name">{{ book.name || '未知图书' }}</h1>
        <p class="book-detail-author">作者：{{ book.author || '未知作者' }}</p>
        <p class="book-detail-category">分类：{{ book.category || '未知分类' }}</p>
        <!-- 价格格式化 -->
        <p class="book-detail-price">¥{{ formatPrice(book.price) }}</p>
        <p class="book-detail-stock">库存：{{ book.stock || 0 }}本</p>
        <div class="book-detail-count">
          <el-input-number v-model="buyCount" :min="1" :max="book.stock || 1" label="购买数量" />
        </div>
        <el-button
          type="primary"
          size="large"
          class="add-cart-btn"
          @click="addToCart"
          :disabled="!userStore.token"
        >
          {{ userStore.token ? '加入购物车' : '加入购物车? 请先登录' }}
        </el-button>
        <el-button
          type="primary"
          style="margin-top: 13px"
          class="add-cart-btn1"
          size="large"
          @click="handlePay"
          >去支付</el-button
        >
      </div>
    </div>

    <!-- 图书简介 -->
    <div class="book-detail-desc">
      <h3>图书简介</h3>
      <p
        ref="descRef"
        class="desc-content"
        :class="{ expanded: isDescExpanded }"
        style="text-indent: 2em; white-space: pre-wrap"
      >
        {{ book.desc || '暂无简介' }}
      </p>
      <el-button
        v-if="showDescExpand"
        link
        class="expand-btn"
        @click="isDescExpanded = !isDescExpanded"
      >
        {{ isDescExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <!-- 目录展示 -->
    <div class="book-detail-desc1">
      <h3>目录展示</h3>
      <p
        ref="muluRef"
        class="mulu-content"
        :class="{ expanded: isMuluExpanded }"
        style="text-indent: 2em; white-space: pre-wrap"
      >
        {{ book.mulu || '暂无目录' }}
      </p>
      <el-button
        v-if="showMuluExpand"
        link
        class="expand-btn"
        @click="isMuluExpanded = !isMuluExpanded"
      >
        {{ isMuluExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>
  </div>

  <!-- 加载中/无数据 -->
  <div v-else class="loading-tip">
    {{ loading ? '加载中...' : '未找到该图书' }}
  </div>
</template>

<script setup lang="ts">
//@ts-ignore
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 导入API
import { getBookDetailApi, getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'
import request from '@/utils/request'
import { getDirectPayGoodsInfo } from '@/api/front/pay'

const router = useRouter()
const hotBooks = ref<Book[]>([])
const allImagesLoaded = ref(false)

// 价格格式化函数（统一处理字符串/数字/空值）
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}
let timeleave: NodeJS.Timeout | null = null
const showhover = ref(false)
function mouseleve() {
  timeleave = setTimeout(() => {
    if (showhover.value === true) {
      showhover.value = false
    }
  }, 750)
}
function mouseshow() {
  if (timeleave) clearTimeout(timeleave)
  showhover.value = true
}
function go(path) {
  setTimeout(() => {
    router.push(path)
  }, 10) // 只延迟10毫秒，人感觉不到，但浏览器能缓过来
}
// 图片预览逻辑
const handlePreviewShow = () => {
  nextTick(() => {
    const viewer = document.querySelector('.el-image-viewer__wrapper') as HTMLElement
    const canvas = document.querySelector('.el-image-viewer__canvas') as HTMLElement
    const img = document.querySelector('.el-image-viewer__img') as HTMLElement

    if (!viewer || !canvas || !img) return

    const MAX_SCALE = 1.53
    const MIN_SCALE = 0.5
    let currentScale = 1
    let offsetX = 0
    let offsetY = 0
    let isDragging = false
    let startX = 0
    let startY = 0
    let startOffsetX = 0
    let startOffsetY = 0

    viewer.addEventListener('wheel', (e) => e.preventDefault(), { passive: false, capture: true })

    const resetImage = () => {
      currentScale = 1
      offsetX = 0
      offsetY = 0
      img.style.transformOrigin = 'center center'
      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`
      canvas.style.overflow = 'hidden' //@ts-ignore
      canvas.style.scrollTop = 0 //@ts-ignore
      canvas.style.scrollLeft = 0
    }

    img.onload = resetImage
    setTimeout(resetImage, 100)

    const applyTransform = () => {
      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const scaleStep = e.deltaY > 0 ? 0.95 : 1.1
      const newScale = Math.max(MIN_SCALE, Math.min(currentScale * scaleStep, MAX_SCALE))
      currentScale = newScale
      applyTransform()
      canvas.style.overflow = 'auto'
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (currentScale <= 1) return
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      startOffsetX = offsetX
      startOffsetY = offsetY
      img.style.cursor = 'grabbing'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      offsetX = startOffsetX + deltaX
      offsetY = startOffsetY + deltaY
      applyTransform()
    }

    const handleMouseUp = () => {
      isDragging = false
      img.style.cursor = 'grab'
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    viewer.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    img.addEventListener('mousedown', handleMouseDown)
    img.style.cursor = 'grab'

    const cleanup = () => {
      viewer.removeEventListener('wheel', handleWheel, true)
      img.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.querySelector('.el-image-viewer__close')?.addEventListener('click', cleanup)
    document.querySelector('.el-image-viewer__mask')?.addEventListener('click', cleanup)
  })
}

// 获取热门图书（对接后端接口）
const getHotBooks = async () => {
  try {
    const res = await getBookListApi() //@ts-ignore
    hotBooks.value = res.data?.slice(0, 10) || []
  } catch (error) {
    //console.error('获取图书失败', error)
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 路由获取图书ID
const route = useRoute()
const bookId = Number(route.params.id)

// 仓库实例
const cartStore = useCartStore()
const userStore = useUserStore()

// 数据定义
const loading = ref(true)
const book = ref<Book | null>(null)
const buyCount = ref(1)

//展开/收起相关状态
const isDescExpanded = ref(false)
const isMuluExpanded = ref(false)
const showDescExpand = ref(false)
const showMuluExpand = ref(false)
const descRef = ref<HTMLElement | null>(null)
const muluRef = ref<HTMLElement | null>(null)

// 获取图书详情（API调用）
const loadBookDetail = async () => {
  try {
    const res = await getBookDetailApi(bookId) //@ts-ignore
    if (res.code === 200 && res.data) {
      //@ts-ignore
      book.value = res.data
    } else {
      ElMessage.error('获取图书信息失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，请重试')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加入购物车
const addToCart = async () => {
  if (!book.value) {
    ElMessage.warning('图书信息加载失败，无法加入购物车')
    return
  }
  if (!userStore.token) {
    ElMessage.warning('请先登录后再加入购物车')
    return
  }
  // 库存判断的空值
  const stock = Number(book.value.stock) || 0
  if (buyCount.value > stock) {
    ElMessage.error({
      message: `加入购物车失败，该图书仅剩${stock}本`,
      offset: 80,
    })
    return
  }
  try {
    await request.post('/api/cart/add', {
      // 购物车接口前缀
      goodsId: book.value.id,
      num: buyCount.value,
      spec: '平装版',
    })
    cartStore.addToCart({
      id: book.value.id,
      name: book.value.name || '未知图书',
      price: Number(book.value.price) || 0, // 转数字存入购物车
      count: buyCount.value,
      cover: book.value.cover || '/img/default-book.jpg',
      cartId: 0,
      spec: '',
    })
    ElMessage.success({ message: '加入购物车成功', offset: 80 })
  } catch (err) {
    console.error('加入购物车失败：', err)
    ElMessage.error({ message: '加入购物车失败，请稍后重试', offset: 80 })
  }
}

const handlePay = async () => {
  // 1. 基础校验
  if (!userStore.token) {
    ElMessage.warning('请先登录后再支付')
    router.push('/login')
    return
  }
  if (!book.value) {
    ElMessage.warning('图书信息加载失败，无法支付')
    return
  }
  const stock = Number(book.value.stock) || 0
  if (buyCount.value > stock) {
    ElMessage.error(`库存不足！该图书仅剩${stock}本`)
    return
  }

  try {
    // 2.预校验商品信息
    await getDirectPayGoodsInfo(book.value.id, buyCount.value)

    // 3. 跳转到确认支付页（传递bookId和buyCount）
    router.push({
      path: '/pay/direct', // 新增直付确认页路由
      query: {
        bookId: book.value.id.toString(),
        buyCount: buyCount.value.toString(),
      },
    })
  } catch (error) {
    console.error('直付跳转失败：', error)
    ElMessage.error('支付跳转失败，请稍后重试')
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  getHotBooks()
  if (bookId) {
    loadBookDetail().then(() => {
      nextTick(() => {
        if (descRef.value) {
          showDescExpand.value = descRef.value.scrollHeight > descRef.value.clientHeight
        }
        if (muluRef.value) {
          showMuluExpand.value = muluRef.value.scrollHeight > muluRef.value.clientHeight
        }
      })
    })
  }
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.1) // 3秒后无论如何都隐藏遮罩
})
</script>
<style scoped>
/* 基础响应式配置：使用rem单位 + 媒体查询 */
:root {
  /* 基准字体：1rem = 16px（浏览器默认），缩放时自动适配 */
  font-size: 16px;
}

/* 顶部导航 - 响应式适配 */
.home-top-nav {
  width: 100%;
  height: 3.75rem; /* 60px → rem */
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 0.0625rem solid rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem; /* 20px → rem */
  position: sticky;
  top: 0;
  z-index: 999 !important;

  @media (max-width: 768px) {
    height: auto;
    flex-wrap: wrap;
    padding: 0.625rem;
  }
}
.sejb {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  z-index: 9 !important;
  z-index: 9996 !important;
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

  margin-top: 0px; /* 父按钮和子菜单的美观间距 */
}

/* 两个按钮共用样式：统一宽度、内边距、盒模型 */
.ac1,
.ac2 {
  width: clamp(101px, 10vw, 109px) !important;
  padding: 9px 20px !important;
  height: auto !important;
  text-align: center;
  box-sizing: border-box; /* 关键：padding不撑大宽度，永远等宽 */
  border-radius: 0; /* 统一圆角，再单独设置 */
}

/* 上按钮：仅保留顶部圆角 */
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  position: relative;
  left: 6px;
}

/* 下按钮：仅保留下圆角，无缝拼接 */
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px; /* 消除按钮之间的缝隙，标准写法 */
  position: relative;
  left: -5.95px;
}
/* 图书详情外层容器 - 响应式基础 */
.book-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem; /* 20px → rem单位 */
  background-color: #b8b6b6;
  color: #fff;
  min-height: 100vh;
  position: relative;
  overflow: visible;
  /* 适配小屏幕 */
  @media (max-width: 768px) {
    padding: 0.625rem; /* 10px */
  }
}
.clear-btn1 {
  width: clamp(12.5rem, 20vw, 13.75rem); /* 最小200px，最大220px */
  height: clamp(2.5rem, 5vw, 2.75rem); /* 最小40px，最大44px */
  font-size: clamp(1rem, 2vw, 1.125rem); /* 按钮文字跟随缩放 */
  background-color: #e6a23c !important;
  border: none !important;
  border-radius: 3px;
  margin-top: 15px;
  color: #ffffff;
  text-shadow: 0 0 12px #000000;
}
.black-mask {
  position: fixed;
  inset: 0;
  background: #eae8e8;
  z-index: 19999;
}

.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}

/* 图书封面+信息区域 - 响应式布局 + 渐变固定 */
.book-detail-content {
  display: flex;
  gap: 1.875rem; /* 30px → rem */
  margin-bottom: 2.5rem; /* 40px → rem */
  padding: 1.25rem; /* 20px → rem */
  background: linear-gradient(90deg, #f0f2f5 25%, #454443 50%, #f0f2f5 25%);
  background-attachment: fixed;
  background-size: cover;
  border-radius: 0.5rem; /* 8px → rem */
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1); /* 1px 4px → rem */
  overflow: hidden;
  /* 小屏幕：从横向布局改为纵向 */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.9375rem; /* 15px */
  }
}

.slinkse {
  position: relative;
  left: 1.125rem; /* 18px → rem */
  color: white;
  font-size: 1.25rem; /* 20px → rem */
}

/* 图书封面 - 响应式尺寸（宽高比固定，跟随缩放） */
.book-detail-cover {
  /* 宽高比 3:4 固定，使用百分比+padding-top 实现响应式 */
  width: 20rem; /* 240px → rem */
  aspect-ratio: 3/4; /* 固定宽高比（替代固定height） */
  border-radius: 0.5rem; /* 8px → rem */
  border: 0.0625rem solid #34495e; /* 1px → rem */
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  height: auto;
  /* 小屏幕：封面宽度自适应 */
  @media (max-width: 768px) {
    width: 100%;
    max-width: 12rem; /* 192px */
    margin: 0 auto;
  }
}
.book-detail-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
  user-select: none !important;
  -webkit-user-select: none !important;
}
.book-detail-cover :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.5rem; /* 8px → rem */
}

/* 图书信息区域 - 响应式文字/按钮 */
.book-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.625rem 0; /* 10px → rem */
}

/* 标题 - 响应式字体大小 */
.book-detail-name {
  font-size: clamp(1.5rem, 3vw, 1.875rem); /* 最小24px，最大30px，随屏幕宽度缩放 */
  font-weight: bold;
  margin-bottom: 0.9375rem; /* 15px → rem */
  color: #000000;
  /* 小屏幕：进一步适配 */
  @media (max-width: 768px) {
    font-size: clamp(1.25rem, 4vw, 1.5rem); /* 最小20px，最大24px */
    text-align: center;
  }
}

/* 作者/分类/库存 - 响应式字体 */
.book-detail-author,
.book-detail-category,
.book-detail-stock {
  font-size: clamp(1rem, 2vw, 1.125rem); /* 最小16px，最大18px */
  color: #1e1e1e;
  font-weight: 600;
  margin-bottom: 0.625rem; /* 10px → rem */
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    text-align: center;
  }
}

/* 价格 - 响应式大号字体 */
.book-detail-price {
  font-size: clamp(1.75rem, 4vw, 2rem); /* 最小28px，最大32px */
  color: #e6a23c;
  font-weight: bold;
  margin: 0.9375rem 0; /* 15px → rem */
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    text-align: center;
    font-size: clamp(1.5rem, 5vw, 1.75rem); /* 最小24px，最大28px */
  }
}

/* 数量选择器 - 响应式 */
.book-detail-count {
  margin: 1.25rem 0; /* 20px → rem */
  width: clamp(9.375rem, 15vw, 10rem); /* 最小150px，最大160px */
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    margin: 1.25rem auto; /* 居中 */
  }
}

/* 加入购物车按钮 - 响应式尺寸 */
.add-cart-btn {
  width: clamp(12.5rem, 20vw, 13.75rem); /* 最小200px，最大220px */
  height: clamp(2.5rem, 5vw, 2.75rem); /* 最小40px，最大44px */
  font-size: clamp(1rem, 2vw, 1.125rem); /* 按钮文字跟随缩放 */
  background-color: #e6a23c !important;
  border: none !important;
  @media (max-width: 768px) {
    margin: 0 auto;
    width: 100%;
    max-width: 12.5rem;
  }
}

.add-cart-btn:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
}
.add-cart-btn1 {
  width: clamp(12.5rem, 20vw, 13.75rem); /* 最小200px，最大220px */
  height: clamp(2.5rem, 5vw, 2.75rem); /* 最小40px，最大44px */
  font-size: clamp(1rem, 2vw, 1.125rem); /* 按钮文字跟随缩放 */
  background-color: #e6a23c !important;
  border: none !important;
  margin-left: 0px;
  @media (max-width: 768px) {
    margin: 0 auto;
    width: 100%;
    max-width: 12.5rem;
  }
}

.add-cart-btn1:disabled {
  background-color: #95a5a6 !important;
}

/* 图书简介/目录 - 响应式样式 */
.book-detail-desc {
  padding: 1.25rem; /* 20px → rem */
  background: linear-gradient(
    -90deg,
    #b6b5b3 0%,
    #f0f2f5 25%,
    #aaa8a6 50%,
    #f0f2f5 75%,
    #b6b5b3 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem; /* 8px → rem */
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0.9375rem; /* 15px */
  }
}
.book-detail-desc1 {
  margin-top: 0.625rem; /* 10px → rem */
  padding: 1.25rem; /* 20px → rem */
  background: linear-gradient(
    -90deg,
    #b6b5b3 0%,
    #f0f2f5 25%,
    #aaa8a6 50%,
    #f0f2f5 75%,
    #b6b5b3 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem; /* 8px → rem */
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0.9375rem; /* 15px */
  }
}
.book-detail-desc1 h3,
.book-detail-desc h3 {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem); /* 最小18px，最大20px */
  margin-bottom: 0.9375rem; /* 15px → rem */
  color: #645703;
  border-bottom: 0.0625rem solid #2c3e50; /* 1px → rem */
  padding-bottom: 0.625rem; /* 10px → rem */
  user-select: none !important;
  -webkit-user-select: none !important;
}

.book-detail-desc p,
.book-detail-desc1 p {
  font-size: clamp(1rem, 2vw, 1.125rem); /* 最小16px，最大18px */
  line-height: 1.8;
  color: #000000;
}

.sci-fi-title {
  text-align: center;
  margin: 1.875rem 0; /* 30px → rem */
  color: #409eff;
  text-shadow: 0 0 0.625rem rgba(64, 158, 255, 0.3); /* 10px → rem */
  user-select: none !important;
  -webkit-user-select: none !important;
}

.loading-tip {
  text-align: center;
  font-size: clamp(1.25rem, 3vw, 1.5rem); /* 最小20px，最大24px */
  color: #999;
  margin-top: 6.25rem; /* 100px → rem */
}

/* 适配element-plus样式 - 响应式 */
:deep(.el-input-number) {
  --el-input-number-bg-color: #121a28;
  --el-input-number-text-color: #fff;
  --el-border-color: #34495e;
  font-size: clamp(1rem, 2vw, 1.125rem); /* 输入框文字缩放 */
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  color: #fff;
  font-size: clamp(0.875rem, 1.5vw, 1rem); /* 增减按钮文字缩放 */
}

.nav-left {
  width: 13.75rem; /* 220px → rem */
  flex-shrink: 0;
  text-align: left;
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    margin-bottom: 0.625rem;
  }
}

.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem); /* 最小20px，最大24px */
  white-space: nowrap;
  line-height: 3.75rem; /* 60px → rem */
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    line-height: 2.5rem; /* 40px */
  }
}

.nav-center1 {
  display: flex;
  gap: 1.5625rem; /* 25px → rem */
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: fit-content;
  position: relative;
  left: 6.1%;
  @media (max-width: 768px) {
    width: 100%;
    left: 0;
    gap: 0.9375rem; /* 15px */
    margin-bottom: 0.625rem;
  }
}

.nav-right1 {
  width: 23.75rem; /* 380px → rem */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #ffffff;
  gap: 0.75rem; /* 12px → rem */
  white-space: nowrap;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 0.625rem;
  }
}

.login-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 12px → rem */
  white-space: nowrap;
}

.login-bar span {
  white-space: nowrap;
  font-size: clamp(1rem, 2vw, 1.125rem); /* 最小16px，最大18px */

  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.home-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem; /* 20px → rem */
  background-color: #0a0e17;
  overflow: visible;
  z-index: 9999;
}

.home-banner {
  height: 25rem; /* 400px → rem */
  background: linear-gradient(135deg, #0a0e17 0%, #121a28 100%);
  border-radius: 0.75rem; /* 12px → rem */
  margin: 1.25rem 0; /* 20px → rem */
  @media (max-width: 768px) {
    height: 15rem; /* 240px */
  }
}

.syws {
  display: flex;
  background: linear-gradient(0deg, #5073c7 0%, #121a28 100%);
  border-radius: 0.375rem; /* 6px → rem */
  padding: 0.375rem 0.875rem; /* 6px 14px → rem */
  align-items: center;
  justify-content: center;
}

.syses,
.syses1 {
  color: rgb(255, 255, 255);
  font-size: clamp(1rem, 2vw, 1.125rem); /* 最小16px，最大18px */
  text-decoration: none;
  line-height: 1.2;
}

.syses:hover,
.syses1:hover {
  color: #29a7ef;
}

/* 预览器容器 - 响应式 */
:deep(.el-image-viewer__wrapper) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  transition: transform 0.3s ease-out;
}

:deep(.el-image-viewer__canvas) {
  position: absolute;
  top: 0;
  left: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.3s ease-out;
  width: 100%;
  height: 100%;
}

/* 预览图片 - 响应式尺寸 */
:deep(.el-image-viewer__img) {
  object-fit: contain;
  transition: transform 0.25s ease-out;
  transform-origin: center center;
  cursor: grab;
  width: auto !important;
  height: clamp(20rem, 60vw, 25rem) !important; /* 最小320px，最大400px，随屏幕缩放 */
}

:deep(.el-image-viewer__img:active) {
  cursor: grabbing;
}

/* 关闭按钮 - 响应式 */
:deep(.el-image-viewer__close) {
  transform: translateX(7.5rem) !important; /* 120px → rem */
  width: 3.125rem !important; /* 50px → rem */
  height: 3.125rem !important; /* 50px → rem */
  border-radius: 50% !important;
  background: rgba(188, 183, 183, 0.7);
  color: #ff0000 !important;
  font-size: 1.25rem; /* 20px → rem */
  z-index: 9999 !important;
  display: flex !important;
  position: relative;
  margin-left: 25%;
  top: 8.75rem; /* 140px → rem */
  pointer-events: auto !important;
  font-weight: 700;
  @media (max-width: 768px) {
    top: 5rem; /* 80px */
    margin-left: 15%;
    width: 2.5rem !important; /* 40px */
    height: 2.5rem !important; /* 40px */
    font-size: 1rem; /* 16px */
  }
}

:deep(.el-image-viewer__close .el-icon) {
  color: #ff0000 !important;
  font-size: 1.375rem; /* 22px → rem */
  font-weight: 1900;
}

:deep(.el-image-viewer__canvas::-webkit-scrollbar) {
  display: none;
}

:deep(.el-image-viewer__mask) {
  background: rgba(0, 0, 0, 0.92);
}

:deep(.el-image-viewer__actions) {
  bottom: 1.25rem; /* 20px → rem */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(154, 148, 148, 0.5);
  border-radius: 1.25rem; /* 20px → rem */
  padding: 0 0.625rem; /* 10px → rem */
}

/* 简介/目录 展开收起 - 响应式 */
.desc-content {
  display: -webkit-box;
  -webkit-line-clamp: 9;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem); /* 文字缩放 */
}
.desc-content.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.mulu-content {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  text-indent: 0 !important;
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem); /* 文字缩放 */
}
.mulu-content.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.expand-btn {
  color: #409eff !important;
  margin-top: 0.5rem; /* 8px → rem */
  padding: 0;
  font-size: clamp(0.875rem, 1.5vw, 1rem); /* 最小14px，最大16px */
}
.expand-btn:hover {
  color: #66b1ff !important;
}
</style>
