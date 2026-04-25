/**
 * 评价权限校验返回类型
 */
export interface CommentAuth {
  hasAuth: boolean // 是否有评价权限
  hasCommented: boolean // 是否已评价
}

/**
 * 图书评分统计类型
 */
export interface BookScore {
  avgScore: number // 平均分
  commentCount: number // 评价总数
}

/**
 * 评价列表项类型
 */
export interface CommentItem {
  id: number
  userId: number
  bookId: number
  score: number
  content: string
  nickname: string
  createTime: string
}

/**
 * 提交评价表单类型
 */
export interface CommentForm {
  score: number
  content: string
}
