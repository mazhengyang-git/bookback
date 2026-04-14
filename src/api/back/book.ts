import request from '@/utils/request'
import type { Book } from '@/types/index'

// 匹配后端 /api/book/front/book/list
export function getAdminBookList() {
  return request({
    url: 'api/bookguanli/front/list',
    method: 'GET',
  })
}
export function addBook(data: Book) {
  return request({
    url: 'api/bookguanli/add',
    method: 'post',
    data,
  })
}

// 管理员修改图书
export function updateBook(data: Book) {
  return request({
    url: 'api/bookguanli/update',
    method: 'put',
    data,
  })
}

// 管理员删除图书
export function deleteBook(id: number) {
  return request({
    url: `api/bookguanli/delete/${id}`,
    method: 'delete',
  })
}
