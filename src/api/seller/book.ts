import request from '@/utils/request'
import type { SellerBook, SellerBookForm } from '@/types/seller'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export const getSellerPublishedListApi = () =>
  request.get<ApiResponse<SellerBook[]>>('/api/seller/book/list')

export const getSellerPublishedDetailApi = (id: number) =>
  request.get<ApiResponse<SellerBook>>(`/api/seller/book/${id}`)

export const submitSellerBookReapplyApi = (id: number, data: SellerBookForm) =>
  request.post<ApiResponse<null>>(`/api/seller/book/${id}/reapply`, data)

export const deleteSellerPublishedApi = (id: number) =>
  request.delete<ApiResponse<null>>(`/api/seller/book/${id}`)

export const getAdminSellerBookListApi = () =>
  request.get<ApiResponse<SellerBook[]>>('/api/seller/admin/book/list')

export const deleteAdminSellerBookApi = (id: number) =>
  request.delete<ApiResponse<null>>(`/api/seller/admin/book/${id}`)
