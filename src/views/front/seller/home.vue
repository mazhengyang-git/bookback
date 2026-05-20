<template>
  <div class="seller-home-page">
    <div class="home-top-nav">
      <h2 class="logo1" >星途科幻图书 - 店铺主页</h2>
      <div>
        <el-button link @click="$router.push('/home')">返回首页</el-button>
        <el-button link @click="$router.push('/seller-zone')">店铺专区</el-button>
      </div>
    </div>

    <div v-if="!loading && seller" class="shop-header">
      <el-avatar :size="80" :src="seller.avatar || '/img/default-avatar.png'" />
      <div class="shop-info">
        <h2>{{ seller.shop_name }}</h2>
        <p>{{ seller.intro || '暂无店铺简介' }}</p>
        <p v-if="seller.contact">联系：{{ seller.contact }}</p>
      </div>
    </div>

    <div v-if="!loading" class="book-list-container">
      <h3 style="color: black;" class="section-title">店铺在售图书</h3>
      <div class="book-card-list">
        <el-card v-for="book in books" :key="book.id" class="book-card" @click="goDetail(book.id)">
          <div class="book-card-content">
            <img :src="book.cover || '/img/default-book.jpg'" class="book-cover" />
            <div class="book-info">
              <h3>{{ book.name || book.book_name }}</h3>
              <el-tag style="color: chocolate;" type="warning" size="small">商家自营</el-tag>
              <p>作者：{{ book.author }}</p>
              <p>¥{{ formatPrice(book.price) }}</p>
            </div>
          </div>
        </el-card>
      </div>
      <div v-if="books.length === 0" class="empty-tip">该店铺暂无在售图书</div>
    </div>
    <div v-else class="loading-tip">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSellerHomeApi } from '@/api/seller/front'
import type { Seller, SellerBook } from '@/types/seller'

const route = useRoute()
const router = useRouter()
const sellerId = computed(() => Number(route.params.id))
const loading = ref(true)
const seller = ref<Seller | null>(null)
const books = ref<SellerBook[]>([])

const formatPrice = (p: unknown) => Number(p || 0).toFixed(2)

const loadData = async () => {
  if (!sellerId.value) return ElMessage.error('店铺不存在')
  loading.value = true
  try {
    const res = await getSellerHomeApi(sellerId.value)
    if (res.code === 200 && res.data) {
      seller.value = res.data.seller
      books.value = res.data.books || []
    } else ElMessage.error(res.msg || '店铺不存在')
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const goDetail = (id: number) => router.push({ path: `/book/${id}`, query: { book_type: 2 } })

onMounted(loadData)
</script>

<style scoped>
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
.seller-home-page { min-height: 100vh; background: #f5f7fa; }
.home-top-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.shop-header {
  display: flex; gap: 20px; padding: 32px 24px; margin: 16px 24px; border-radius: 12px;
  background: linear-gradient(135deg, #1e3a5f, #0f172a); color: #fff;
}
.book-card-list {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px; padding: 16px 24px 40px;
}
.book-card { cursor: pointer; }
.book-card:hover{
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.548);
}
.book-card-content { display: flex; gap: 12px; }
.book-cover { width: 90px; height: 120px; object-fit: cover; border-radius: 4px; }
.empty-tip, .loading-tip { text-align: center; padding: 40px; color: #999; }
.section-title { padding: 0 24px; }
</style>
