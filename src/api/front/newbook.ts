import request from '@/utils/request'
import type { newBook } from '@/types/index'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 匹配后端 /api/book/front/book/list
export const getnewBookListApi = (category?: string) => {
  return request.get<ApiResponse<newBook[]>>('/api/front/newbook/list', {
    params: { category },
  })
}

export const getnewBookDetailApi = (id: number) => {
  return request.get<ApiResponse<newBook | null>>('/api/front/newbook/detail', {
    params: { id },
  })
}

export const getnewBookList = getnewBookListApi
export const getnewBookDetail = getnewBookDetailApi
