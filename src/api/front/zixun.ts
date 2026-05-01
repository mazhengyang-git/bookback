import request from '@/utils/request'
import type { Zixun } from '@/types/front/zixun'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 匹配后端 /api/book/front/book/list
export const getZixunListApi = () => {
  return request.get<ApiResponse<Zixun[]>>('/api/zixun')
}
