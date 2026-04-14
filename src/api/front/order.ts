import request from '@/utils/request'
import type { Order } from '@/types/index'

/**
 * 获取当前登录用户的订单列表（关联图书封面/名称，拼多多样式展示用）
 */
export const getUserOrderList = () => {
  return request({ url: '/api/user/orders', method: 'get' })
}
export const deleteOrder = (orderno: string) => {
  return request({
    url: '/api/user/orders/delete', // 你的删除订单接口路径
    method: 'post',
    data: { orderno }, // 注意参数名和后端一致：orderno
  })
}
