export interface Seller {
  id: number
  user_id: number
  avatar: string
  shop_name: string
  intro: string
  contact: string
  create_time?: string
}

export interface SellerBookApply {
  id: number
  seller_id: number
  book_name: string
  author: string
  author_into: string
  category: string
  price: number | string
  stock: number
  sales_count?: number
  cover: string
  desc: string
  mulu: string
  status: number
  publisher: string
  avg_score?: number
  comment_count?: number
  audit_status: number
  audit_reason: string
  source_book_id?: number | null
  create_time?: string
  shop_name?: string
  seller_avatar?: string
  username?: string
}

export interface SellerBook extends SellerBookApply {
  name?: string
  is_seller?: boolean
  book_type?: number
  shop_id?: number
  seller_avatar?: string
}

export interface SellerBookForm {
  book_name: string
  author: string
  author_into: string
  category: string
  price: number
  stock: number
  cover: string
  desc: string
  mulu: string
  status: number
  publisher: string
}
