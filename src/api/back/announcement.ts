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
export function getMyNotice() {
  return request({
    url: '/api/announcement/my-notice',
    method: 'get',
  })
}

// 用户绑定手机号
export function bindPhone(phone) {
  return request({
    url: '/api/announcement/bind-phone',
    method: 'post',
    data: { phone },
  })
}

// 管理员重置密码（验证手机号）
export function resetUserPassword(data) {
  return request({
    url: '/api/announcement/reset-password',
    method: 'post',
    data,
  })
}
