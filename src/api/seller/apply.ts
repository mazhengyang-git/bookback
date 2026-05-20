import request from '@/utils/request'
import type { SellerBookApply, SellerBookForm } from '@/types/seller'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export const submitSellerApplyApi = (data: SellerBookForm) =>
  request.post<ApiResponse<null>>('/api/seller/apply', data)

export const getSellerApplyListApi = () =>
  request.get<ApiResponse<SellerBookApply[]>>('/api/seller/apply/list')

export const updateSellerApplyApi = (id: number, data: SellerBookForm) =>
  request.put<ApiResponse<null>>(`/api/seller/apply/${id}`, data)

export const deleteSellerApplyApi = (id: number) =>
  request.delete<ApiResponse<null>>(`/api/seller/apply/${id}`)

export const getAdminApplyListApi = (audit_status?: number | string) =>
  request.get<ApiResponse<SellerBookApply[]>>('/api/seller/admin/apply/list', {
    params: { audit_status },
  })

export const approveSellerApplyApi = (id: number) =>
  request.post<ApiResponse<null>>('/api/seller/admin/apply/approve', { id })

export const rejectSellerApplyApi = (id: number, audit_reason: string) =>
  request.post<ApiResponse<null>>('/api/seller/admin/apply/reject', { id, audit_reason })
