// src/api/front/cart.ts
// 导入封装好的request.ts（axios拦截器）
import request from '@/utils/request'

// ==================== 调用后端真实接口 ====================
// 1. 获取购物车列表（对应后端 /api/cart/list 接口）
export const getCartList = () => {
  // GET请求，路径拼接后是 http://localhost:3002/api/cart/list
  return request.get('/api/cart/list')
}

// 2. 加入购物车（对应后端 /api/cart/add 接口）
export const addToCart = (data: { goodsId: number; num: number; spec: string }) => {
  // POST请求，传前端的商品ID/数量/规格
  return request.post('/api/cart/add', data)
}

// 3. 更新购物车数量（对应后端 /api/cart/update 接口）
export const updateCartCount = (cartId: number, quantity: number) => {
  return request.post('/api/cart/update', { cartId, quantity })
}

// 4. 删除购物车项（对应后端 /api/cart/delete 接口）
export const deleteCartItem = (cartId: number) => {
  return request.post('/api/cart/delete', { cartId })
}
// 清空购物车
export const clearCart = () => {
  return request.post('/api/cart/clear')
}
// 5. 切换选中状态（暂时保留空实现，后续可扩展）
export const toggleCartChecked = (id: number, checked: boolean) => {
  // 先返回空Promise，后续需要时再对接后端
  return Promise.resolve({ code: 200, msg: '暂未实现' })
}
