<template>
  <div class="cart-container">
    <h2 class="title">我的购物车</h2>

    <div v-if="cartStore.cartList.length === 0" class="empty">购物车是空的，快去选购图书吧~</div>

    <el-table v-else :data="cartStore.cartList" border style="width: 100%">
      <el-table-column label="图书名称" prop="name" />
      <el-table-column label="单价" prop="price">
        <template #default="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column label="数量">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.num"
            @change="cartStore.updateNum(scope.row.id, scope.row.num)"
            :min="1"
          />
        </template>
      </el-table-column>
      <el-table-column label="小计">
        <template #default="scope">¥{{ (scope.row.price * scope.row.num).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" @click="cartStore.delCart(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="cartStore.cartList.length" class="footer">
      <span>总计：¥{{ cartStore.totalPrice.toFixed(2) }}</span>
      <el-button type="primary" @click="submitOrder">结算下单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/store/modules/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

// 结算
const submitOrder = () => {
  ElMessage.success('下单成功！')
  cartStore.clearCart()
  router.push('/user')
}
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
}
.title {
  color: #409eff;
  margin-bottom: 20px;
}
.empty {
  padding: 40px;
  text-align: center;
  background: #121a28;
  border-radius: 8px;
}
.footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #121a28;
  border-radius: 8px;
}
</style>
