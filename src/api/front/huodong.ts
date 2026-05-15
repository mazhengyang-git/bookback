import request from '@/utils/request'
import type { Huodong, ActivityDetailData } from '@/types/front/huodong'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 活动列表
export const getHuodongListApi = () => {
  return request.get<ApiResponse<Huodong[]>>('/api/huodong')
}

// 活动详情（双参数：id + title）
export const getHuodongDetailApi = (id: string | number, title: string) => {
  return request.get<ApiResponse<ActivityDetailData>>(
    `/api/huodong/detail/${id}/${encodeURIComponent(title)}`
  )
}

// 新增活动
export const addHuodongApi = (data: any) => {
  return request.post<ApiResponse<any>>('/api/addhuodong', data)
}

// 修改活动
export const updateHuodongApi = (data: any) => {
  return request.put<ApiResponse<any>>('/api/updatehuodong', data)
}

// 修改状态
export const updateHuodongStatusApi = (data: { id: number; status: string }) => {
  return request.put<ApiResponse<any>>('/api/updatehdstatus', data)
}

// 删除
export const deleteHuodongApi = (id: number) => {
  return request.delete<ApiResponse<any>>(`/api/deletehuodong/${id}`)
}