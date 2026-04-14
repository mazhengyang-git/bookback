import { adminGetAllOrdersApi, adminUpdateOrderStatusApi } from '../mock'

// 获取所有订单
export const adminGetAllOrders = (status?: string) => {
  return adminGetAllOrdersApi(status)
}

// 修改订单状态
export const adminUpdateOrderStatus = (id: number, status: string) => {
  return adminUpdateOrderStatusApi(id, status)
}
