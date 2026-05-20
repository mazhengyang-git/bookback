<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
// 引入封装API
import { getBookDetailApi } from '@/api/front/book'
import { getSellerBookDetailApi } from '@/api/seller/front'

import { getnewBookDetailApi } from '@/api/front/newbook'
import type { Book } from '@/types/index'
import { useCartStore } from '@/store/modules/cart'
import { useShoucangStore } from '@/store/shoucang'
import { useUserStore } from '@/store/modules/user'
import request from '@/utils/request'
//@ts-ignore
import { getDirectPayGoodsInfo } from '@/api/front/pay'
import BookComment from '@/views/front/book/bookcomment.vue'
import { getBookAvgScore, getCommentList } from '@/api/front/bookComment'
import footere from '@/views/front/biaoqian/footer.vue'
const getDiscountPrice = (book: any) => Number(book.discount_price ?? book.price) || 0
const hasDiscount = (book: any) => !!book?.discount_price && book.discount_price < book.price
const router = useRouter()
const route = useRoute()

// 价格格式化
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}
const dingbu=()=>{
  window.scrollTo(0,0)
}
// 导航悬浮逻辑
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

function go(path: string) {
  router.push(path)
}

const goSellerShop = () => {
  if (sellerShop.value?.shop_id) {
    router.push(`/shop/${sellerShop.value.shop_id}`)
  }
}

const handleShare = () => {
  const bookTitle = book.value?.name || '星途科幻图书'
  if (navigator.share) {
    navigator.share({ 
      title: bookTitle, 
      url: window.location.href 
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('链接已复制到剪贴板'))
      .catch(() => {})
  }
}
// 评分/评论
const localAvgScore = ref<number | null>(null)
const commentTotalCount = ref<number>(0)
const randomComments = ref<any[]>([])
const fetchScoreAndRandomComments = async (bookId: number, source: string) => {
  if (!bookId || !source) return
  try {
    const scoreRes = await getBookAvgScore(bookId, source)
    //@ts-ignore
    if (scoreRes.code === 200) {
      localAvgScore.value = scoreRes.data.avgScore || 0.0
      commentTotalCount.value = scoreRes.data.commentCount || 0
    }
  } catch (err) {
    console.error('获取图书评分失败', err)
  }

  try {
    const listRes = await getCommentList(bookId, source)
    //@ts-ignore
    if (listRes.code === 200 && Array.isArray(listRes.data)) {
      const shuffledList = [...listRes.data].sort(() => Math.random() - 0.5)
      randomComments.value = shuffledList.slice(0, 3)
    }
  } catch (err) {
    console.error('获取评论列表失败', err)
  }
}

// 图片预览
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
      canvas.style.overflow = 'hidden'
      //@ts-ignore
      canvas.style.scrollTop = 0
      //@ts-ignore
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

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 获取路由参数
const bookId = computed(() => Number(route.params.id))
const bookType = computed(() => Number(route.query.book_type ?? 0)) // 0=普通 1=新书 2=卖家自营
const isSellerBook = computed(() => bookType.value === 2)
// 新书类型判断
const isNewBook = computed(() => bookType.value === 1)
//@ts-ignore
const source = computed(() => (bookType.value == 1 ? 'new' : bookType.value == 2 ? 'seller' : 'normal'))
const sellerShop = ref<{ shop_id?: number; shop_name?: string; seller_avatar?: string } | null>(null)

// 状态
const cartStore = useCartStore()
const shoucangStore = useShoucangStore()
const userStore = useUserStore()
const loading = ref(true)
// Book类型
const book = ref<Book & { discount_price?: string | number; discount_rate?: string | number } | null>(null)
const buyCount = ref(1)

// 展开/收起
const isDescExpanded = ref(false)
const isMuluExpanded = ref(false)
const isMuluExpanded1 = ref(false)
const showDescExpand = ref(false)
const showMuluExpand = ref(false)
const showMuluExpand1 = ref(false)
const descRef = ref<HTMLElement | null>(null)
const muluRef = ref<HTMLElement | null>(null)
const muluRef1 = ref<HTMLElement | null>(null)
const commentVisible = ref(false)

// 调用新书/普通/卖家接口
const loadBookDetail = async () => {
  const currentBookId = bookId.value
  if (!currentBookId) return

  try {
    loading.value = true
    let res = null

    // 三级判断：新书 → 卖家书 → 普通书
    if (isNewBook.value) {
      // 新书：调用接口
      res = await getnewBookDetailApi(currentBookId)
    } else if (isSellerBook.value) {
      // 卖家书
      res = await getSellerBookDetailApi(currentBookId)
    } else {
      // 普通书
      res = await getBookDetailApi(currentBookId, { book_type: 0 })
    }

    //@ts-ignore
    if (res.code === 200 && res.data) {
      //@ts-ignore
      book.value = res.data
      console.log('详情页数据：', book.value)
      if (isSellerBook.value) {
        //@ts-ignore
        sellerShop.value = {
          //@ts-ignore
          shop_id: res.data.shop_id,
          //@ts-ignore
          shop_name: res.data.shop_name,
          //@ts-ignore
          seller_avatar: res.data.seller_avatar,
        }
      } else {
        sellerShop.value = null
      }
    } else {
      ElMessage.error('未找到该图书数据')
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
      goodsId: book.value.id,
      num: buyCount.value,
      spec: '平装版',
      source: source.value,
    })
    cartStore.addToCart({
      id: book.value.id,
      name: book.value.name || '未知图书',
      price: Number(book.value.discount_price || book.value.price) || 0,
      count: buyCount.value,
      cover: book.value.cover || '/img/default-book.jpg',
      cartId: 0,
      spec: '',
      //@ts-ignore
      source: source.value,
    })
    ElMessage.success({ message: '加入购物车成功', offset: 80 })
  } catch (err) {
    console.error('加入购物车失败：', err)
    ElMessage.error({ message: '加入购物车失败，请稍后重试', offset: 80 })
  }
}

// 收藏
const addToShoucang = async () => {
  if (!book.value) {
    ElMessage.warning({ message: '图书信息加载失败，无法收藏', offset: 160 })
    return
  }
  if (!userStore.token) {
    ElMessage.warning({ message: '请先登录后再收藏', offset: 160 })
    return
  }

  try {
    const res = await request.post('/api/shoucang/add', {
      goodsId: book.value.id,
      num: buyCount.value,
      spec: '平装版',
      source: source.value,
      bookName: book.value.name,
      bookCover: book.value.cover,
      bookPrice: book.value.discount_price || book.value.price
    })
    //@ts-ignore
    if (res.code === 200) {
      shoucangStore.addToShoucang({
        id: book.value.id,
        name: book.value.name || '未知图书',
        cover: book.value.cover || '/img/default-book.jpg',
        shoucangId: 0,
        price: Number(book.value.discount_price || book.value.price) || 0,
        spec: '',
        source: source.value,
      })
      ElMessage.success({ message: '收藏成功', offset: 160 })
    } else {
      //@ts-ignore
      ElMessage.error({ message: res.msg, offset: 160 })
    }
  } catch (err) {
    console.error('收藏失败：', err)
    ElMessage.error({ message: '收藏失败，请稍后重试', offset: 160 })
  }
}

// 支付
const handlePay = async () => {
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

  router.push({
    path: '/pay/direct',
    query: {
      bookId: book.value.id.toString(),
      buyCount: buyCount.value.toString(),
      source: source.value,
    }
  })
}

// 刷新评分
const refreshScoreData = () => {
  fetchScoreAndRandomComments(bookId.value, source.value)
}

onMounted(async () => {
  window.scrollTo(0, 0)
})

// 监听参数变化
watch(
  [bookId, bookType],
  //@ts-ignore
  async ([newBookId, newType]) => {
    if (!newBookId) return
    await loadBookDetail()
    nextTick(() => {
      //@ts-ignore
      showDescExpand.value = descRef.value?.scrollHeight > descRef.value?.clientHeight
      //@ts-ignore
      showMuluExpand.value = muluRef.value?.scrollHeight > muluRef.value?.clientHeight
      //@ts-ignore
      showMuluExpand1.value = muluRef1.value?.scrollHeight > muluRef1.value?.clientHeight
      fetchScoreAndRandomComments(newBookId, source.value)
    })
  },
  { immediate: true }
)
</script>

<template>
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
          <span class="acwy">
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=太空歌剧')">太空歌剧</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=赛博朋克')">赛博朋克</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=时间旅行')">时间旅行</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=智能纪元')">智能纪元</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=外星文明')">外星文明</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=末世废土')">末世废土</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=星际灾厄')">星际灾厄</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=虚幻惊悚')">虚幻惊悚</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=星系攻略')">星系攻略</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=次元交互')">次元交互</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=梦灵空间')">梦灵空间</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=自然谜团')">自然谜团</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac1" @click="go('/books?category=平行宇宙')">平行宇宙</el-button>
            <el-button style="color: #000;font-weight: 550;" v-if="showhover" class="ac2" @click="go('/books?category=意识陷落')">意识陷落</el-button>
          </span>
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <div style="position: relative; left: -89px; margin-top: 10px" v-if="!userStore.isLogin">
        <el-button style="color: black; font-weight: 600; font-size: 20px" type="primary" link @click="$router.push('/login')">登录</el-button>
        <el-button style="color: black; font-weight: 600; font-size: 20px" type="primary" link @click="$router.push('/register')">注册</el-button>
      </div>
      <div v-else class="login-bar">
        <span style="user-select: none !important;-webkit-user-select: none !important;color: green;font-size: 22px;position: relative;" class="welcome-text">欢迎：{{ userStore.user?.username }}</span>
        <el-button style="font-size: 17px; color: black" link @click="$router.push('/user')">
          <!--@vue-ignore--><img style="width: 24px; height auto" src="/img/个人中心.png" />个人中心
        </el-button><!--@vue-ignore-->
        <el-button style="font-size: 17px; color: red" link @click="$router.push('/cart')">
          <img class="gwdh" style="width: 24px; height: auto; margin-right: 3px" src="/img/购物车.png" />购物车
        </el-button>
        <el-button style="color: white; background-color: red; position: relative" type="danger" link @click="handleLogout">退出</el-button>
      </div>
    </div>
  </div>
  
  <div v-if="book" class="book-detail-container" v-cloak>
    <div class="book-detail-content">
      <el-button class="ziwy" style="position: absolute; font-size: 17px; margin-left: 250px; top: 19px;z-index:10 " link @click="go('/shoucang')">
        <img class="gwdh1" style="width: 32px; height: auto; margin-right: 3px;" src="/img/收藏夹.png" /><span style="color:red">收藏夹</span>
      </el-button>
       <el-button link class="ziwy2" @click="dingbu"><span>↑</span></el-button>
      
      <!-- 左侧：图书封面 -->
      <div class="book-detail-cover" ref="coverRef">
        <el-image
          :src="book.cover || '/img/default-book.jpg'"
          referrerpolicy="no-referrer"
          alt="图书封面"
          :preview-src-list="[book.cover || '/img/default-book.jpg']"
          fit="cover"
          @show="handlePreviewShow"
          @error="(e) => (e.target.src = '/img/default-book.jpg')"
        />
      </div>

      <!-- 右侧：图书信息区 -->
      <div class="book-detail-info">
        <div class="info-main">
          <h1 class="book-detail-name">{{ book.name || '未知图书' }}</h1>
          <button style="white-space: nowrop !important;" class="btn-share" @click="handleShare">
            分享→
          </button>
          <el-tag v-if="isSellerBook" type="warning" class="seller-tag">商家自营</el-tag>
          <el-tag v-else-if="isNewBook" type="success" class="seller-tag">新书上架</el-tag>
          <p class="book-detail-author">作者：{{ book.author || '未知作者' }}</p>
          <p class="book-detail-category">分类：{{ book.category || '未知分类' }}</p>
          
          <!-- 优惠价格展示 + 折扣率容错 -->
          <div class="price-group" style="margin: 10px 0;">
  <!-- 有优惠价 且 优惠价 < 原价 -->
  <template v-if="book.discount_price !== null && book.discount_price !== undefined && Number(book.discount_price) < Number(book.price)">
    <span style="text-decoration: line-through; color: #999; font-size: 16px;">¥{{ formatPrice(book.price) }}</span>
    <span style="color: #f56c6c; font-size: 24px; font-weight: bold; margin: 0 10px;">¥{{ formatPrice(book.discount_price) }}</span>
    <!-- 自动计算折扣率 -->
    <el-tag type="danger">
      {{ ((Number(book.discount_price) / Number(book.price)) * 10).toFixed(1) }}折
    </el-tag>
  </template>
  <span style="font-size: 24px; font-weight: bold;color: orange;" v-else>¥{{ formatPrice(book.price) }}</span>
</div>
          <p class="book-detail-stock">库存：{{ book.stock || 0 }}本</p>
          <p class="book-detail-stock book-detail-sales">销量：{{ Number(book.sales_count) || 0 }}件</p>
          <p class="book-detail-stock">出版社：{{ book.publisher}}</p>

          <!-- 商家店铺模块 -->
          <div v-if="isSellerBook && sellerShop" class="seller-shop-block" @click="goSellerShop">
            <el-avatar :size="48" :src="sellerShop.seller_avatar || '/img/default-avatar.png'" />
            <div class="seller-shop-text">
              <span class="seller-shop-label">商家店铺</span>
              <span class="seller-shop-name">{{ sellerShop.shop_name }}</span>
            </div>
          </div>
          
          <div class="book-detail-count">
            <el-input-number v-model="buyCount" :min="1" :max="book.stock || 1" label="购买数量" />
          </div>

          <div class="anniuwy">
            <el-button type="primary" size="large" class="add-cart-btn" @click="addToCart" :disabled="!userStore.token">
              {{ userStore.token ? '加入购物车' : '加入购物车? 请先登录' }}
            </el-button>
            <el-button type="primary" size="large" class="add-cart-btn2" @click="addToShoucang" :disabled="!userStore.token">
              {{ userStore.token ? '收藏图书' : '收藏图书? 请先登录' }}
            </el-button>
            <el-button type="primary" size="large" class="add-cart-btn1" @click="handlePay">去支付</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="comment-preview-box">
      <h4>图书综合评分</h4>
      <div class="score-display">
        <el-rate v-if="localAvgScore !== null" v-model="localAvgScore" disabled :max="5" show-score text-color="#ff7d00" :score-format="(value) => value.toFixed(1)" />
        <span class="comment-count">共 {{ commentTotalCount }} 人评价</span>
      </div>

      <div class="random-comments">
        <div class="comment-item" v-for="(comment, index) in randomComments" :key="comment.id ?? index">
          <el-rate v-if="comment.score != null" v-model="comment.score" disabled :max="5" size="small" :score-format="(val) => val.toFixed(1)" />
          <p class="comment-content">{{ comment.content || '用户无文字评价' }}</p>
        </div>
      </div>

      <el-button type="success" class="add-cart-btn11" style="margin-top: 15px; width: 100%" size="large" @click="commentVisible = true">查看图书评价</el-button>
    </div>

    <div class="book-detail-desc">
      <h3>图书简介</h3>
      <p ref="descRef" class="desc-content" :class="{ expanded: isDescExpanded }" style="text-indent: 2em; white-space: pre-wrap">
        {{ book.desc || '暂无简介' }}
      </p>
      <el-button v-if="showDescExpand" link class="expand-btn" @click="isDescExpanded = !isDescExpanded">
        {{ isDescExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <div class="book-detail-desc1">
      <h3>目录展示</h3>
      <p ref="muluRef" class="mulu-content" :class="{ expanded: isMuluExpanded }" style="text-indent: 2em; white-space: pre-wrap">
        {{ book.mulu || '暂无目录' }}
      </p>
      <el-button v-if="showMuluExpand" link class="expand-btn" @click="isMuluExpanded = !isMuluExpanded">
        {{ isMuluExpanded ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <div class="book-detail-desc2">
      <h3>作者简介</h3>
      <p ref="muluRef1" class="mulu-content1" :class="{ expanded: isMuluExpanded1 }" style="text-indent: 2em; white-space: pre-wrap">
        {{ book.author_into || '暂无简介' }}
      </p>
      <el-button v-if="showMuluExpand1" link class="expand-btn1" @click="isMuluExpanded1 = !isMuluExpanded1">
        {{ isMuluExpanded1 ? '收起' : '展开全部' }}
      </el-button>
    </div>

    <el-dialog v-model="commentVisible" title="图书评价中心" width="750px" append-to-body close-on-click-modal close-on-press-escape destroy-on-close>
      <BookComment :book-id="bookId" :source="source" @comment-updated="refreshScoreData" />
    </el-dialog>
  </div>

  <div v-else class="loading-tip">加载中...</div>
  <div v-if="book" v-cloak><div class="twy"><footere/></div></div>
</template>
<style scoped>
.anniuwy{
  margin-top: -28px;
  width: fit-content !important;
display: flex !important;
flex-direction: column;
}
        .btn-share {
        
          position: absolute;
        right: 20px;
        margin-top: -85px;
  flex: 1;
  padding: 9px;
  border: 1px solid rgba(139,92,246,0.4);
  border-radius: 8px;
  font-size: 16px;
  width: auto;
  font-weight: 600;
  cursor: pointer;
  color: #961c00;
  background: transparent;
  transition: all 0.2s;
}

.btn-share:hover { background: rgba(139,92,246,0.15); }
            .price-group{

            }
/* 基础响应式配置 */
:root {
  font-size: 16px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-leave-to {
  opacity: 0;
}
.black-mask {
  position: fixed;
  inset: 0;
  background: #eae8e8;
  z-index: 19999;
}

/* 顶部导航 */
.home-top-nav {
  width: 100%;
  height: 3.75rem;
  opacity: 0.9;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1));
  border-bottom: 1px solid rgba(5, 44, 84, 0.3);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 999 !important;
}
@media (max-width: 768px) {
  .home-top-nav {
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
  z-index: 9996 !important;
}
.acwy {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  margin-top: 2px;
}

.ac1, .ac2 {
  width: clamp(101px, 10vw, 117.7px) !important;
  padding: 7px 20px !important;
  height: auto !important;
  text-align: center;
  box-sizing: border-box;
  margin: 0 !important;
  border: 1px solid black !important;
}
.ac1 {
  border-radius: 4px 4px 0 0 !important;
  left: unset !important;
}
.ac2 {
  border-radius: 0 0 4px 4px !important;
  margin-top: -1px !important;
  left: unset !important;
}

/* 图书详情容器 */
.book-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem;
  background-color: #f9f7f7ac;
  min-height: 101vh;
  position: relative;
  overflow: visible;
}
@media (max-width: 768px) {
  .book-detail-container {
    padding: 0.625rem;
  }
}

.book-detail-content {
  display: flex;
  gap: 1.875rem;
  margin-bottom: 2.5rem;
  padding: 1.25rem;
  background: linear-gradient(90deg, #f6f4f4 25%, #ffffff 58%, #d4d2d20f 25%);
  background-attachment: fixed;
  background-size: cover;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  align-items: flex-start; /* 顶部对齐，避免高度错位 */
}
@media (max-width: 768px) {
  .book-detail-content {
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.9375rem;
  }
}

/* 图书封面*/
.book-detail-cover {
  width: 22rem;
  height: auto;
  max-height: 33rem;
 
  border-radius: 0.5rem;
  border: 0.0625rem solid #34495e;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.book-detail-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
  user-select: none !important;
}
.book-detail-cover :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
}

/* 图书信息主体：flex布局，桌面端左右排列 */
.book-detail-info {
  flex: 1;
  display: flex;
  gap: 2rem;
  justify-content: flex-start;
  padding: 0.625rem 0;
  flex-wrap: wrap;
  align-items: flex-start; /* 和封面顶部对齐 */
}
.info-main {
  flex: 1;
  min-width: 280px;
}

.info-main > * {
  margin-bottom: 0.75rem;
}
.seller-tag {
  color: rgb(105, 0, 0) !important;
  background-color: #e09a75d8;
  font-weight: 550;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  width: 110px;
  margin-top: -10px;
  -webkit-transform: scale(1);
  -moz-transform: scale(1);
  -ms-transform: scale(1);
  -o-transform: scale(1);
  font-size: 16px !important;
}
.book-detail-name {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: bold;
  margin-bottom: 0.9375rem;
  color: #000000;
}
.book-detail-author {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #1e1e1e;
  font-weight: 600;
  margin-bottom: 0.625rem;
}
.book-detail-category,
.book-detail-stock,
.book-detail-sales {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #1e1e1e;
  font-weight: 600;
  margin-bottom: 0.625rem;
  user-select: none !important;
}

/* 按钮样式 */
.add-cart-btn, .add-cart-btn2, .add-cart-btn1 {
  width: clamp(12.5rem, 20vw, 13.75rem);
  height: clamp(2.5rem, 5vw, 2.75rem);
  font-size: clamp(1rem, 2vw, 1.125rem);
  background-color: #e6a23c !important;
  border: none !important;
  margin-left: 0;
  transition: all -1s ease;
  position: relative !important;
  margin-top: 1rem;
}
.add-cart-btn:disabled, .add-cart-btn2:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
}

/* 商家店铺模块 */
.seller-shop-block {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
  margin: 12px 0;
  padding: 12px 16px;
  background: #fff8e6;
  border: 1px solid #f5d78e;
  border-radius: 8px;
  cursor: pointer;
}
.seller-shop-block:hover {
  background: #fff3d0;
}
.seller-shop-text {
  display: flex;
  flex-direction: column;
}
.seller-shop-label {
  font-size: 12px;
  color: #909399;
}
.seller-shop-name {
  font-size: 16px;
  font-weight: 600;
  color: #e6a23c;
}

/* 图书数量输入框 */
.book-detail-count {
 
  margin: 1.25rem 0;
  width: clamp(9.375rem, 15vw, 10rem);
  margin-top: -3px;
  user-select: none !important;
}

/* 右侧评论框 */
.comment-preview-box {
  margin-top: 0;
  display: block;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid #eeeeee;
  width: 80%px;
  height: clamp(290px, 13vw, 395px);
  transition: all 0.9s ease;
  flex-shrink: 0; /* 不压缩宽度 */
}

.comment-preview-box h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}
.score-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.score-text {
  font-size: 18px;
  font-weight: bold;
  color: #ff7d00;
}
.comment-count {
  font-size: 13px;
  color: #999;
  margin-left: auto;
}
.random-comments {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 36%;
}
.comment-item {
  padding-bottom: 8px;
  border-bottom: 1px dashed #eeeeee;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-content {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  word-break: break-all;
}

/* 简介/目录/作者模块样式*/
.book-detail-desc, .book-detail-desc1, .book-detail-desc2 {
  padding: 1.25rem;
  background: linear-gradient(
    -90deg,
    #e0dfdf 0%,
    #f0f2f5 25%,
    #ffffff 50%,
    #f0f2f5c1 75%,
    #dddddb 100%
  );
  background-attachment: fixed;
  border-radius: 0.5rem;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}
@media (max-width: 768px) {
  .book-detail-desc, .book-detail-desc1, .book-detail-desc2 {
    padding: 0.9375rem;
  }
}
.book-detail-desc1 {
  margin-top: 0.625rem;
}
.book-detail-desc2 {
  margin-top: 0.625rem;
}
.book-detail-desc1 h3,
.book-detail-desc h3,
.book-detail-desc2 h3 {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  margin-bottom: 0.9375rem;
  color: #645703;
  border-bottom: 0.0625rem solid #2c3e50;
  padding-bottom: 0.625rem;
}
.book-detail-desc p,
.book-detail-desc1 p,
.book-detail-desc2 p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.8;
  color: #000000;
}


/* 导航样式 */
.nav-left {
  width: 13.75rem;
  flex-shrink: 0;
  text-align: left;
}
@media (max-width: 768px) {
  .nav-left {
    width: 100%;
    text-align: center;
    margin-bottom: 0.625rem;
  }
}
.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  white-space: nowrap;
  line-height: 3.75rem;
}
.nav-center1 {
  display: flex;
  gap: 1.5625rem;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: fit-content;
  position: relative;
  margin-left: -40px;
  margin-right: 36px;
}
.nav-right1 {
  width: 23.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #ffffff;
  gap: 0.75rem;
  white-space: nowrap;
}
.login-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  left: clamp(20px, 1vw, 0px);
  white-space: nowrap;
}
.login-bar span {
  white-space: nowrap;
  font-size: clamp(1rem, 2vw, 1.125rem);
  background: linear-gradient(135deg, #141414, #ff0000);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent !important;
}
.syws {
  display: flex;
  background: rgba(22,93,255,0.08) !important;
  border: 1px solid rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  border-radius: 0.375rem;
  padding: 0.375rem 0.875rem;
  align-items: center;
  justify-content: center;
}
.syses {
  color: rgb(0, 0, 0);
  font-size: clamp(1rem, 2vw, 1.125rem);
  text-decoration: none;
}
.syses:hover {
  color: #ec8f33;
  text-shadow: 0 0 8px rgba(220, 223, 226, 0.5);
}

/* 封面图片放大查看样式 */
:deep(.el-image-viewer__wrapper) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
:deep(.el-image-viewer__canvas) {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
:deep(.el-image-viewer__img) {
  object-fit: contain;
  transform-origin: center center;
  cursor: grab;
}
:deep(.el-image-viewer__img:active) {
  cursor: grabbing;
}
:deep(.el-image-viewer__close) {
  top: 5px;
  width: 3.125rem !important;
  height: 3.125rem !important;
  position: relative;
  left: 446px;
  font-weight: 700 !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.7);
  color: #ff0000 !important;
  font-size: 1.25rem;
  border: #000000 2px solid !important;
  z-index: 9999 !important;
}
@media (max-width: 1468px) {
  :deep(.el-image-viewer__close) {
    left: 360px;
  }
}
@media (max-width: 1368px) {
  :deep(.el-image-viewer__close) {
    left: 260px;
  }
}
@media (max-width: 1168px) {
  :deep(.el-image-viewer__close) {
    left: 230px;
  }
}
@media (max-width: 968px) {
  :deep(.el-image-viewer__close) {
    left: 120px;
  }
}
@media (max-width: 768px) {
  :deep(.el-image-viewer__close) {
    left: 40px;
  }
}
@media (max-width: 668px) {
  :deep(.el-image-viewer__close) {
    left: 0px;
  }
}
:deep(.el-image-viewer__mask) {
  background: rgba(0, 0, 0, 0.92);
}

/* 展开收起按钮样式 */
.desc-content {
  display: -webkit-box;
  -webkit-line-clamp: 9;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  line-height: 1.8;
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
}
.mulu-content1 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  text-indent: 0 !important;
}
.mulu-content.expanded,
.mulu-content1.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}
.expand-btn, .expand-btn1 {
  color: #409eff !important;
  margin-top: 0.5rem;
  padding: 0;
}

.loading-tip {
  text-align: center;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  color: #999;
  margin-top: 6.25rem;
}

/* 固定按钮样式 */
.ziwy2{
  position: fixed !important;
  top: 69.5vh !important;
  right: 0 !important;
  z-index: 9999 !important;
  height: auto;
  background-color: #79787881 !important ;
  font-size: 32px !important;
  font-weight: 900 !important;
  padding-left: 9px;
  padding-right: 9px;
  transform: translateX(0px);
  padding-top: 7px;
  padding-bottom: 7px !important;
  padding-left: 9px !important;
  padding-right: 9px !important;
  width: 50px;
  color: #ffffff;
  transition: all 0.25s ease;
}
.ziwy2:hover{
  transform: translateX(0px);
  color: #ff0000;
}
.ziwy{
  position: fixed !important;
  top: 49.5vh !important;
  right: 0 !important;
  z-index: 9999 !important;
  width: auto;
  height: auto;
  background-color: #0000001e !important;
  border-radius: 12px 0 0 12px;
  transform: translateX(55px);
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 7px;
  transition: all 0.3s ease;
}
.ziwy:hover{
  transform: translateX(0px);
}
.gwdh1 {
  animation: gwdh1 2s infinite;
}
@keyframes gwdh1 {
  0%, 100% { transform: scale(1) rotate3d(0, 0, 0, 0deg); }
  25% { transform: scale(1.1) ; }
  50% { transform: scale(1.15); }
  75% { transform: scale(1.1) ; }
}
.twy{
  bottom: 0;
}
.gwdh {
  animation: gwdh 2s infinite;
}
@keyframes gwdh {
  0%, 100% { transform: scale(1) rotate3d(0, 0, 0, 0deg); }
  25% { transform: scale(1.1) rotate3d(0, 1, 0, 10deg); }
  50% { transform: scale(1.1) rotate3d(0, 1, 1, 12deg); }
  75% { transform: scale(1.1) rotate3d(0, 1, 0, 10deg); }
}

/* 底部波浪背景 */
.wave-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #f0f4f8;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233aa8ec' fill-opacity='0.12' d='M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,160C672,139,768,149,864,160C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%236288a5' fill-opacity='0.09' d='M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: 1440px 320px, 1440px 320px;
  background-position: 0 0, 0 120px;
  background-repeat: repeat-x;
  animation: waveMove 18s linear infinite;
  z-index: -1;
  pointer-events: none;
}
@keyframes waveMove {
  0% { background-position: 0 0, 0 120px; }
  100% { background-position: 1440px 0, -1440px 120px; }
}

@media (max-width: 768px) {
  /* 清除所有导致错位的样式 */
  .add-cart-btn, .add-cart-btn2, .add-cart-btn1,
  .book-detail-name, .book-detail-author, 
  .book-detail-category, .book-detail-stock,
  .seller-tag, .price-group, .seller-shop-block,
  .book-detail-count {
    position: static !important;
    left: auto !important;
    right: auto !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: none !important;
  }

  /* 图书详情主容器：垂直布局，子元素全部居中 */
  .book-detail-content {
    flex-direction: column !important;
    align-items: center !important; /* 所有子元素在交叉轴居中 */
    justify-content: flex-start !important;
    padding: 1rem !important;
  }

  /* 图书封面 */
  .book-detail-cover {
    width: 100% !important;
    max-width: 12rem !important;
    height: auto !important;
    margin: 0 auto 1.5rem !important;
  }

  /* 信息容器：宽度100%，内容居中 */
  .book-detail-info {
    width: 100% !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  /* 信息主体：宽度限制，内容块居中 */
  .info-main {
    width: 100% !important;
    max-width: 400px !important;
    margin: 0 auto !important;
    text-align: center !important;
  }

  /* 所有文本元素：强制居中 */
  .book-detail-name,
  .book-detail-author,
  .book-detail-category,
  .book-detail-stock,
  .book-detail-sales,
  .seller-tag {
    text-align: center !important;
    display: block !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
.seller-tag{
  padding-top: 3.5px;
}
  /* 价格组：弹性居中 */
  .price-group {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 0.5rem !important;
    margin: 1rem auto !important;
  }

  /* 商家店铺模块 */
  .seller-shop-block {
    justify-content: center !important;
    margin: 1rem auto !important;
  }

  /* 数量选择框*/
  .book-detail-count {
    margin: 1.5rem auto !important;
  }

  /* 按钮：强制居中*/
  .add-cart-btn, 
  .add-cart-btn2, 
  .add-cart-btn1 {
    display: block !important;
    width: 100% !important;
    min-width: 10.75rem !important;
    margin: 0,5rem auto !important;
    left: unset !important;
    transform: translateX(66.58%) !important;
    position: static !important;
   margin-top: 16px !important;
  }

 
}
.add-cart-btn11{
  display: block !important;
    width: 100% !important;
    max-width: 13.75rem !important;
    margin: 1rem auto !important;
   
    left: unset !important;
    color: #000;
    font-weight: 600;
    background: linear-gradient(180deg, #ff9d0074 25%, #ebdddd 50%, #ff9d0074 100%);
    position: static !important;
}
.add-cart-btn11:hover{
  color: #ff0000;
}
</style>