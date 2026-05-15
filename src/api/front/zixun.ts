import request from '@/utils/request'
import type { Zixun } from '@/types/front/zixun'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 获取资讯列表
export const getZixunListApi = () => {
  return request.get<ApiResponse<Zixun[]>>('/api/zixun')
}

// 新增资讯
export const addZixunApi = (data: Partial<Zixun>) => {
  return request.post<ApiResponse<null>>('/api/addzixun', data)
}

// 修改资讯
export const updateZixunApi = (data: Partial<Zixun>) => {
  return request.put<ApiResponse<null>>('/api/updatezixun', data)
}

// 修改资讯状态
export const updateZixunStatusApi = (data: { id: number; status: string }) => {
  return request.put<ApiResponse<null>>('/api/updatezxstatus', data)
}

// 删除资讯
export const deleteZixunApi = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/deletezixun/${id}`)
}
