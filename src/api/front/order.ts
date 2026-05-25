import request from '@/utils/request'
import type { Order } from '@/types/index'

/**
 * 获取当前登录用户的订单列表
 */
export const getUserOrderList = () => {
  return request({ url: '/api/user/orders', method: 'get' })
}
export const deleteOrder = (orderno: string) => {
  return request({
    url: '/api/user/orders/delete', 
    method: 'post',
    data: { orderno }, 
  })
}
export function updateOrderStatus(data: { orderNo: string; status: string }) {
  return request({
    url: '/api/user/orders/updatestatus',
    method: 'post',
    data
  })
}