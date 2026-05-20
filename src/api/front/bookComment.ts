// 引入项目封装好的 axios 请求工具
import request from '@/utils/request'

/**
 * 1. 校验用户评价权限 +  source 参数
 */
export function checkCommentAuth(bookId: number, source: string) {
  return request({
    url: '/api/comment/checkAuth',
    method: 'get',
    params: { bookId, source },
  })
}

/**
 * 2. 获取图书平均分 + 评价总数 +  source 参数
 */
export function getBookAvgScore(bookId: number, source: string) {
  return request({
    url: '/api/comment/avg',
    method: 'get',
    params: { bookId, source },
  })
}

/**
 * 3. 获取图书评价列表 +  source 参数
 */
export function getCommentList(bookId: number, source: string) {
  return request({
    url: '/api/comment/list',
    method: 'get',
    params: { bookId, source },
  })
}

/**
 * 4. 提交图书评价 +  source 字段
 */
export function addComment(data: { bookId: number; score: number; content: string; source: string }) {
  return request({
    url: '/api/comment/add',
    method: 'post',
    data,
  })
}

/**
 * 5. 获取随机评论 +  source 参数
 */
export function getRandomComments(bookId: number, source: string) {
  return getCommentList(bookId, source)
}
export function deleteCommentApi(data: { commentId: number; bookId: number; source: string }) {
  return request({
    url: '/api/comment/delete',
    method: 'post',
    data,
  })
}

// 1. 编辑评论
export const editCommentApi = (data: any) => {
  return request.post('/api/comment/edit', data)
}
// 2. 发表追评
export const addReplyApi = (data: any) => {
  return request.post('/api/comment/reply/add', data)
}
// 3. 获取追评列表
export const getReplyListApi = (commentId: number, source: string) => {
  return request.get('/api/comment/reply/list', { params: { commentId, source } })
}