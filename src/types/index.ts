// 星途科幻图书电商平台 - 核心类型定义
// 图书信息
export interface Book {
  id: number
  name: string // 书名
  author: string // 作者
  category: string // 科幻分类（硬科幻/软科幻/科幻小说等）
  price: number // 价格
  cover: string // 封面图
  desc: string // 简介
  stock: number // 库存
  sales_count?: number // 累计销量
  mulu: string //目录展示
  author_into: string //作者简介
}
export interface newBook {
  id: number
  name: string // 书名
  author: string // 作者
  category: string // 科幻分类（硬科幻/软科幻/科幻小说等）
  price: number // 价格
  cover: string // 封面图
  desc: string // 简介
  stock: number // 库存
  sales_count?: number // 累计销量
  mulu: string //目录展示
  author_into: string //作者简介
}

// 用户信息
export interface User {
  id: number
  username: string
  role: 'buyer' | 'seller' | 'admin' // 买家/卖家/管理员（毕设角色权限）
  token?: string
  create_time?: string
  update_time?: string
  phone: string
  sign: string
   avatar: string 
}

// 购物车项
export interface CartItem extends Book {
  count: number // 购买数量
  checked: boolean // 是否选中
}
// 订单类型
export interface Order {
  id: number
  orderNo: string
  user_id: number
  book_id: number
  count: number
  totalPrice: number
  status: string
  createTime: string
  book_name: string
  book_cover: string
}
export interface ShoucangItem extends Book {
  count: number // 购买数量
  checked: boolean // 是否选中
}
// 原有 User 和 Book 类型保留，新增 Order 即可
// 公告数据类型（和后端对应）
export interface Announcement {
  id: number
  title: string
  content: string
  create_time: string
  admin_id: number
  update_time?: string
  phone: string
}
export interface userment {
  id: number
  username: string
  create_time: string
  update_time: string
  role: 'admin' | 'buyer' | 'seller'
  phone: string
  sign: string
}
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
