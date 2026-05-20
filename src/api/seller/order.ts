import request from '@/utils/request'

/**
 * 获取卖家自己的订单列表
 * @param status 订单状态筛选
 */
export const getSellerOrders = (status: string) => {
  return request({
    url: '/api/seller/orders',
    method: 'get',
    params: { status }
  })
}

/**
 * 卖家修改订单状态
 * @param orderId 订单ID
 * @param status 新状态
 */
export const updateSellerOrderStatus = (orderId: number, status: string) => {
  return request({
    url: '/api/seller/orders/status',
    method: 'post',
    data: { orderId, status }
  })
}

export const getSellerStats = () => {
  return request({
    url: '/api/seller/stats',
    method: 'get'
  })
}