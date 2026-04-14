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

        <!-- 封面：兜底默认图+加载失败兜底 -->
        <!--@vue-ignore-->
        <img
          :src="item.cover || '/default-book.png'"
          alt="图书封面"
          class="item-cover"
          @click="$router.push(`/book/${item.id}`)"
          @error="(e) => (e.target.src = '/default-book.png')"
        />
        <div class="item-info">
          <h3 class="item-name">{{ item.name || '未知图书' }}</h3>
          <p class="item-price">¥{{ Number(item.price || 0).toFixed(2) }}</p>
        </div>
        <div class="item-count">
          <button class="count-btn" @click="handleReduce(item.cartId)">-</button>
          <span class="count-num">{{ item.count || 1 }}</span>
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

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()
const allImagesLoaded = ref(false)

//勾选相关
const checkedIds = ref<number[]>([])
const isAllChecked = ref(false)

//计算：选中商品总价
const selectedTotal = computed(() => {
  return cartStore.currentCart
    .filter((item) => checkedIds.value.includes(item.cartId))
    .reduce((sum, item) => sum + item.price * item.count, 0)
})

//单个勾选
const handleItemCheck = (cartId: number, checked: boolean) => {
  if (checked) {
    checkedIds.value.push(cartId)
  } else {
    checkedIds.value = checkedIds.value.filter((id) => id !== cartId)
  }
  //同步全选状态
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

onMounted(() => {
  console.log('页面刷新，开始加载购物车数据')

  loadCartData()
  setTimeout(() => {
    allImagesLoaded.value = true
  }, 0.1) // 3秒后无论如何都隐藏遮罩
})

const loadCartData = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    const res = await getCartList() //@ts-ignore
    if (res.code === 200 && res.data) {
      cartStore.clearCart()
      res.data.forEach((item: any) => {
        cartStore.addToCart({
          cartId: item.id,
          id: item.goodsId,
          name: item.bookName,
          price: Number(item.bookPrice || item.price) || 0,
          count: item.quantity || item.count,
          cover: item.bookCover || item.cover,
          spec: item.spec || '平装版',
        })
      })
      cartStore.calcTotalPrice()

      //========== 默认全选 ==========
      checkedIds.value = cartStore.currentCart.map((item) => item.cartId)
      isAllChecked.value = true
    }
  } catch (error: any) {
    //console.error('加载购物车失败：', error)
    // ElMessage.error(error.msg || '加载购物车失败')
  }
}

const handleReduce = async (cartId: number) => {
  const targetItem = cartStore.currentCart.find((item) => item.cartId === cartId)
  if (!targetItem) return

  if (targetItem.count <= 1) {
    try {
      await deleteCartItem(cartId)
      cartStore.deleteItem(cartId)
      cartStore.calcTotalPrice()
      //同步删除勾选
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

const handleAdd = async (item: any) => {
  try {
    await updateCartCount(item.cartId, item.count + 1)
    cartStore.updateCount(item.cartId, item.count + 1)
    cartStore.calcTotalPrice()
  } catch (error) {
    ElMessage.error('修改数量失败')
  }
}

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

//支付：只传选中的商品
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
  user-select: none !important;
  -webkit-user-select: none !important;
}
input,
textarea,
button {
  user-select: auto !important;
  -webkit-user-select: auto !important;
}
.black-mask {
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 19999;
}

/* 遮罩淡出动画 */
.fade-leave-active {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
.syses11 {
  color: #000000;
  font-size: 18px;
}
.cart-container {
  width: 80%;
  margin: 20px auto;
  color: #2d2b2b;
}
.sejb11 {
  display: inline-block;
}
.cart-title {
  text-align: center;
  color: #ffae00;
  margin-bottom: 20px;
}
.cart-list {
  background: rgba(192, 191, 191, 0.7);
  padding: 20px;
  border-radius: 8px;
}

/* 全选栏 */
.check-all-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
}
.check-all-bar :deep(.el-checkbox) {
  color: #fff;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #333;
  gap: 12px;
}
/* 勾选框 */
.item-check :deep(.el-checkbox) {
  color: #fff;
}
.item-cover {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}
.item-info {
  flex: 1;
  margin: 0 10px;
}
.item-name {
  font-size: 16px;
  margin-bottom: 8px;
}
.item-price {
  color: #ba7608;
}
.item-count {
  display: flex;
  align-items: center;
  gap: 10px;
}
.count-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #ffae00;
  color: #000;
  cursor: pointer;
  border-radius: 4px;
}
.del-btn {
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.del-btn:hover {
  background: #da5757;
}
.cart-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.total-price {
  font-size: 18px;
  color: #000000;
  margin: 0;
}
.clear-btn {
  background: #ffae00;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn1 {
  background: #ffae00;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn1:hover {
  background: #ed931d;
  transition: all 0.3s ease;
}
.clear-btn:hover {
  background: #ed931d;
  transition: all 0.3s ease;
}
.empty-cart {
  text-align: center;
  padding: 50px 0;
  background: rgba(200, 198, 198, 0.7);
  border-radius: 8px;
}
.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}
.empty-tip {
  font-size: 18px;
  margin-bottom: 20px;
}
.go-shop-btn {
  background: #ffae00;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
