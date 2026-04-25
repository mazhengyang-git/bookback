import request from '@/utils/request'
import type { newBook } from '@/types/index'

// 匹配后端 /api/book/front/book/list
export function getAdminBookList() {
  return request({
    url: 'api/newbookguanli/front/list',
    method: 'GET',
  })
}
export function addBook(data: newBook) {
  return request({
    url: 'api/newbookguanli/add',
    method: 'post',
    data,
  })
}

// 管理员修改图书
export function updateBook(data: newBook) {
  return request({
    url: 'api/newbookguanli/update',
    method: 'put',
    data,
  })
}

// 管理员删除图书
export function deleteBook(id: number) {
  return request({
    url: `api/newbookguanli/delete/${id}`,
    method: 'delete',
  })
}
