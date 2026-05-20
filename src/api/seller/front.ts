import request from '@/utils/request'
import type { Seller, SellerBook } from '@/types/seller'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export const getSellerBookListApi = (category?: string) =>
  request.get<ApiResponse<SellerBook[]>>('/api/seller/front/books', { params: { category } })

export const getSellerBookDetailApi = (id: number) =>
  request.get<ApiResponse<SellerBook>>('/api/seller/front/book/detail', { params: { id } })

export const getSellerHomeApi = (sellerId: number) =>
  request.get<ApiResponse<{ seller: Seller; books: SellerBook[] }>>(`/api/seller/front/shop/${sellerId}`)

export const searchShopsApi = (keyword?: string) =>
  request.get<ApiResponse<Seller[]>>('/api/seller/front/shops/search', { params: { keyword } })

export const getAllShopsApi = () =>
  request.get<ApiResponse<Seller[]>>('/api/seller/front/shops')
