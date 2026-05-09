// src/utils/request.ts（请求拦截器加token）
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:3002', // 和后端路由前缀匹配
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：自动携带token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      // 添加Authorization请求头，和后端auth中间件匹配
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误：', error)
    return Promise.reject(error)
  },
)

// 响应拦截器：统一处理响应
request.interceptors.response.use(
  (response) => {
    // 适配后端返回格式（code/msg/data）
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    console.error('响应错误：', error)
    ElMessage.error(error.message || '服务器错误')
    return Promise.reject(error)
  },
)

export default request