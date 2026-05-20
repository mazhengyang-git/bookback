<template>
  <div class="seller-zone-page">
    <div class="home-top-nav">
      <div class="nav-left">
        <h2 class="logo1 sci-fi-title1">星途科幻图书 - 店铺专区</h2>
      </div>
      <div class="nav-center1">
        <el-button link class="syses" @click="$router.push('/home')">首页</el-button>
        <el-button link class="syses" @click="$router.push('/books')">图书商城</el-button>
        <el-button link class="syses" @click="$router.push('/books1')">优惠专区</el-button>
      </div>
      <div class="nav-right1">
        <el-button v-if="!userStore.isLogin" link @click="$router.push('/login')">登录</el-button>
        <el-button v-else link @click="handleLogout">退出</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="按店铺名称搜索（支持拼音首字母/全拼）"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleClear"
      >
        <template #suffix>
          <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" :loading="loading" @click="handleSearch">搜索店铺</el-button>
      <el-button @click="loadShops">显示全部</el-button>
    </div>

    <div v-if="!loading" class="shop-grid">
      <el-card
        v-for="shop in shops"
        :key="shop.id"
        class="shop-card"
        shadow="hover"
        @click="goShop(shop.id)"
      >
        <div class="shop-card-inner">
          <el-avatar :size="72" :src="shop.avatar || '/img/default-avatar.png'" />
          <h3>{{ shop.shop_name }}</h3>
          <p class="shop-intro">{{ shop.intro || '欢迎光临' }}</p>
        </div>
      </el-card>
      <div v-if="shops.length === 0" class="empty-tip">未找到相关店铺</div>
    </div>
    <div v-else class="loading-tip">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getAllShopsApi } from '@/api/seller/front'
import type { Seller } from '@/types/seller'
//拼音转换库
import { pinyin } from 'pinyin-pro'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const shops = ref<Seller[]>([])
const searchKeyword = ref('')

// 拼音工具函数
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

// 所有店铺数据缓存（前端本地筛选）
const allShops = ref<Seller[]>([])

// 加载所有店铺数据（调用一次API）
const loadShops = async () => {
  loading.value = true
  searchKeyword.value = ''
  try {
    const res = await getAllShopsApi()
    if (res.code === 200) {
      allShops.value = res.data || []
      shops.value = allShops.value // 初始显示全部
    }
  } catch {
    ElMessage.error('加载店铺失败')
  } finally {
    loading.value = false
  }
}

// 前端本地筛选（汉字 + 拼音双渠道）
const filterShops = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    shops.value = allShops.value
    return
  }

  shops.value = allShops.value.filter(shop => {
    const shopName = shop.shop_name || ''
    // 1. 汉字全文匹配
    const matchCN = shopName.toLowerCase().includes(keyword)
    // 2. 拼音匹配（取店铺名称前2个字符，支持首字母/全拼）
    let matchPY = false
    if (shopName) {
      const firstTwoChars = shopName.slice(0, 2)
      const fullPY = getFullPinyin(firstTwoChars)
      const firstPY = getFirstLetterPinyin(firstTwoChars)
      matchPY = fullPY.startsWith(keyword) || firstPY.startsWith(keyword)
    }
    // 满足任一条件即可匹配
    return matchCN || matchPY
  })
}

// 搜索按钮/回车触发
const handleSearch = () => {
  filterShops()
}

// 清空搜索触发
const handleClear = () => {
  filterShops()
}

const goShop = (id: number) => router.push(`/shop/${id}`)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(loadShops)
</script>
<style scoped>
.seller-zone-page {
  min-height: 100vh;
  background: #f0f4f8;
}
.home-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
.filter-bar {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
  margin: 12px 24px;
  border-radius: 8px;
}
.search-input {
  max-width: 360px;
  flex: 1;
}
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 8px 24px 48px;
}
.shop-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}
.shop-card:hover {
  transform: translateY(-4px);
}
.shop-card-inner h3 {
  margin: 12px 0 6px;
  color: #303133;
}
.shop-intro {
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty-tip,
.loading-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px;
  color: #999;
}
.search-icon {
  cursor: pointer;
}
</style>
