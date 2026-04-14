import request from '@/utils/request'
import type { Book } from '@/types/index'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 匹配后端 /api/book/front/book/list
export const getBookListApi = (category?: string) => {
  return request.get<ApiResponse<Book[]>>('/api/book/front/book/list', {
    params: { category },
  })
}

export const getBookDetailApi = (id: number) => {
  return request.get<ApiResponse<Book | null>>('/api/book/front/book/detail', {
    params: { id },
  })
}

export const getBookList = getBookListApi
export const getBookDetail = getBookDetailApi
