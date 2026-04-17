import request from '@/utils/request'

// 获取所有订单（后台）
export const adminGetAllOrders = (status?: string) => {
  return request({
    url: '/api/back/order/list',
    method: 'get',
    params: { status },
  })
}

// 更新订单状态（后台）
export const adminUpdateOrderStatus = (orderId: number, status: string) => {
  return request({
    url: '/api/back/order/update',
    method: 'post',
    data: { orderId, status },
  })
}
