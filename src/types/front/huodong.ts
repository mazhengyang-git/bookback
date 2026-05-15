export interface Huodong {
  id: number
  name: string
  desc: string
  image: string
  url: string
  title: string
  status: number
  time: string
  content: string
  create_time: string
  page_type?: string
}

// 活动详情表数据
export interface HuodongDetail {
  id: number
  activity_id: number
  desc: string
  content: string
  extra_fields: Record<string, any>
  create_time: string
  update_time: string
}

// 活动详情接口返回的完整数据（主表+详情表）
export interface ActivityDetailData extends Huodong {
  page_type: string
  detail: HuodongDetail | null
}
