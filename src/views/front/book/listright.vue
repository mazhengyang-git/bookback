<template>
  <div class="listright-container">

    <!-- 图书鉴赏 -->
    <div class="right-module1">
      <h3 class="module-title" style="user-select: none;">
        <span class="title-icon" style="user-select: none;">🔥</span>
        图书鉴赏
      </h3>
      <div class="book-rank-list">
        <div
          v-for="(book, index) in hotBooks"
          :key="book.id"
          class="rank-item"
          @click="handleBookClick(book)"
        >
          <span style="user-select: none;" class="rank-number" :class="`rank-top-${index + 1}`">{{ index + 1 }}</span>
          <img style="user-select: none;" :src="book.cover || '/img/default-book.jpg'" class="rank-cover" alt="封面" />
          <div class="rank-info">
            <p class="rank-name">{{ book.name }}</p>
            <p class="rank-author" style="user-select: none;">{{ book.author }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门标签 -->
    <div class="right-module">
      <h3 class="module-title" style="user-select: none;">
        <span class="title-icon" >🏷️</span>
        热门类别
      </h3>
      <div  class="tag-cloud" style="user-select: none;">
        <span
          v-for="tag in hotTags"
          :key="tag"
          class="tag-item"
          @click="handleTagClick(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- 热门作者 -->
    <div class="right-module">
      <h3 class="module-title" style="user-select: none;">
        <span class="title-icon">✍️</span>
        作者系列
      </h3>
      <div class="author-list">
        <div
          v-for="author in hotAuthors"
          :key="author.name"
          class="author-item"
          @click="handleAuthorClick(author.name)"
        >
          <div class="author-avatar" style="user-select: none;">{{ author.name.charAt(0) }}</div>
          <div class="author-info" style="user-select: none;">
            <p class="author-name">{{ author.name }}</p>
            <p class="author-works" style="user-select: none;">{{ author.works }}部作品</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新书推荐 -->
    <div class="right-module">
      <h3 class="module-title" style="user-select: none;">
        <span class="title-icon">📚</span>
        新书推荐
      </h3>
      <div class="new-book-list">
        <div
          v-for="book in newBooks"
          :key="book.id"
          class="new-book-item"
          @click="handleBookClick(book)"
        >
          <img style="user-select: none;" :src="book.cover || '/img/default-book.jpg'" class="new-book-cover" alt="封面" />
          <div class="new-book-info" style="user-select: none;">
            <p class="new-book-name">{{ book.name }}</p>
            <p class="new-book-price" style="user-select: none;">¥{{ formatPrice(book.price) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动公告 -->
    <div class="right-module">
      <h3 class="module-title1" style="user-select: none;" @click=" router.push('/huodong')">
        <span class="title-icon">📢</span>
        活动展示
      </h3>
      <div class="notice-list">
        <div v-for="notice in random" :key="notice.id" class="notice-item">
          <span class="notice-tag" style="user-select: none;">{{ getStatusText(notice.status) }}</span>
          <p class="notice-content">{{ notice.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.listright-container {
  width: 490px;
 background-color: white;
  border-radius: 8px;
  padding: 20px;

  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
 position: static;
 
  max-height: 1800px;
  overflow-y: auto;
}

.right-module {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.right-module:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.right-module1 {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  height: 469.5px;
}

.right-module1:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
 
}
.module-title1 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #e1dfdf;
  width: 100px;
  padding-bottom: 5px;
  cursor: pointer;
  border-radius: 10px;
}

.title-icon {
  font-size: 18px;
}

/* 热门图书榜 */
.book-rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.rank-item:hover {
  background: #f5f5f5;
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #999;
  background: #f0f0f0;
  border-radius: 4px;
  flex-shrink: 0;
}

.rank-top-1 {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
}

.rank-top-2 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: #fff;
}

.rank-top-3 {
  background: linear-gradient(135deg, #f1c40f, #f39c12);
  color: #fff;
}

.rank-cover {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-author {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 热门标签 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  background: #e6a23c;
  color: #fff;
}

/* 热门作者 */
.author-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.author-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.author-item:hover {
  background: #f5f5f5;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 2px 0;
}

.author-works {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 新书推荐 */
.new-book-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.new-book-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.new-book-item:hover {
  background: #f5f5f5;
}

.new-book-cover {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.new-book-info {
  flex: 1;
  min-width: 0;
}

.new-book-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.new-book-price {
  font-size: 14px;
  color: #e6a23c;
  font-weight: bold;
  margin: 0;
}

/* 活动公告 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: #fff8e1;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
}

.notice-tag {
  padding: 2px 6px;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  border-radius: 3px;
  flex-shrink: 0;
}

.notice-content {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* 滚动条样式 */
.listright-container::-webkit-scrollbar {
  width: 6px;
}

.listright-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.listright-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.listright-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { getBookListApi } from '@/api/front/book'
import type { Book } from '@/types/index'
//@ts-ignore
import { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, useRouter } from 'vue-router'
//@ts-ignore
import { useUserStore } from '@/store/modules/user'
import { getHuodongListApi } from '@/api/front/huodong'

import type { Huodong } from '@/types/front/huodong'

const router = useRouter()
const huodongList = ref<Huodong[]>([])
async function getHuodongList() {
  const res = await getHuodongListApi()
  if (res.code === 200) {
    return res.data || []
  }
  return []
}
const random=ref<Huodong[]>([])
function getRandomList(list: any[],count=4){
  if(!list||list.length===0)return[]
const hdcopy=[...list]
for(let i=hdcopy.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1))
  ;[hdcopy[i],hdcopy[j]]=[hdcopy[j],hdcopy[i]]

}
  return hdcopy.slice(0,count)
}
// 数字状态 → 文字
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '快结束'
    case 3: return '已结束'
      case 4: return '已取消'
    default: return '未知'
  }
}

// 状态标签类型
//@ts-ignore
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'danger'
    case 4: return 'warning'
    default: return 'info'
  }
}
// 热门图书数据
const hotBooks = ref<Book[]>([])
// 热门标签
const hotTags = ref<string[]>([
  '太空歌剧',
  '赛博朋克',
  '时间旅行',
  '智能纪元',
  '外星文明',
  '末世废土',
  '星际灾厄',
  '虚幻惊悚',
])
// 热门作者
const hotAuthors = ref([
  { name: '刘慈欣', works: 6 },
  { name: '[美]艾萨克·阿西莫夫', works: 12 },
  { name: '[波]斯坦尼斯瓦夫·莱姆', works: 2 },
  { name: '[美]安迪.威尔', works: 1 },
  { name: '[美]特德·姜', works: 2 },
])
// 新书推荐
const newBooks = ref<Book[]>([])
// 活动公告
//@ts-ignore
const notices = ref([
  { id: 1, tag: '限时', content: '科幻图书全场8折优惠' },
  { id: 2, tag: '新书', content: '《星际穿越》全新上市' },
  { id: 3, tag: '活动', content: '读书月活动火热进行中' },
])

// 格式化价格
const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return num.toFixed(2)
}

// 图书点击
const handleBookClick = (book: Book) => {
  router.push(`/book/${book.id}`)
}

// 标签点击
const handleTagClick = (tag: string) => {
  // 触发父组件事件，传递标签
  router.push({ path: '/books', query: { category: tag } })
}

// 作者点击
const handleAuthorClick = (authorName: string) => {
  router.push({ path: '/books', query: { aauthor: authorName } })
}

// 加载热门图书
const loadHotBooks = async () => {
  try {
    const res = await getBookListApi('全部')
    const data = (res as any).data || []
    if (Array.isArray(data)) {
      // 取随机图书作为热门图书
      hotBooks.value = getRandomList(data, 5)
    }
  } catch (error) {
    console.error('加载热门图书失败:', error)
  }
}

// 加载新书推荐
const loadNewBooks = async () => {
  try {
    const res = await getBookListApi('全部')
    const data = (res as any).data || []
    if (Array.isArray(data)) {
      // 取后3本作为新书推荐
      newBooks.value = data.slice(-3)
    }
  } catch (error) {
    console.error('加载新书推荐失败:', error)
  }
}

// 从父组件接收数据的方法
const updateData = (data: any) => {
  if (data.hotBooks) hotBooks.value = data.hotBooks
  if (data.newBooks) newBooks.value = data.newBooks
  if (data.hotTags) hotTags.value = data.hotTags
}

// 暴露方法给父组件
defineExpose({
  updateData,
})

onMounted( () => {
   loadHotBooks()
  loadNewBooks()

  // 等待活动接口加载完成
 
})
onMounted( async() => {
 const list = await getHuodongList()//@ts-ignore
  huodongList.value = list
  // 再取随机
random.value = getRandomList(huodongList.value, 4)
 })
</script>


