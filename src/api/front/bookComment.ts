// 引入你项目封装好的 axios 请求工具
import request from '@/utils/request'

/**
 * 1. 校验用户评价权限
 */
export function checkCommentAuth(bookId: number) {
  return request({
    url: '/api/comment/checkAuth',
    method: 'get',
    params: { bookId },
  })
}

/**
 * 2. 获取图书平均分 + 评价总数
 */
export function getBookAvgScore(bookId: number) {
  return request({
    url: '/api/comment/avg',
    method: 'get',
    params: { bookId },
  })
}

/**
 * 3. 获取图书评价列表
 */
export function getCommentList(bookId: number) {
  return request({
    url: '/api/comment/list',
    method: 'get',
    params: { bookId },
  })
}

/**
 * 4. 提交图书评价
 */
export function addComment(data: { bookId: number; score: number; content: string }) {
  return request({
    url: '/api/comment/add',
    method: 'post',
    data,
  })
}
export function getRandomComments(bookId: number) {
  return getCommentList(bookId)
}
