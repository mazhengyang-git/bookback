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
        placeholder="按图书名称搜索（如：三体）"
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
          @input="doFilterAndShuffle"
          @clear="handlePriceClear"
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
    </div>
  </div>

  <div style="padding: 0 20px; background:#fff; margin: 10px 0;">
    <!-- 修复：刷新按钮样式+生效 -->
   
  </div>

  <div v-if="!loading" class="book-list-container" v-cloak>
    <div class="book-card-list">
      <!-- 修复：添加点击跳转详情事件 -->
      <el-card 
        v-for="book in showBooks" 
        :key="book.id" 
        class="book-card discount-book-card"
       
        style="cursor: pointer;"
      >
        <div class="book-card-content">
          <img  @click="goToDetail(book)" :src="book.cover || '/img/default-book.jpg'" class="book-cover" />
          <div class="book-info">
            <h3  @click="goToDetail(book)" class="book-name">{{ book.name }}</h3>
            <p class="book-author">作者：{{ book.author }}</p>
            <p class="book-price" >原价：{{ book.price }}</p>
            <p class="discount-price">
              优惠价：¥{{ formatPrice(getDiscountPrice(book)) }}
              <el-tag type="danger" class="discount-tag">{{ getDiscountRate(book) }}</el-tag>
            </p>
          </div>
        </div>
      </el-card>

      <div v-if="showBooks.length === 0" class="empty-tip">暂无优惠图书 😕</div>
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
          <h3 class="footer-title">星途科幻</h3>
          <p class="footer-slogan">探索宇宙的无限可能</p>
        </div>
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

const userStore = useUserStore()
const router = useRouter()

const loading = ref(true)
const allBooks = ref([]) 
const filteredBooks = ref([])
const showBooks = ref([])

const searchKeyword = ref('')
const minPrice = ref(null)
const maxPrice = ref(null)
const sortBy = ref('')
const currentSortDirection = ref('asc')
const showType = ref('normal')

const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const isRefreshing = ref(false)

// 价格/折扣工具函数
const getDiscountPrice = (book) => Number(book.discount_price ?? book.price) || 0
const getDiscountRate = (book) => book.discount_rate || ''
const formatPrice = (p) => Number(p).toFixed(2)

// 切换分类
const showNormalBooks = () => {
  showType.value = 'normal'
  doFilterAndShuffle()
}
const showNewBooks = () => {
  showType.value = 'new'
  doFilterAndShuffle()
}

// 排序/搜索/清空
const handleSort = (dir) => {
  sortBy.value = 'price'
  currentSortDirection.value = dir
  currentPage.value = 1
  doFilterAndShuffle()
}
const handleSearch = () => { currentPage.value = 1; doFilterAndShuffle() }
const handleClearSearch = () => { searchKeyword.value = ''; currentPage.value = 1; doFilterAndShuffle() }
const handlePriceClear = () => { minPrice.value = null; maxPrice.value = null; currentPage.value = 1; doFilterAndShuffle() }

// 核心筛选逻辑
const doFilterAndShuffle = () => {
  const source = showType.value === 'new' 
    ? allBooks.value.filter(book => book.book_type === 1) 
    : allBooks.value.filter(book => book.book_type === 0);
  
  let list = [...source].filter(book => getDiscountRate(book))

  // 搜索过滤
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(b => b.name?.toLowerCase().includes(kw))
  }
  // 价格过滤
  const min = minPrice.value ?? 0
  const max = maxPrice.value ?? 99999
  list = list.filter(b => getDiscountPrice(b) >= min && getDiscountPrice(b) <= max)
  // 排序
  if (sortBy.value === 'price') {
    list.sort((a, b) => {
      const pa = getDiscountPrice(a)
      const pb = getDiscountPrice(b)
      return currentSortDirection.value === 'asc' ? pa - pb : pb - pa
    })
  }

  filteredBooks.value = list
  total.value = list.length
  doPaginationSlice()
}

// 分页
const doPaginationSlice = () => {
  const start = (currentPage.value - 1) * pageSize.value
  showBooks.value = filteredBooks.value.slice(start, start + pageSize.value)
}
const handlePageChange = () => doPaginationSlice()

// ✅ 修复：刷新列表按钮生效
const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    // 重新请求优惠接口数据
    const res = await request.get('/api/front/discount/book/list')
    allBooks.value = res.data
    doFilterAndShuffle()
    ElMessage.success('刷新成功！')
  } catch (e) {
    ElMessage.error('刷新失败！')
    console.error(e)
  } finally {
    isRefreshing.value = false
  }
}

const goToDetail = (book) => {
  router.push({
    path: `/book/${book.book_id}`, // 路由是 /book/:id，不是 detail
    query: { 
      book_type: book.book_type // 携带类型：0=普通 1=新书
    }
  })
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 初始化
onMounted(async () => {
  try {
    const res = await request.get('/api/front/discount/book/list')
    allBooks.value = res.data
    doFilterAndShuffle()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
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

/* 你的原有样式全部保留 */
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

/* 你的全部原有布局样式 */
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
  background: #e5e3e1;
   border: 1px solid rgba(64,158,255,0.3);
    transition: all 0.3s ease;
     border-radius: 0.375rem;
      padding: 0.375rem 0.875rem; 
      align-items: center; 
      justify-content: center; }
.syses {
   color: #000;
    font-size: clamp(1rem,2vw,1.125rem); 
    text-decoration: none; 
    line-height: 1.2;
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
  width: 81.9%;
   left: -44px;

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
  grid-template-columns: repeat(1,1fr); 
  gap: 1.25rem; 
 
  margin-bottom: 1.5rem; 
  margin-bottom: 0px; 
  margin-left: 0;
 }
.book-card { 
  background: #fff !important;
   border: none !important; 
   transition: all 0.3s; 
   width: 1300px;
    max-width: 1400px;
   }
.book-card:hover {
   background: rgba(226,223,223,0.033) !important;
    box-shadow: 1px 4px 12px rgba(74,6,16,0.277);
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
     position: relative;
      left: 18vw;
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
</style>