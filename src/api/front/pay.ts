import request from '@/utils/request'

/**
 获取待支付商品信息（传选中的购物车ID列表）
 @param cartIds 购物车ID数组/逗号拼接字符串
 */
export const getPayGoodsInfo = (cartIds: number[] | string) => {
  return request.post<{
    code: number
    msg: string
    data: any[] // 对应购物车商品结构，和cartItem类型完全一致
  }>('/api/pay/info', { cartIds })
}

/**
 提交模拟支付（生成订单+清空购物车）
  @param cartIds 购物车ID数组/逗号拼接字符串
 */
export const submitMockPay = (cartIds: number[] | string) => {
  return request.post<{
    code: number
    msg: string
    data: { orderNo: string }
  }>('/api/pay/submit', { cartIds })
}
/**
 * 【新增】获取详情页直付商品信息
 * @param bookId 图书ID
 * @param buyCount 购买数量
 */
export const getDirectPayGoodsInfo = (
  bookId: number,
  buyCount: number,
  source: string = 'normal',
) => {
  return request.post<{
    price(price: any): unknown
    count(count: any): unknown
    bookId(bookId: any): unknown
    code: number
    msg: string
    data: {
      bookId: number
      name: string
      cover: string
      spec: string
      count: number
      price: number
    }
  }>('/api/pay/direct/info', { bookId, buyCount, source })
}
/**
 * 【新增】提交详情页直付（生成订单，无购物车操作）
 * @param bookId 图书ID
 * @param buyCount 购买数量
 */
export const submitDirectPay = (bookId: number, buyCount: number, source: string = 'normal') => {
  return request.post<{
    orderNo: any
    code: number
    msg: string
    data: { orderNo: string }
  }>('/api/pay/direct/submit', { bookId, buyCount, source })
}
