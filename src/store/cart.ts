import { defineStore } from 'pinia'

interface CartItem {
  cartId: number // 购物车项ID
  id: number // 图书ID
  name: string // 图书名称
  price: number // 价格
  count: number // 数量
  cover: string // 封面
  spec: string // 规格
  stock: number // 商品库存
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    currentCart: [] as CartItem[],
    cartPriceTotal: 0 as number,
  }),
  actions: {
    // 添加购物车项（自动接收 stock 库存字段）
    addToCart(item: CartItem) {
      this.currentCart.push(item)
      this.calcTotalPrice()
    },
    // 清空购物车
    clearCart() {
      this.currentCart = []
      this.cartPriceTotal = 0
    },
    // 更新数量
    updateCount(cartId: number, count: number) {
      const target = this.currentCart.find((item) => item.cartId === cartId)
      if (target) target.count = count
      this.calcTotalPrice()
    },
    // 删除项
    deleteItem(cartId: number) {
      this.currentCart = this.currentCart.filter((item) => item.cartId !== cartId)
      this.calcTotalPrice()
    },
    // 计算总价
    calcTotalPrice() {
      this.cartPriceTotal = this.currentCart.reduce((sum, item) => {
        return sum + item.price * item.count
      }, 0)
    },
  },
})
