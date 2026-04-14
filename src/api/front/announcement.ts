// 封装请求工具
import request from '../../utils/request'
import type { Announcement } from '../../types'

// 获取所有公告（所有人可用）
export const getAnnouncementList = () => {
  return request<{
    code: number
    data: Announcement[]
    msg: string
  }>({
    url: '/api/announcement/list',
    method: 'GET',
  })
}
