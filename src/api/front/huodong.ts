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

export const addHuodongApi = () => {
  return request.post<ApiResponse<Huodong[]>>('/api/addhuodong')
}
export const updateHuodongApi = (id: number, status: number) => {
  return request.put<ApiResponse<Huodong[]>>('/api/updatehuodong')
}
export const updateHuodongStatusApi = (data: { id: number; status: string }) => {
  return request.put<ApiResponse<Huodong[]>>('/api/updatehdstatus', data)
}
export const deleteHuodongApi = () => {
  return request.delete<ApiResponse<Huodong[]>>('/api/deletehuodong/:id')
}

