<template>
  <div class="page-container">
    <div class="main-content">
      <div class="home-top-nav">
        <div class="nav-left">
          <h2 class="logo1 sci-fi-title1">星途科幻图书 - 商家专区</h2>
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

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-main">
          <!-- 商家名称搜索（汉字+拼音双搜索） -->
          <el-input
            v-model="shopSearchKeyword"
            placeholder="搜索商家（拼音/汉字）"
            style="font-weight: 600;"
            class="filter-control"
            @keyup.enter="handleShopSearch"
            @clear="handleClearShopSearch"
            clearable
          >
            <template #suffix>
              <el-icon class="search-icon" @click="handleShopSearch">
                <Search />
              </el-icon>
            </template>
          </el-input>

          <!-- 图书名称搜索 -->
          <el-input
            v-model="searchKeyword"
            placeholder="图书名称搜索（拼音/汉字）"
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

          <!-- 刷新按钮 -->
          <el-button
            style="font-weight:600;width: 120px;"
            type="primary"
            :loading="isRefreshing"
            @click="refreshAllData"
          >
            刷新列表
          </el-button>

          <!-- 价格区间筛选 -->
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
              min="0"
              class="filter-control"
            />
          </div>
        </div>

        <!-- 排序按钮（四个都加上和showMode的绑定） -->
        <div class="sort-btns">
          <span 
            style="font-weight: 600;" 
            class="sort-btn" 
            :class="{ active: sortBy === 'price' && currentSortDirection === 'asc' }"
            :style="{ 
              cursor: showMode === 'book' ? 'pointer' : 'not-allowed', 
              opacity: showMode === 'book' ? 1 : 0.5,
              pointerEvents: showMode === 'book' ? 'auto' : 'none'
            }"
            @click="handleSort('asc')"
          >
            价格从低到高
          </span>
          <span 
            style="font-weight: 600;" 
            class="sort-btn" 
            :class="{ active: sortBy === 'price' && currentSortDirection === 'desc' }"
            :style="{ 
              cursor: showMode === 'book' ? 'pointer' : 'not-allowed', 
              opacity: showMode === 'book' ? 1 : 0.5,
              pointerEvents: showMode === 'book' ? 'auto' : 'none'
            }"
            @click="handleSort('desc')"
          >
            价格从高到低
          </span>

          <span 
            style="font-weight: 600;" 
            class="sort-btn" 
            :class="{ active: sortBy === 'rating' }"
            :style="{ 
              cursor: showMode === 'book' ? 'pointer' : 'not-allowed', 
              opacity: showMode === 'book' ? 1 : 0.5,
              pointerEvents: showMode === 'book' ? 'auto' : 'none'
            }"
            @click="handleRatingSort"
          >
            好评优先
          </span>
          <span 
            style="font-weight: 600;" 
            class="sort-btn" 
            :class="{ active: sortBy === 'sales' }"
            :style="{ 
              cursor: showMode === 'book' ? 'pointer' : 'not-allowed', 
              opacity: showMode === 'book' ? 1 : 0.5,
              pointerEvents: showMode === 'book' ? 'auto' : 'none'
            }"
            @click="handleSalesSort"
          >
            销量最高
          </span>
        </div>

        <!-- 视图切换Tab（手动切换） -->
        <div class="view-tabs">
          <el-button 
            :class="{ active: showMode === 'shop' }" 
            @click="showMode = 'shop'"
            type="text"
          >
            商家一览
          </el-button>
          <el-button 
            :class="{ active: showMode === 'book' }" 
            @click="showMode = 'book'"
            type="text"
          >
            商品一览
          </el-button>
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

      <!-- 商家店铺卡片列表 -->
      <div v-if="!loading && showMode === 'shop'" class="shop-list-container" v-cloak>
        <div class="shop-card-list">
          <div 
            class="shop-card" 
            v-for="shop in filteredShops" 
            :key="shop.shop_id"
            @click="goToShop(shop.shop_id)"
          >
            <el-avatar :size="60" :src="shop.seller_avatar || '/img/default-avatar.png'" />
            <div class="shop-info">
              <li style="list-style: none;"><h3 class="shop-name">{{ shop.shop_name || '未知商家' }}</h3><el-button style="margin-top: 5px;" @click.stop="followShop(shop)">关注+</el-button></li>
              <!-- <p class="shop-desc">店铺ID：000{{ shop.shop_id }}</p> -->
              <el-tag style="width: 120px;" type="warning" size="small">商家自营</el-tag>
            </div>
          </div>
        </div>
        <div v-if="filteredShops.length === 0 && shopSearchKeyword.trim() !== ''" class="empty-tip">未找到相关商家 😕</div>
      </div>

      <!-- 商家图书列表 -->
      <div v-if="!loading && showMode === 'book'" class="book-list-container" v-cloak>
        <div class="main-content-wrapper">
          <div class="left-content">
            <div class="book-card-list">
              <el-card v-for="book in showBooks" :key="book.id" class="book-card">
                <div class="book-card-content">
                  <img
                    :src="book.cover || '/img/default-book.jpg'"
                    referrerpolicy="no-referrer"
                    alt="图书封面"
                    class="book-cover"
                    @click="handleBookClick(book)"
                    @error="(e) => (e.target.src = '/img/default-book.jpg')"
                  />
                  <div class="book-info">
                    <h3 class="book-name">{{ book.name || '未知图书' }}</h3>
                    <el-tag v-if="book.is_seller" type="warning" size="small" class="zysyy">商家自营</el-tag>
                    <p class="book-author">作者：{{ book.author || '未知作者' }}</p>
                    <p class="book-category">分类：{{ book.category || '未知分类' }}</p>

                    <template v-if="hasDiscount(book)">
                      <p class="book-price" style=" color: #999; margin: 0">
                        原价：¥{{ formatPrice(book.price) }}
                      </p>
                      <p class="book-price" style="color: #f56c6c; font-size: 16px; font-weight: bold; margin: 5px 0 0 0">
                        优惠价：¥{{ formatPrice(getDiscountPrice(book)) }}
                        <el-tag type="danger" size="small">{{ getDynamicDiscountRate(book) }}</el-tag>
                      </p>
                    </template>
                    <p v-else class="book-price">¥{{ formatPrice(book.price) }}</p>

                    <p class="book-desc">简介：{{ book.desc || '暂无简介' }}</p>
                    <p class="book-detail-chuban">出版社：{{ book.publisher }}</p>
                    <li style="list-style: none">
                      <el-button type="primary" size="large" class="add-cart-btn2" style="margin-left: 0px;" @click="addToShoucang(book)" :disabled="!userStore.token">
                        {{ userStore.token ? '收藏图书' : '收藏图书? 请先登录' }}
                      </el-button>
                    </li>
                  </div>
                </div>
                <div style="width:auto;white-space: nowrap !important; ">
                  <li style="list-style:none"> 
                    <p class="xlwy" style="white-space: nowrap !important;">销量：{{ Number(book.sales_count) || 0 }}件</p>
                    <pj class="pjwy" v-if="book.id != null" :book-id="book.id" source="normal"/>
                  </li> 
                </div>
              </el-card>
            </div>

            <div v-if="showBooks.length === 0" class="empty-tip">暂无商家自营图书 😕</div>

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
        </div>
      </div>

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
              互联网图书服务资格证书:(中)-经营性-2026-0209 中公网安备 33010002000126号
            </p>
            <p class="legal-text">
              出版物网络交易平台服务经营备案证:新出发中备字第2017001号 信息网络传播视听许可证:110936a号
            </p>
            <p class="legal-text">
              互联网违法和不良信息举报中心:0571-371-3713713
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getSellerBookListApi,
  getAllShopsApi
} from '@/api/seller/front'

import { pinyin } from 'pinyin-pro'
import type { Book } from '@/types/index'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import { useShoucangStore } from '@/store/shoucang'
import request from '@/utils/request'
import pj from '@/views/front/book/抽离短评价.vue'

const shoucangStore = useShoucangStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const selectedPublisher = ref('全部')

// 视图切换
const showMode = ref<'shop' | 'book'>('shop')

interface Shop {
  shop_id: number
  shop_name: string
  seller_avatar: string
}

// 打乱数组工具
const shuffleArray = <T>(arr: T[]): T[] => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

// 工具函数
const getDiscountPrice = (book: any) => Number(book.discount_price ?? book.price) || 0
const hasDiscount = (book: any) => !!book.discount_price && book.discount_price < book.price
const getDynamicDiscountRate = (book: any) => {
  if (!hasDiscount(book)) return ''
  const rate = (Number(book.discount_price) / Number(book.price)) * 10
  return rate.toFixed(1) + '折'
}

// 跳转
const handleBookClick = (book: any) =>
  router.push({ path: `/book/${book.id}`, query: { book_type: 2 } })

const go = (path: string) => router.push(path)

const goToShop = (shopId: number) => router.push(`/shop/${shopId}`)

// 基础状态
const loading = ref(true)
const isRefreshing = ref(false)

const sortBy = ref<'price' | 'rating' | 'sales' | ''>('')
const currentSortDirection = ref<'asc' | 'desc'>('asc')

const selectedAAuthor = ref('全部')
const authorSearch = ref('')
const selectedTags = ref<string[]>([])
const availableTags = ref<string[]>([
  '太空歌剧',
  '赛博朋克',
  '时间旅行',
  '智能纪元',
  '外星文明',
  '自然谜团'
])

const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const selectedCategory = ref('全部')
const searchKeyword = ref('')

// 商家状态
const shopSearchKeyword = ref('')
const shopList = ref<Shop[]>([])
const filteredShops = ref<Shop[]>([])

// 图书状态
const sellerBooks = ref<Book[]>([])
const filteredBooks = ref<Book[]>([])
const showBooks = ref<Book[]>([])

const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const shouldShufflePage = ref(false)

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

// 关注店铺
async function followShop(shop: { shop_id: any; shop_name: any; seller_avatar: any }) {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    const res = await request.post('/api/shop/add', {
      shop_id: shop.shop_id,
      shop_name: shop.shop_name,
      shop_avatar: shop.seller_avatar
    });

    if (res.code === 200) {
      ElMessage.success('关注成功');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    // ElMessage.error('关注失败');
  }
}

// 价格工具
const formatPrice = (price: any) => Number(price || 0).toFixed(2)
const normalizePrice = (v: any) =>
  v === null || v === ''
    ? null
    : Number.isFinite(+v)
      ? +v
      : null

const getBookSales = (book: Book) => +book.sales_count || 0
const getBookAvgScore = (book: any) => Number(book.avg_score ?? 0)

// 排序清空
const handlePriceClear = () => {
  minPrice.value = null
  maxPrice.value = null
  currentPage.value = 1
  doFilterAndShuffle()
}

// 价格排序
const handleSort = (type: 'asc' | 'desc') => {
  if (showMode.value !== 'book') return
  if (sortBy.value === 'price' && currentSortDirection.value === type) {
    sortBy.value = ''
    currentSortDirection.value = 'asc'
  } else {
    sortBy.value = 'price'
    currentSortDirection.value = type
  }
  currentPage.value = 1
  doFilterAndShuffle()
}

// 好评排序
const handleRatingSort = () => {
  if (showMode.value !== 'book') return
  sortBy.value = sortBy.value === 'rating' ? '' : 'rating'
  currentPage.value = 1
  doFilterAndShuffle()
}

// 销量排序
const handleSalesSort = () => {
  if (showMode.value !== 'book') return
  sortBy.value = sortBy.value === 'sales' ? '' : 'sales'
  currentPage.value = 1
  doFilterAndShuffle()
}

// ======================================
// 拼音工具
// ======================================
const getFullPinyin = (text: string) => {
  return pinyin(text, {
    toneType: 'none',
    type: 'array'
  }).join('').toLowerCase()
}

const getFirstLetterPinyin = (text: string) => {
  return pinyin(text, {
    pattern: 'first',
    toneType: 'none',
    type: 'array'
  }).join('').toLowerCase()
}

// ======================================
// 商家搜索
// ======================================
watch(shopSearchKeyword, (val) => {
  showMode.value = 'shop'
  const keyword = val.trim().toLowerCase()
  if (!keyword) {
    filteredShops.value = [...shopList.value]
    return
  }

  filteredShops.value = shopList.value.filter((shop) => {
    const name = shop.shop_name || ''
    const nameLower = name.toLowerCase()
    if (nameLower.includes(keyword)) return true

    const firstPart = name.slice(0, 2)
    const full = getFullPinyin(firstPart)
    const first = getFirstLetterPinyin(firstPart)
    return full.startsWith(keyword) || first.startsWith(keyword)
  })
})

const handleClearShopSearch = () => {
  shopSearchKeyword.value = ''
}
const handleShopSearch = () => {}

// ======================================
// 图书筛选
// ======================================
const doFilterAndShuffle = () => {
  let list = [...sellerBooks.value]
  const kw = searchKeyword.value.trim().toLowerCase()
  const min = normalizePrice(minPrice.value)
  const max = normalizePrice(maxPrice.value)

  list = list.filter((b) => {
    const price = getDiscountPrice(b)
    const bookName = b.name || ''
    const bookNameLower = bookName.toLowerCase()

    let matchCN = kw === '' || bookNameLower.includes(kw)
    let matchPY = false
    if (kw) {
      const firstPart = bookName.slice(0, 2)
      const full = getFullPinyin(firstPart)
      const first = getFirstLetterPinyin(firstPart)
      matchPY = full.startsWith(kw) || first.startsWith(kw)
    }
    const matchName = matchCN || matchPY

    return (
      matchName &&
      (selectedCategory.value === '全部' || b.category === selectedCategory.value) &&
      (min === null || price >= min) &&
      (max === null || price <= max)
    )
  })

  // 全局排序
  if (sortBy.value === 'price') {
    list.sort((a, b) => currentSortDirection.value === 'asc' 
      ? getDiscountPrice(a) - getDiscountPrice(b) 
      : getDiscountPrice(b) - getDiscountPrice(a)
    )
  }
  if (sortBy.value === 'rating') {
    list.sort((a, b) => getBookAvgScore(b) - getBookAvgScore(a))
  }
  if (sortBy.value === 'sales') {
    list.sort((a, b) => getBookSales(b) - getBookSales(a))
  }

  if (shouldShufflePage.value) {
    list.sort(() => Math.random() - 0.5)
  }

  filteredBooks.value = list
  total.value = list.length
  currentPage.value = 1
  doPaginationSlice()
  shouldShufflePage.value = false
}

// 分页切片
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  showBooks.value = filteredBooks.value.slice(start, start + pageSize.value)
}

const handlePageChange = () => doPaginationSlice()
const handleSearch = () => {
  showMode.value = 'book'
  currentPage.value = 1
  doFilterAndShuffle()
}
const handleClearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  doFilterAndShuffle()
}

// 刷新
const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    currentPage.value = 1
    if (showMode.value === 'shop') {
      await loadShopList()
      filteredShops.value = shuffleArray(filteredShops.value)
      ElMessage.success('商家列表已随机刷新')
    } else {
      if (sortBy.value !== 'price') {
        shouldShufflePage.value = true
      } else {
        shouldShufflePage.value = false
      }
      await Promise.all([loadSellerBooks(), loadShopList()])
      doFilterAndShuffle()
      ElMessage.success('图书列表已刷新')
    }
  } catch (e) {
    ElMessage.error('刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

// 加载商家图书
const loadSellerBooks = async () => {
  try {
    const res = await getSellerBookListApi('全部')
    sellerBooks.value = res.code === 200 ? res.data.map(i => ({ ...i, is_seller: true })) : []
  } catch {
    sellerBooks.value = []
  }
}

// 加载店铺列表
const loadShopList = async () => {
  try {
    const res = await getAllShopsApi()
    if (res.code === 200) {
      shopList.value = res.data.map(item => ({
        shop_id: item.id,
        shop_name: item.shop_name,
        seller_avatar: item.avatar
      }))
      filteredShops.value = [...shopList.value]
    }
  } catch (err) {
    console.error(err)
    shopList.value = []
    filteredShops.value = []
  }
}

// 回到顶部
const dingbu = () => window.scrollTo(0, 0)

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

// 初始化
onMounted(async () => {
  loading.value = true
  await Promise.all([loadSellerBooks(), loadShopList()])

  const { category, keyword } = route.query
  if (category) selectedCategory.value = category as string
  if (keyword) searchKeyword.value = keyword as string

  shouldShufflePage.value = true
  doFilterAndShuffle()
  loading.value = false
})

watch(
  () => route.query,
  (q) => {
    selectedCategory.value = (q.category as string) || '全部'
    searchKeyword.value = (q.keyword as string) || ''
    doFilterAndShuffle()
  },
  { deep: true }
)

// 切换视图时清空排序，避免商家页受影响
watch(showMode, () => {
  sortBy.value = ''
  currentSortDirection.value = 'asc'
  doFilterAndShuffle()
})

watch(
  [selectedCategory, selectedAAuthor, searchKeyword, minPrice, maxPrice, selectedPublisher],
  () => doFilterAndShuffle()
)
</script>

<style scoped>
.view-tabs {
  margin-top: 12px;
  display: flex;
  gap: 16px;
  padding-left: 12px;
}
.view-tabs .el-button {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  padding: 8px 16px;
  border-bottom: 2px solid transparent;
}
.view-tabs .el-button.active {
  color: #409eff;
  border-bottom-color: #409eff;
}
</style>


<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 容器占满整个视口高度 */
}
.main-content {
  flex: 1; /* 让内容区自动占满剩余空间 */
}
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
.add-cart-btn2 {
  width: auto;
  min-width: 130px;
  font-size: clamp(1rem, 2vw, 1.125rem);
 
  border: none !important;
  margin-left: 16px;
  position: relative;
}
.add-cart-btn2:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
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
/* 商家店铺卡片样式 */
.shop-list-container {
  width: 81.9%;
  left: -4.2vw;
  max-width: 104vw;
  margin: 20px auto;
  padding: 0 1.25rem;
  min-height: calc(100vh - 200px); /* 强制撑开高度 */
  display: flex;
  flex-direction: column;
}
.shop-card-list {
  display: flex;
  gap: 20px;
  margin-left: 80px !important;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.shop-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: #fff8e6;
  border: 1px solid #f5d78e;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 300px;
}
.shop-card:hover {
  background: #fff3d0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.shop-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.shop-name {
  font-size: 18px;
  font-weight: 600;
  color: #e6a23c;
  margin: 0;
}
.shop-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}


.zysyy{
  color: rgb(105, 0, 0) !important;
  background-color: #e09a75d8;
  font-weight: 550;
  width: 110px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  -webkit-transform: scale(1);
  -moz-transform: scale(1);
  -ms-transform: scale(1);
  -o-transform: scale(1);
  font-size: 14px !important;
}
[v-cloak] {
   display: none !important;
   }
.book-price{
 
  color: #000000;
}
/* 专区视觉 */
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
      color: #e5705b;
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
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  white-space: nowrap;
  line-height: 3.75rem;
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    line-height: 2.5rem;
  }
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
  background: #e5e3e1;
   border: 1px solid rgba(64,158,255,0.3);
    transition: all 0.3s ease;
     border-radius: 0.375rem;
     padding: 0.375rem 0.875rem;
      align-items: center; 
      justify-content: center; 
    }
.syses {
  color: rgb(0, 0, 0);
  font-size: clamp(1rem, 2vw, 1.02rem);
  text-decoration: none;
  line-height: 1;
   
   }
.syses:hover {
   color: #ec8f33; 
   text-shadow: 0 0 8px rgba(220,223,226,0.5);
   }
.filter-bar { 
  width: 100%; max-width: 100vw;
   margin: 1.25rem auto;
    padding: 1rem 1.25rem;
     background: linear-gradient(180deg, #ecd9bb80 75%, #f0f2f5 100%);
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
  width: auto;
 
    max-width: 93.1vw;
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
  background: #ffffff !important;
   border: none !important; 
   transition: all 0.3s; 
   width: auto;
     margin-left: 20px !important;
   max-width: 460px;
    min-width: 450px;
     box-shadow: 3px 4px 12px rgba(71, 64, 65, 0.49);
   }
.book-card:hover {
   background: rgba(226,223,223,0.033) !important;
    box-shadow: 3px 4px 12px rgba(74, 6, 16, 0.49);
   }
.book-card-content { 
  display: flex;
   padding: clamp(0.75rem,2vw,0.9375rem);
 }
.book-cover {
   cursor: pointer; 
   user-select: none !important;
    -webkit-user-select: none !important; 
    width: clamp(108px,15vw,113px);
     height: clamp(130px,20vw,155px);
      object-fit: cover; margin-right: clamp(0.75rem,2vw,0.9375rem);
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
  
       margin-left: 19.2vw !important;
        margin-top: 2rem !important; 
        margin-right: 2rem !important;
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


.add-cart-btn2 {
  width: auto;
  min-width: 130px;
  font-size: clamp(1rem, 2vw, 1.125rem);

  border: none !important;
  margin-left: 16px;
  position: relative;
}
.add-cart-btn2:disabled {
  background-color: #95a5a6 !important;
  cursor: not-allowed;
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
<style scoped>
/* ====================== 商家专区====================== */
/* 主色调：深海蓝 #165DFF + 香槟金 #E6A23C 商务轻奢风，和普通页面区分 */
.view-tabs {
  margin-top: 16px;
  display: flex;
  gap: 20px;
  padding-left: 12px;
  background: rgba(255,255,255,0.8);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  width: fit-content;
}
.view-tabs .el-button {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  padding: 8px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: none !important;
}
.view-tabs .el-button.active {
  color: #fff !important;
  background: linear-gradient(135deg, #747476, #409EFF);
  box-shadow: 0 2px 6px rgba(22,93,255,0.3);
}

/* 商家标签样式 */
.zysyy{
  color: rgb(105, 0, 0) !important;
  background-color: #e09a75d8 !important;
  font-weight: 550;
  width: 110px;
  user-select: none;
  font-size: 14px !important;
}
[v-cloak] {
  display: none !important;
}

/* ====================== 顶部导航 ====================== */
.home-top-nav {
  background: linear-gradient(180deg, #F7F8FA 75%, #ECEFF5 100%) !important;
  border-bottom: 1px solid rgba(22,93,255,0.2) !important;
}

.nav-left { 
  width: 18rem !important; 
  flex-shrink: 0; 
  text-align: left;
}
.logo1 {
  color: #409eff;
  font-size: clamp(1.25rem, 3vw, 1.5rem) !important;
  white-space: nowrap;
  line-height: 3.75rem;
  user-select: none !important;
  -webkit-user-select: none !important;
  @media (max-width: 768px) {
    line-height: 2.5rem;
  }
}
.syws {
  
  background: rgba(22,93,255,0.08) !important;
  border: 1px solid rgba(22,93,255,0.2) !important;
}
.syses:hover {
  color: #ec8f33 !important;
}

/* ====================== 筛选栏  ====================== */
.filter-bar {
  background: linear-gradient(135deg, rgba(5, 82, 176, 0.073), rgba(230,162,60,0.05)) !important;
  border: 1px solid rgba(22,93,255,0.1);
}
.filter-main { 
  display: flex; /* 弹性布局 */
  flex-wrap: wrap; /* 小窗口自动换行 */
  gap: 0.75rem 1rem;
  align-items: center; 
}
.filter-control {
  min-width: 160px; /* 输入框最小宽度，防止被压扁 */
  flex: 1; /* 空间足够时自动扩展 */
}
.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  min-width: 240px; /* 价格筛选区域最小宽度 */
}
.el-input {
  min-width: 110px; /* 单个输入框最小宽度 */
}
.sort-btn.active { 
  color: #fff !important;
  background: linear-gradient(135deg, #165DFF, #409EFF) !important;
}
.sort-btn:hover {
  color: #165DFF;
  background-color: rgba(22,93,255,0.08);
}
.search-icon:hover { 
  color: #165DFF !important;
}

/* ====================== 商家卡片  ====================== */
.shop-list-container {
  width: 81.9%;
  left: -4.2vw;
  max-width: 104vw;
  margin: 20px auto;
  padding: 0 1.25rem;
  min-height: calc(100vh - 200px);
}
.shop-card-list {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 20px;
  justify-content: flex-start;
}
.shop-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff, #F8F9FC);
  border: 1px solid rgba(22,93,255,0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.35s ease;
  min-width: 320px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.shop-card:hover {
  transform: translateY(-4px);
  background: linear-gradient(135deg, #ffffff, #EEF4FF);
  border-color: rgba(22,93,255,0.3);
  box-shadow: 0 8px 24px rgba(22,93,255,0.12);
}
.shop-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.shop-name {
  font-size: 19px;
  font-weight: 700;
  color: #165DFF;
  margin: 0;
}
.shop-desc {
  font-size: 14px;
  color: #86909C;
  margin: 0;
}
.el-avatar {
  border: 2px solid #E6A23C !important;
  padding: 2px;
  background: #fff !important;
}

/* ====================== 商家商品卡片  ====================== */
.book-list-container { 
  background-color: #F9FAFC !important;
}
.book-card { 
  position: relative; 
  background: #ffffff !important;
  border: 1px solid rgba(22,93,255,0.1) !important;
  border-radius: 12px !important;
  transition: all 0.35s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05) !important;
  padding-bottom: 40px; /* 给底部预留空间，防止销量被隐藏 */
}
.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(22,93,255,0.12) !important;
  border-color: rgba(22,93,255,0.2) !important;
}
.book-card-content { 
  display: flex;
  padding: clamp(0.75rem,2vw,0.9375rem);
}
.book-price{
 font-weight: 600;
  color: #fa6b05;
}
/* 收藏按钮 */
.add-cart-btn2 {

  border: none !important;
}
.add-cart-btn2:hover {
  background-color: #ec8f33 !important;
}
/* 销量样式：默认显示在卡片底部 */
.xlwy { 
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 14px;
  color: #e5705b;
  white-space: nowrap;
}
.pjwy {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

/* ====================== 悬浮按钮 ====================== */


.ziwy2:hover {
  background-color: #999999a3 !important;
  color: #ff0000;
}

/* ====================== 响应式 + 基础布局 ====================== */
:root { 
  font-size: 16px; 
}
.book-desc { 
  user-select: none !important;
  -webkit-user-select: none !important; 
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: #666; 
  margin-bottom: 0.5rem; 
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
  word-break: break-all;
  line-height: 1.4;
  max-height: 2.8em; 
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
.book-card-list { 
  display: grid;
  grid-template-columns: repeat(3,1fr); 
  gap: 1.25rem; 
  margin-bottom: 1.5rem; 
}
.book-cover {
  cursor: pointer;
  user-select: none !important;
  -webkit-user-select: none !important;
  width: auto;
 max-width: 206px;
  height: auto;
  max-height: 230px;
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
  color: #1D2129;
  margin-bottom: 0.5rem; 
  white-space: nowrap; 
}
.book-author {
  user-select: none !important; 
  -webkit-user-select: none !important; 
  font-size: clamp(0.875rem,1.5vw,1rem); 
  color: #4E5969; 
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

/* ====================== 页脚 ====================== */
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}
.main-content {
  flex: 1; 
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
  color: #E6A23C;
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

/* 动画保留 */
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
</style>

