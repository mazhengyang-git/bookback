import request from '@/utils/request'
import type { User } from '@/types/index'

// 定义登录接口返回类型（精准匹配后端返回格式）
interface LoginResponse {
  code: number
  msg: string
  data: {
    token: string
    user: User & { role: string } // 补充role字段，匹配后端返回
  }
}

// 定义注册接口返回类型
interface RegisterResponse {
  code: number
  msg: string
}

// 登录接口（类型更精准，适配管理员角色）
export const login = (data: {
  username: string
  password: string
  role: 'buyer' | 'seller' | 'admin'
}) => {
  return request.post<LoginResponse>('/api/user/login', data)
}

// 注册接口（明确角色类型，适配管理员注册）
export const register = (data: {
  username: string
  password: string
  role: 'buyer' | 'seller' | 'admin' // 必传role，避免可选导致的问题
}) => {
  return request.post<RegisterResponse>('/api/user/register', data)
}
