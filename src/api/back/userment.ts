import request from '../../utils/request'
import type { userment } from '@/types/index'
export const getusermentList = () => {
  return request<{
    statistics:
      | { totalUserCount: number; buyerCount: number; sellerCount: number }
      | { totalUserCount: number; buyerCount: number; sellerCount: number }
    list: any
    code: number
    data: userment[]
    msg: string
  }>({
    url: '/api/userment/list',
    method: 'GET',
  })
}
