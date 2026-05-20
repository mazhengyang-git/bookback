import request from '@/utils/request'
import type { Seller } from '@/types/seller'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export const sellerLoginCheckApi = () =>
  request.get<ApiResponse<{ user: unknown; seller: Seller }>>('/api/seller/profile/check')

export const getSellerProfileApi = () =>
  request.get<ApiResponse<Seller>>('/api/seller/profile')

export const updateSellerProfileApi = (data: Partial<Seller>) =>
  request.put<ApiResponse<Seller>>('/api/seller/profile', data)
