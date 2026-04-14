import request from '../../utils/request'
import type { Announcement } from '@/types/index'
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
// 新增公告
export const addAnnouncement = (data: { title: string; content: string }) => {
  return request({
    url: '/api/announcement/add',
    method: 'POST',
    data,
  })
}

// 修改公告
export const updateAnnouncement = (data: { id: number; title: string; content: string }) => {
  return request({
    url: '/api/announcement/update',
    method: 'PUT',
    data,
  })
}

// 删除公告
export const deleteAnnouncement = (id: number) => {
  return request({
    url: `/api/announcement/delete/${id}`,
    method: 'DELETE',
  })
}
