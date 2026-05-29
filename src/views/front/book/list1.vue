<template>
  <div class="home-top-nav">
    <div class="nav-left">
      <h2 class="logo1 sci-fi-title1">星途科幻图书 - 优惠专区</h2>
    </div>
    <div class="nav-center1">
      <div class="sejb">
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        </div>
        <div class="syws">
          <el-button link class="syses" @click="$router.push('/huodong')">活动资讯</el-button>
        </div>
      </div>
    </div>
    <div class="nav-right1">
      <div v-if="!userStore.isLogin">
        <el-button
          style="color: black; font-weight: 600; font-size: 20px"
          type="primary"
          link
          @click="$router.push('/login')"
          >登录</el-button
        >
        <el-button
          style="color: black; font-weight: 600; font-size: 20px"
          type="primary"
          link
          @click="$router.push('/register')"
          >注册</el-button
        >
      </div>
      <div v-else class="login-bar">
        <span
          class="welcome-text"
          style="
            user-select: none !important;
            -webkit-user-select: none !important;
            font-size: 24px;
            position: relative;
            left: 10px;
          "
          >欢迎：{{ userStore.user?.username }}</span
        >
        <el-button style="font-size: 17px; color: black" link @click="$router.push('/user')"
          ><img style="width: 24px; height: auto" src="/img/个人中心.png" />个人中心</el-button
        >
        <el-button style="font-size: 17px; color: red" link @click="$router.push('/cart')"
          ><img
            class="gwdh"
            style="width: 26px; height: auto; margin-right: 3px"
            src="/img/购物车.png"
          />购物车</el-button
        >
        <el-button
          style="color: white; background-color: red; position: relative; font-size: 15px"
          type="danger"
          link
          @click="handleLogout"
          >退出</el-button
        >
      </div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="filter-main">
      <el-input
        v-model="searchKeyword"
        placeholder="按图书名称搜索（拼音/汉字）"
        style="font-weight: 600;"
        class="filter-control"
        @keyup.enter="handleSearch"
        @clear="handleClearSearch"
        clearable
      >
        <template #suffix>
          <el-icon class="search-icon" @click="handleSearch">
            <Search />
          </el-icon>
        </template>
      </el-input>
      <el-button
        style="font-weight:600;width: 120px;"
        type="primary"
        :loading="isRefreshing"
        @click="refreshAllData"
      >
        刷新列表
      </el-button>
      <div class="price-filter">
        <el-input
          v-model.number="minPrice"
          type="number"
          placeholder="最低价"
          style="width: 110px"
          @input="doFilterAndShuffle"
          @clear="handlePriceClear"
          clearable
          min="0"
        />
        <span class="price-divider">-</span>
        <el-input
          v-model.number="maxPrice"
          type="number"
          placeholder="最高价"
          style="width: 110px"
          clearable
          min="0"
        />
      </div>
    </div>

    <div class="sort-btns">
      <span style="font-weight: 600;" class="sort-btn" :class="{ active: showType === 'normal' }" @click="showNormalBooks">
        默认图书
      </span>
      <span style="font-weight: 600;" class="sort-btn" :class="{ active: showType === 'new' }" @click="showNewBooks">
        新书速览
      </span>

      <span style="font-weight: 600;" class="sort-btn" :class="{ active: sortBy === 'price' && currentSortDirection === 'asc' }"
            @click="handleSort('asc')">价格从低到高</span>
      <span style="font-weight: 600;" class="sort-btn" :class="{ active: sortBy === 'price' && currentSortDirection === 'desc' }"
            @click="handleSort('desc')">价格从高到低</span>
      <span style="font-weight: 600;" class="sort-btn" :class="{ active: sortBy === 'rating' }"
            @click="handleRatingSort">好评优先</span>
      <span style="font-weight: 600;" class="sort-btn" :class="{ active: sortBy === 'sales' }"
            @click="handleSalesSort">销量最高</span>
    </div>
  </div>
  <el-button
    class="ziwy"
    link
    @click="go('/shoucang')"
    ><img
      class="gwdh1"
      style="width: 32px; height: auto; margin-right: 9px"
      src="/public/img/收藏夹.png"
    /><span style="color: red">收藏夹</span></el-button
  >

  <el-button link class="ziwy2" @click="dingbu"><span style="">↑</span></el-button>
  <div style="padding: 0 20px; background:#fff; margin: 10px 0;"></div>

  <div v-if="!loading" class="book-list-container" v-cloak>
    <div class="book-card-list">
      <el-card 
        v-for="book in showBooks" 
        :key="book.id || book.book_id" 
        class="book-card discount-book-card"
        style="cursor: pointer;"
      >
        <div class="book-card-content">
          <div class="book-cover-wrapper">
            <img @click="goToDetail(book)" :src="book.cover || '/img/default-book.jpg'" class="book-cover" />
            <div class="cover-footer"> 
              <!-- 评分组件渲染 -->
              <pj 
                class="pjwy" 
                :book-id="showType === 'new' ? book.id : book.book_id" 
                :source="showType === 'new' ? 'new' : 'normal'" 
              />
              <span class="sales-text">销量：{{ getBookSales(book) }}件</span>
            </div>
          </div>

          <div class="book-info">
            <h3 @click="goToDetail(book)" class="book-name">{{ book.name }}</h3>
            <p class="book-author">作者：{{ book.author }}</p>
            <p class="book-price">原价：¥{{ formatPrice(book.price) }}</p>
            <p class="discount-price">
              优惠价：¥{{ formatPrice(getDiscountPrice(book)) }}
              <el-tag type="danger" class="discount-tag">{{ getDiscountRate(book) }}</el-tag>
            </p>
            <el-button type="primary" size="large" class="add-cart-btn2" style="margin-left: 0px;" @click="addToShoucang(book)" :disabled="!userStore.token">
                    {{ userStore.token ? '收藏图书' : '收藏图书? 请先登录' }}
                  </el-button>
          </div>
        </div>
      </el-card>

      <div v-if="showBooks.length === 0" class="empty-tip">
        {{ showType === 'new' ? '暂无新书优惠 😕' : '暂无普通图书优惠 😕' }}
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>

  <div v-else class="loading-tip">加载中...</div>

  <div v-if="!loading" v-cloak>
    <div class="page-footer">
      <div class="footer-content">
        <div class="footer-left">
          <h3 class="footer-title">星途科幻图书</h3>
          <p class="footer-slogan">探索宇宙的无限可能</p>
        </div>
        <div class="footer-center">
          <div class="footer-links">
            <a href="/books" class="footer-link">图书一览</a>
            <span class="footer-separator">|</span>
            <a href="/huodong" class="footer-link">热门活动</a>
            <span class="footer-separator">|</span>
            <a href="/user" class="footer-link">个人中心</a>
            <span class="footer-separator">|</span>
            <a href="/cart" class="footer-link">购物仓库</a>
          </div>
        </div>
        <div class="footer-right">
          <p class="footer-copyright">© 2010-2026 xtkh.com 版权所有</p>
          <p class="footer-contact">联系我们：contact@xingtu.com</p>
        </div>
      </div>
      <div class="footer-legal">
        <p class="legal-text">
          互联网图书服务资格证书:(中)-经营性-20260209 中公网安备 33010002000126号
        </p>
        <p class="legal-text">
          出版物网络交易平台服务经营备案证:新出发中备字第2017001号 信息网络传播视听许可证:110936a号
        </p>
        <p class="legal-text">
          互联网违法和不良信息举报中心:0571-81683755 blxx@list.alixingxin-inc.com
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { pinyin } from 'pinyin-pro'
import { ElMessage } from 'element-plus'
import pj from '@/views/front/book/抽离短评价.vue'
import { getBookListApi } from '@/api/front/book'
import { getSellerBookListApi } from '@/api/seller/front'
import { useBookStore1 } from '@/store/newbook'

const userStore = useUserStore()
const router = useRouter()
const bookStore1 = useBookStore1()
const go = (path: string) => router.push(path)
const loading = ref(true)
const allBooks = ref([])
const newBookList = ref([])
const sellerBooks = ref([])
const discountBooks = ref([])
const filteredBooks = ref([])
const showBooks = ref([])

const searchKeyword = ref('')
const minPrice = ref(null)
const maxPrice = ref(null)
const sortBy = ref<'price' | 'rating' | 'sales' | ''>('')
const currentSortDirection = ref<'asc' | 'desc'>('asc')
const showType = ref('normal')

const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const isRefreshing = ref(false)

// 洗牌算法,随机打乱数组
const shuffleArray = <T>(arr: T[]): T[] => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}
// 收藏
const addToShoucang = async (book: any) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const res = await request.post('/api/shoucang/add', {
      goodsId: book.id,
      num: 1,
      spec: '平装版',
      source: 'seller',
      bookName: book.name,
      bookCover: book.cover,
      bookPrice: getDiscountPrice(book)
    })

    res.code === 200
      ? ElMessage.success('收藏成功')
      : ElMessage.error(res.msg)
  } catch {
    ElMessage.error('收藏失败')
  }
}
const dingbu = () => window.scrollTo(0, 0)
// 拼音工具
const getFullPinyin = (text: string) =>
  pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase()
const getFirstLetterPinyin = (text: string) =>
  pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toLowerCase()

// 价格工具
const getDiscountPrice = (book: any) => Number(book.discount_price ?? book.price) || 0
const hasDiscount = (book: any) => !!book.discount_price && book.discount_price < book.price
const getDiscountRate = (book: any) => {
  if (!hasDiscount(book)) return ''
  const rate = (Number(book.discount_price) / Number(book.price)) * 10
  return rate.toFixed(1) + '折'
}
const formatPrice = (p: any) => Number(p).toFixed(2)

// 评分/销量
const getBookAvgScore = (book: any) => Number(book.avg_score ?? 0)
const getBookSales = (book: any) => Number(book.sales_count ?? book.sales ?? 0) || 0

// 加载数据
const loadMainBookData = async () => {
  try {
    const res = await getBookListApi('全部')
    allBooks.value = res.code === 200 ? res.data || [] : []
    const sellerRes = await getSellerBookListApi('全部')
    sellerBooks.value = sellerRes.code === 200 ? (sellerRes.data || []).map(b => ({ ...b, is_seller: true })) : []
    await bookStore1.fetchBookList()
    newBookList.value = bookStore1.bookList1 || []
  } catch (e) {
    console.error('主图书加载失败', e)
  }
}

const loadDiscountBooks = async () => {
  try {
    const res = await request.get('/api/front/discount/book/list')
    discountBooks.value = res.data || []
  } catch (e) {
    discountBooks.value = []
  }
}

// 切换分类
const showNormalBooks = () => {
  showType.value = 'normal'
  currentPage.value = 1
  doFilterAndShuffle()
}
const showNewBooks = () => {
  showType.value = 'new'
  currentPage.value = 1
  doFilterAndShuffle()
}

// 排序
const handleSort = (type: 'asc' | 'desc') => {
  sortBy.value = sortBy.value === 'price' && currentSortDirection.value === type ? '' : 'price'
  currentSortDirection.value = type
  currentPage.value = 1
  doFilterAndShuffle()
}
const handleRatingSort = () => {
  sortBy.value = sortBy.value === 'rating' ? '' : 'rating'
  currentPage.value = 1
  doFilterAndShuffle()
}
const handleSalesSort = () => {
  sortBy.value = sortBy.value === 'sales' ? '' : 'sales'
  currentPage.value = 1
  doFilterAndShuffle()
}

// 搜索/清空
const handleSearch = () => { currentPage.value = 1; doFilterAndShuffle() }
const handleClearSearch = () => { searchKeyword.value = ''; currentPage.value = 1; doFilterAndShuffle() }
const handlePriceClear = () => { minPrice.value = null; maxPrice.value = null; currentPage.value = 1; doFilterAndShuffle() }

// 核心筛选逻辑
const doFilterAndShuffle = () => {
  let sourceList: any[] = []

  if (showType.value === 'new') {
    sourceList = [...newBookList.value]
    discountBooks.value.forEach((discount: any) => {
      const target = sourceList.find(item => item.id === discount.book_id && discount.book_type === 1)
      if (target) {
        target.discount_price = discount.discount_price
        target.discount_rate = ((Number(discount.discount_price) / Number(target.price)) * 10).toFixed(1) + '折'
      }
    })
    sourceList = sourceList.filter(b => hasDiscount(b))
  } else {
    sourceList = discountBooks.value.filter(b => b.book_type === 0)
    sourceList.forEach((discountItem) => {
      const targetBook = allBooks.value.find(book => book.id === discountItem.book_id)
      if (targetBook) {
        discountItem.sales_count = targetBook.sales_count || 0
        discountItem.avg_score = targetBook.avg_score || 0
        discountItem.name = discountItem.name || targetBook.name
        discountItem.author = discountItem.author || targetBook.author
        discountItem.cover = discountItem.cover || targetBook.cover
        discountItem.price = discountItem.price || targetBook.price
      }
    })
    sourceList = sourceList.filter(b => hasDiscount(b))
  }

  // 搜索
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    sourceList = sourceList.filter((b: any) => {
      const name = b.name || ''
      return name.toLowerCase().includes(kw) || getFullPinyin(name.slice(0,2)).startsWith(kw) || getFirstLetterPinyin(name.slice(0,2)).startsWith(kw)
    })
  }

  // 价格
  const min = minPrice.value ?? 0
  const max = maxPrice.value ?? 99999
  sourceList = sourceList.filter(b => getDiscountPrice(b) >= min && getDiscountPrice(b) <= max)

  // 排序
  if (sortBy.value === 'price') sourceList.sort((a,b) => currentSortDirection.value === 'asc' ? getDiscountPrice(a)-getDiscountPrice(b) : getDiscountPrice(b)-getDiscountPrice(a))
  if (sortBy.value === 'rating') sourceList.sort((a,b) => getBookAvgScore(b) - getBookAvgScore(a))
  if (sortBy.value === 'sales') sourceList.sort((a,b) => getBookSales(b) - getBookSales(a))

  filteredBooks.value = sourceList
  total.value = sourceList.length
  doPaginationSlice()
}

// 分页
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  showBooks.value = filteredBooks.value.slice(start, start + pageSize.value)
}
const handlePageChange = () => doPaginationSlice()

// ====================== 刷新按钮 ======================
const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    //  1. 清空所有筛选条件（搜索、价格）
    searchKeyword.value = ''
    minPrice.value = null
    maxPrice.value = null
    
    // 2. 强制重置所有排序
    sortBy.value = ''
    currentSortDirection.value = 'asc'
    
    // 3. 重新从服务器拉取最新数据
    await Promise.all([loadMainBookData(), loadDiscountBooks()])
    
    // 4. 重新筛选 + 随机打乱商品顺序
    doFilterAndShuffle()
    filteredBooks.value = shuffleArray(filteredBooks.value)
    
    // 5. 重置到第一页
    currentPage.value = 1
    doPaginationSlice()

    ElMessage.success({message:'已刷新列表，重置所有筛选和排序！',offset:80})
  } catch (e) {
    ElMessage.error('刷新失败，请重试')
    console.error('刷新异常', e)
  } finally {
    isRefreshing.value = false
  }
}


// 跳转详情
const goToDetail = (book: any) => {
  router.push({ path: `/book/${showType.value === 'new' ? book.id : book.book_id}`, query: { book_type: showType.value === 'new' ? 1 : 0 } })
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 初始化
onMounted(async () => {
  loading.value = true
  await loadMainBookData()
  await loadDiscountBooks()
  doFilterAndShuffle()
  loading.value = false
})
</script>
<style scoped>
[v-cloak] {
   display: none !important;
   }
.book-price{
  text-decoration: line-through;
  color: #999;
}
/* 优惠专区视觉差异化 */
.discount-book-card {
  border: 1px solid #ff4d4f !important;
  background: #fff9f9 !important;
  position: relative;
}
.discount-book-card::before {
  content: "优惠";
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4d4f;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
}

.discount-tag {
  margin-left: 8px;
  background-color: #ff4d4f;
  color: white;
  font-weight: bold;
}
.discount-price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: bold;
  margin: 4px 0;
}

.add-cart-btn2 {

border: none !important;
}
.add-cart-btn2:hover {
background-color: #ec8f33 !important;
}
.add-cart-btn2:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
}
.book-detail-chuban{ 
  margin-bottom: 10px;
   color: #626161;
    font-weight: 500;
   }
.xlwy { 
  position: absolute;
   bottom: 10px;
    left: 10px;
     font-size: 14px;
      color: #000000;
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
             transition: all 0.25s ease;
             }
.ziwy:hover{ 
  transform: translateX(0px);
 }
.gwdh1 { 
  animation: gwdh1 2s infinite;
 }
@keyframes gwdh1 {
  0%,100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1.15); }
  75% { transform: scale(1.1); }
}
.gwdh {
   animation: gwdh 2s infinite;
   }
@keyframes gwdh {
  0%,100% { transform: scale(1) rotate3d(0,0,0,0deg); }
  25% { transform: scale(1.1) rotate3d(0,1,0,10deg); }
  50% { transform: scale(1.1) rotate3d(0,1,1,12deg); }
  75% { transform: scale(1.1) rotate3d(0,1,0,10deg); }
}

/* 布局样式 */
:root { 
  font-size: 16px; 
}
.book-desc { 
  user-select: none !important;
   -webkit-user-select: none !important; 
   font-size: clamp(0.875rem, 1.5vw, 1rem);
    color: #666; margin-bottom: 0.5rem; 
    display: -webkit-box;
     -webkit-line-clamp: 2; 
     -webkit-box-orient: vertical; 
     overflow: hidden; 
     word-break: break-all;
      line-height: 1.4;
       max-height: 2.8em; 
      }
.home-top-nav {
   width: 100%;
    height: 3.75rem;
     opacity: 0.9; 
     background: linear-gradient(180deg, white 75%, #f0f2f5 100%); 
     border-bottom: 1px solid rgba(5,44,84,0.3); 
     box-shadow: 0 4px 20px rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
       display: flex;
        align-items: center;
         justify-content: space-between;
          padding: 0 1.25rem;
           position: sticky;
            top: 0;
             z-index: 999 !important;
             }
.sejb {
   position: relative;
    display: grid;
     grid-template-columns: repeat(2,1fr); 
     gap: 1rem; 
     left: -9px;
      flex-direction: column;
       align-items: center;
        z-index: 9996 !important; 
      }
.nav-left { 
  width: 13.75rem; 
  flex-shrink: 0; 
  text-align: left;
 }
.logo1 {
   color: #409eff; 
  font-size: clamp(1.25rem,3vw,1.5rem);
   white-space: nowrap; 
   line-height: 3.75rem; 
   user-select: none !important;
    -webkit-user-select: none !important;
   }
.nav-center1 {
   display: flex;
    gap: 1.5625rem;
     align-items: center; 
     justify-content: center; 
     flex: 1; 
     min-width: fit-content;
      position: relative;
       margin-left: 46px; 
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
    white-space: nowrap; 
  }
.syws { 
  display: flex; 
  background: rgba(22,93,255,0.08) !important;
   border: 1px solid rgba(64,158,255,0.3);
    transition: all 0.3s ease;
     border-radius: 0.375rem;
      padding: 0.375rem 0.875rem; 
      align-items: center; 
      justify-content: center; }
.syses {
   color: #000;
    font-size: clamp(1rem,2vw,1.03rem); 
    text-decoration: none; 
    line-height: 1;
   }
.syses:hover {
   color: #ec8f33; 
   text-shadow: 0 0 8px rgba(220,223,226,0.5);
   }
.filter-bar { 
  width: 100%;
  max-width: 100vw;
  margin: 1.25rem auto;
  padding: 1rem 1.25rem;
  background: linear-gradient(180deg, #ffffff80 75%, #f0f2f5 100%);
  background: linear-gradient(135deg, rgba(5, 82, 176, 0.073), rgba(230,162,60,0.05)) !important;
  border-radius: 0.5rem;
     }
.filter-main { 
  display: grid;
   grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); 
   gap: 0.75rem 1rem;
    align-items: center; 
  }
.filter-control {
   width: 100%; 
   min-width: 160px; 
   max-width: 280px;
   }
.price-refresh { 
  display: flex;
   align-items: center;
    gap: 12px; }
.price-filter {
   display: flex;
    align-items: center;
     gap: 8px;
      white-space: nowrap;
     }
.refresh-btn {
   min-width: 116px;
   }
.sort-btns {
   display: flex;
    gap: 12px;
     align-items: center;
      flex-wrap: wrap;
       justify-content: flex-start;
        flex: 1; 
      }
.search-icon {
   cursor: pointer; 
   color: #666;
    font-size: clamp(1.25rem,2vw,1.375rem);
     transition: color 0.2s;
     }
.search-icon:hover { 
  color: #e6a23c; 
}
.book-list-container { 
  width: 81.9%;
  left: -4.2vw;
    max-width: 104vw;
     margin: 0 auto;
      padding: 1.25rem 1.25rem 4rem 1.25rem; 
      background-color: #ffffffc5;
       min-height: calc(100vh - 3.75rem - 80px); 
       position: relative;
        margin-top: 36px;
         margin-bottom: -24.1px; 
        }
.book-card-list { 
  display: grid;
  grid-template-columns: repeat(3,1fr); 
  gap: 1.25rem; 
 
  margin-bottom: 1.5rem; 
  margin-bottom: 0px; 
  
 }
.book-card { 
  background: rgba(87, 86, 86, 0.033) !important;
   border: none !important; 
   transition: all 0.3s; 
   width: auto;
   max-width: 400px;
    min-width: 430px;
   }
.book-card:hover {
   background: rgba(105, 102, 102, 0.108) !important;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.741);
   }
.book-card-content { 
  display: flex;
   padding: clamp(0.75rem,2vw,0.9375rem);
 }
 .book-cover {
  cursor: pointer;
  user-select: none !important;
  -webkit-user-select: none !important;
  width: auto;
 max-width: 126px;
  height: auto;
  max-height: 320px;
  transform: scalex(0.98);
  object-fit: cover;
  margin-right: clamp(0.75rem, 2vw, 0.9375rem);
  border-radius: 0.25rem;
}

.book-info {
   flex: 1; 
   display: flex; 
   flex-direction: column;
    justify-content: space-between; 
  }
.book-name {
   font-size: clamp(1.1rem,2vw,1.325rem);
   font-weight: bolder; 
   color: #333;
    margin-bottom: 0.5rem; 
    white-space: nowrap; 
  }
.book-author {
   user-select: none !important; 
   -webkit-user-select: none !important; 
   font-size: clamp(0.875rem,1.5vw,1rem); 
   color: #6b6a6a; 
   font-weight: 550;
    margin-bottom: 0.25rem;
     white-space: nowrap;
     width: 215px; 
    }
.empty-tip {
   text-align: center;
    font-size: clamp(1.125rem,2vw,1.25rem);
    color: #999; 
    margin-top: 3.125rem;
     margin-bottom: 2rem; 
    }
.pagination-wrapper {
   width: 100%;
    display: flex;
     position: relative;
      left: 17.4vw;
       margin-left: 18.2vw;
        margin-top: 2rem; 
      }
.sort-btn {
   padding: 4px 10px;
   cursor: pointer; 
   color: #666; 
   border-radius: 4px;
    transition: all 0.25s;
     user-select: none; 
    }
.sort-btn:hover {
   color: #409eff; 
   background-color: #f0f7ff;
   }
.sort-btn.active { 
  color: #409eff;
   font-weight: bold; 
   background-color: #e6f4ff;
    }

/* 图片下方评分+销量布局 */
.book-cover-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cover-footer {
  width: 200px;
  height: 50px;
  white-space: nowrap;
 top: -6px;
  position: absolute;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.sales-text {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}
.pjwy {
  width: 220px;
  height: auto;
  transform: scale(0.8);
  transform-origin: left center;
}
</style>

<style scoped>
.ziwy2 {
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
.ziwy2:hover {
  transform: translateX(0px);
  color: #ff0000;
}
.page-footer {
  width: 103.95vw;
  min-width: 100%;
  background: linear-gradient(1.5deg, #333333 0%, #b2b0b0 100%);
  padding: 30px 0;
  position: relative;
  right: 0;
  top: -16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
}
.footer-content {
  max-width: 1200px;
  min-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  white-space: nowrap;
}
.footer-left {
  flex-shrink: 0;
}
.footer-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  white-space: nowrap;
}
.footer-slogan {
  font-size: 14px;
  color: rgba(227, 224, 224, 0.9);
  margin: 0;
  white-space: nowrap;
}
.footer-center {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
}
.footer-link {
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s ease;
}
.footer-link:hover {
  color: #ffd700;
}
.footer-separator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}
.footer-right {
  flex-shrink: 0;
  text-align: right;
}
.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 5px 0;
  white-space: nowrap;
}
.footer-contact {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  white-space: nowrap;
}
.footer-legal {
  max-width: 1200px;
  min-width: 1200px;
  margin: 20px auto 0;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  text-align: center;
}
.legal-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 5px 0;
  white-space: nowrap;
}
</style>