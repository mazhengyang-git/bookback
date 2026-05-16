import request from '@/utils/request'

// 地址类型（统一复用）
export interface AddressParams {
  province: string
  city: string
  district: string
  detail: string
}

/**
 获取待支付商品信息（传选中的购物车ID列表）
 @param cartIds 购物车ID数组/逗号拼接字符串
 */
export const getPayGoodsInfo = (cartIds: number[] | string) => {
  return request.post<{
    code: number
    msg: string
    data: any[]
  }>('/api/pay/info', { cartIds })
}

/**
 提交模拟支付（生成订单+清空购物车）
  address 参数
 */
export const submitMockPay = (
  cartIds: number[] | string,
  address: AddressParams  
) => {
  return request.post<{
    code: number
    msg: string
    data: { orderNo: string }
  }>('/api/pay/submit', { cartIds, address })
}

/**
 * 获取详情页直付商品信息
 */
export const getDirectPayGoodsInfo = (
  bookId: number,
  buyCount: number,
  source: string = 'normal',
) => {
  return request.post<{
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
 * 提交详情页直付
 * address 参数
 */
export const submitDirectPay = (
  bookId: number,
  buyCount: number,
  source: string = 'normal',
  address: AddressParams
) => {
  return request.post<{
    code: number
    msg: string
    data: { orderNo: string }
  }>('/api/pay/direct/submit', { bookId, buyCount, source, address })
}

// 密码验证
export const verifyPayPwd = (data: { password: string }) => {
  return request.post<{
    code: number
    msg: string
    data: any
  }>('/api/pay/verifyPwd', data)
}