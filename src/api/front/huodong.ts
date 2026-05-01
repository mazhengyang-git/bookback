import request from '@/utils/request'
import type { Huodong } from '@/types/front/huodong'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 匹配后端 /api/book/front/book/list
export const getHuodongListApi = () => {
  return request.get<ApiResponse<Huodong[]>>('/api/huodong')
}
