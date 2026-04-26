<template>
  <Transition name="fade">
    <div v-show="!allImagesLoaded" class="black-mask"></div>
  </Transition>
  <div class="cart-container">
    <el-button link class="syses11" @click="$router.push('/home')">返回首页</el-button>

    <h2 class="cart-title">我的购物车</h2>

    <!-- 购物车列表 -->
    <div class="cart-list" v-if="cartStore.currentCart.length > 0">
      <!-- 全选栏 -->
      <div class="check-all-bar">
        <el-checkbox style="font-weight: 700" v-model="isAllChecked" @change="handleCheckAll">
          全选
        </el-checkbox>
        <p class="total-price">已选总价：¥{{ selectedTotal.toFixed(2) }}</p>
      </div>

      <div class="cart-item" v-for="item in cartStore.currentCart" :key="item.cartId">
        <!-- 勾选框 -->
        <el-checkbox
          class="item-check"
          :model-value="checkedIds.includes(item.cartId)"
          @change="(val: any) => handleItemCheck(item.cartId, val)"
        />

        <!-- 封面：跳转链接带source参数，确保新书也能正确打开 -->
        <img
          :src="item.cover || '/default-book.png'"
          alt="图书封面"
          class="item-cover"
          @click="$router.push(`/book/${item.id}?source=${item.source || 'normal'}`)"
          @error="(e) => (e.target.src = '/default-book.png')"
        />
        <div class="item-info">
          <h3 class="item-name">{{ item.name || '未知图书' }}</h3>
          <p class="item-price">¥{{ Number(item.price || 0).toFixed(2) }}</p>
        </div>

        <!-- 橙色按钮控制+可输入 -->
        <div class="item-count">
          <button class="count-btn" @click="handleReduce(item.cartId)">-</button>
          <el-input-number
            v-model="item.count"
            :min="1"
            :max="item.stock"
            class="count-num"
            @change="(val) => handleUpdateCount(item.cartId, val)"
            size="default"
            :controls="false"
          />
          <button class="count-btn" @click="handleAdd(item)">+</button>
        </div>

        <button class="del-btn" @click="handleDelete(item.cartId)">删除</button>
      </div>

      <!-- 底部按钮 -->
      <div class="cart-footer">
        <button class="clear-btn1" @click="handlePay">去支付</button>
        <button class="clear-btn" @click="handleClear">清空购物车</button>
      </div>
    </div>

    <!-- 空购物车 -->
    <div class="empty-cart" v-else>
      <div class="empty-icon">📦</div>
      <p class="empty-tip">购物车空空如也~</p>
      <button class="go-shop-btn" @click="$router.push('/home')">去首页逛逛</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { getCartList, updateCartCount, deleteCartItem, clearCart } from '@/api/cart'
import { getBookDetailApi } from '@/api/front/book'

// 🔥 导入新书Store，用于获取新书真实数据
import { useBookStore1 } from '@/store/newbook'

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()
const allImagesLoaded = ref(false)
const bookStore1 = useBookStore1() // 初始化新书Store

//勾选相关
const checkedIds = ref<number[]>([])
const isAllChecked = ref(false)

//计算：选中商品总价
const selectedTotal = computed(() => {
  return cartStore.currentCart
    .filter((item) => checkedIds.value.includes(item.cartId))
    .reduce((sum, item) => sum + item.price * item.count, 0)
})

// 输入框更新数量 + 库存校验
const handleUpdateCount = async (cartId: number, count: number) => {
  try {
    const targetItem = cartStore.currentCart.find((item) => item.cartId === cartId)
    if (!targetItem) return

    if (count > targetItem.stock) {
      ElMessage.warning(`库存不足，最多可购买 ${targetItem.stock} 本`)
      cartStore.updateCount(cartId, targetItem.stock)
      return
    }
    if (count < 1) {
      cartStore.updateCount(cartId, 1)
      return
    }

    await updateCartCount(cartId, count)
    cartStore.updateCount(cartId, count)
    cartStore.calcTotalPrice()
  } catch (error) {
    ElMessage.error('修改数量失败')
  }
}

//单个勾选
const handleItemCheck = (cartId: number, checked: boolean) => {
  if (checked) {
    checkedIds.value.push(cartId)
  } else {
    checkedIds.value = checkedIds.value.filter((id) => id !== cartId)
  }
  isAllChecked.value = checkedIds.value.length === cartStore.currentCart.length
}

//全选 / 取消全选
const handleCheckAll = (checked: boolean) => {
  if (checked) {
    checkedIds.value = cartStore.currentCart.map((item) => item.cartId)
  } else {
    checkedIds.value = []
  }
}

onMounted(async () => {
  await loadCartData()
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.11)
})

// 并行识别新书/普通书，分别加载真实数据
const loadCartData = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 提前加载新书数据，避免查询时为空
  await bookStore1.fetchBookList()

  try {
    const res = await getCartList()
    if (res.code === 200 && res.data) {
      cartStore.clearCart()

      // 遍历购物车每一项，根据source区分处理
      for (const item of res.data) {
        const source = item.source || 'normal' // 从后端/本地读取source标识
        let realBookData = null

        if (source === 'new') {
          // 从newbook Store获取真实数据
          realBookData = bookStore1.bookList1.find((b) => b.id === item.goodsId)
        } else {
          // 普通书：走原接口
          const bookRes = await getBookDetailApi(item.goodsId)
          realBookData = bookRes.data
        }

        // 加入购物车，携带真实数据
        cartStore.addToCart({
          cartId: item.id,
          id: item.goodsId,
          name: realBookData?.name || item.bookName || '未知图书',
          price: Number(realBookData?.price || item.bookPrice || 0),
          count: item.quantity || item.count,
          cover: realBookData?.cover || item.bookCover || '/default-book.png',
          spec: item.spec || '平装版',
          stock: realBookData?.stock || 999, // 真实库存
          source: source, // 保留source标识，用于跳转和后续操作
        })
      }

      cartStore.calcTotalPrice()
      checkedIds.value = cartStore.currentCart.map((item) => item.cartId)
      isAllChecked.value = true
    }
  } catch (error: any) {
    console.error('加载购物车失败', error)
  }
}

// 减少数量
const handleReduce = async (cartId: number) => {
  const targetItem = cartStore.currentCart.find((item) => item.cartId === cartId)
  if (!targetItem) return

  if (targetItem.count <= 1) {
    try {
      await deleteCartItem(cartId)
      cartStore.deleteItem(cartId)
      cartStore.calcTotalPrice()
      checkedIds.value = checkedIds.value.filter((id) => id !== cartId)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
    return
  }

  try {
    await updateCartCount(cartId, targetItem.count - 1)
    cartStore.updateCount(cartId, targetItem.count - 1)
    cartStore.calcTotalPrice()
  } catch (error) {
    ElMessage.error('修改数量失败')
  }
}

// 增加数量（限制真实库存）
const handleAdd = async (item: any) => {
  if (item.count + 1 > item.stock) {
    ElMessage.warning(`库存不足，最多可购买 ${item.stock} 本`)
    return
  }

  try {
    await updateCartCount(item.cartId, item.count + 1)
    cartStore.updateCount(item.cartId, item.count + 1)
    cartStore.calcTotalPrice()
  } catch (error) {
    ElMessage.error('修改数量失败')
  }
}

// 删除商品
const handleDelete = async (cartId: number) => {
  try {
    await deleteCartItem(cartId)
    cartStore.deleteItem(cartId)
    cartStore.calcTotalPrice()
    checkedIds.value = checkedIds.value.filter((id) => id !== cartId)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 清空购物车
const handleClear = async () => {
  try {
    await clearCart()
    cartStore.clearCart()
    checkedIds.value = []
    ElMessage.success('清空购物车成功')
  } catch (error) {
    ElMessage.error('清空购物车失败')
  }
}

// 支付
const handlePay = () => {
  const selectedItems = cartStore.currentCart.filter((item) =>
    checkedIds.value.includes(item.cartId),
  )
  if (selectedItems.length === 0) {
    ElMessage.warning('请先勾选要结算的商品')
    return
  }
  const xuanzhongid = checkedIds.value.join(',')
  router.push({
    path: '/pay',
    query: {
      cartIds: xuanzhongid,
    },
  })
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none !important;
  -webkit-user-select: none !important;
}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}

/* 加载遮罩 */
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
}
/* 遮罩淡出动画 */
.fade-leave-active {
  opacity: 1;
  transition: opacity 0.4s ease;
}
.fade-leave-to {
  opacity: 0;
}

/* ========== 核心响应式容器 ========== */
.syses11 {
  color: #000000;
  font-size: clamp(16px, 3vw, 18px);
  margin-bottom: 10px;
  display: inline-block;
}
.cart-container {
  width: 95%;
  max-width: 1200px;
  margin: 24px auto;
  color: #2d2b2b;
  padding: 0 0.5rem;
}
.cart-title {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 0 auto 22px;
  text-align: center;
  color: #ff9100;
  font-size: clamp(24px, 5vw, 32px);
  letter-spacing: 0.04em;
}
.cart-title::before {
  content: '🛒';
  display: inline-block;
  margin-right: 0.65rem;
  font-size: 1.4rem;
}
.cart-title::after {
  content: '';
  display: inline-block;
  margin-left: 0.75rem;
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 145, 0, 0.9), rgba(255, 145, 0, 0.2));
}

/* ========== 购物车列表容器 ========== */
.cart-list {
  background: rgba(255, 255, 255, 0.96);
  padding: clamp(18px, 3vw, 28px);
  border-radius: 18px;
  width: 100%;
  box-shadow: 0 18px 50px rgba(44, 62, 80, 0.08);
  border: 1px solid rgba(255, 145, 0, 0.14);
}

/* ========== 全选栏 - 右侧总价永远贴边 ========== */
.check-all-bar {
  display: flex;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  width: 100%;
}
.check-all-bar :deep(.el-checkbox) {
  color: #007bff;
  font-size: clamp(14px, 2vw, 16px);
}
/* 总价自动贴右边缘 */
.total-price {
  font-weight: bold;
  font-size: clamp(16px, 3vw, 20px);
  color: #000000;
  margin-left: auto; /* 核心：自动推到最右侧 */
  white-space: nowrap;
}

/* ========== 购物车单项 - 响应式弹性布局 ========== */
.cart-item {
  display: flex;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid rgba(60, 60, 60, 0.08);
  gap: clamp(10px, 2vw, 18px); /* 自适应间距 */
  width: 100%;
  flex-wrap: nowrap; /* 禁止换行，防止溢出 */
  transition:
    background 0.25s ease,
    transform 0.25s ease;
}
.cart-item:hover {
  background: rgba(255, 245, 225, 0.42);
  transform: translateY(-1px);
}
.item-check {
  flex-shrink: 0; /* 禁止压缩 */
}
.item-check :deep(.el-checkbox) {
  color: #ff9100;
}

/* 封面自适应 */
.item-cover {
  width: clamp(55px, 10vw, 86px);
  height: clamp(80px, 13vw, 125px);
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0; /* 禁止压缩 */
}

/* 图书信息区 */
.item-info {
  flex: 1; /* 填充剩余空间 */
  min-width: 0; /* 核心：解决flex文本溢出问题 */
}
.item-name {
  font-size: clamp(18px, 2.5vw, 20px);
  font-weight: 700;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-name::before {
  content: '📘';
  display: inline-block;
  margin-right: 6px;
}
.item-price {
  font-size: clamp(15px, 2vw, 17px);
  color: #d97706;
  font-weight: 700;
  white-space: nowrap;
}
.item-price::before {
  content: '💰';
  margin-right: 4px;
}

/* 数量控制区 - 自适应尺寸，不压缩 */
.item-count {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 禁止压缩 */
}
.count-btn {
  width: clamp(32px, 6vw, 45px);
  height: clamp(32px, 6vw, 42px);
  border: none;
  background: #ffae00;
  color: #000;
  font-size: clamp(18px, 3vw, 22px);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.count-btn:hover {
  background: #ff6600;
}

/* 数量输入框自适应 */
:deep(.count-num.el-input-number) {
  width: clamp(45px, 8vw, 60px) !important;
  height: clamp(32px, 6vw, 46px);
  margin: 0 2px;
}
:deep(.count-num .el-input__wrapper) {
  height: 100%;
  padding: 0;
  box-shadow: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
:deep(.count-num .el-input__inner) {
  text-align: center;
  padding: 0;
  font-size: clamp(14px, 2vw, 16px);
  color: #000;
}

/* 删除按钮-自适应 */
.del-btn {
  background: linear-gradient(135deg, #ff5858, #ff0000);
  color: #ffffff;
  border: none;
  padding: 0 clamp(10px, 2vw, 14px);
  height: clamp(34px, 6vw, 42px);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0; /* 禁止压缩 */
  font-size: clamp(13px, 2vw, 15px);
  box-shadow: 0 8px 18px rgba(255, 77, 77, 0.2);
}
.del-btn:hover {
  background: linear-gradient(135deg, #ff7b7b, #e60000);
}

/* ========== 底部按钮区-永远贴右边缘 ========== */
.cart-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 核心：按钮永远贴右侧 */
  gap: clamp(10px, 2vw, 14px);
  width: 100%;
  flex-wrap: wrap;
}
.clear-btn,
.clear-btn1,
.go-shop-btn {
  background: linear-gradient(135deg, #ffe1a8, #ffb347);
  color: #1f2937;
  border: none;
  padding: 0 clamp(14px, 3vw, 22px);
  height: clamp(38px, 6vw, 44px);
  border-radius: 10px;
  cursor: pointer;
  font-size: clamp(14px, 2vw, 16px);
  white-space: nowrap;
  box-shadow: 0 12px 26px rgba(255, 169, 50, 0.18);
}
.clear-btn1::before {
  content: '✔️';
  margin-right: 6px;
}
.clear-btn::before {
  content: '🧹';
  margin-right: 6px;
}
.go-shop-btn::before {
  content: '🏠';
  margin-right: 6px;
}
.clear-btn1:hover,
.clear-btn:hover,
.go-shop-btn:hover {
  background: linear-gradient(135deg, #ffcc7f, #ff9a17);
  transition: all 0.25s ease;
}

/* ========== 空购物车 ========== */
.empty-cart {
  text-align: center;
  padding: clamp(40px, 8vw, 60px) 0;
  background: linear-gradient(180deg, rgba(255, 243, 224, 0.95), rgba(255, 236, 207, 0.95));
  border-radius: 18px;
  width: 100%;
  box-shadow: 0 18px 40px rgba(117, 94, 54, 0.12);
}
.empty-icon {
  font-size: clamp(42px, 10vw, 70px);
  margin-bottom: 18px;
}
.empty-tip {
  font-size: clamp(16px, 3vw, 18px);
  margin-bottom: 20px;
  color: #5c4a19;
}

/* ========== 超小屏幕极限适配 ========== */
@media (max-width: 480px) {
  .cart-item {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .item-info {
    flex: 1;
    min-width: 120px;
  }
  .item-count {
    margin-left: auto;
  }
  .del-btn {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
