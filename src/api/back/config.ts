import request from '@/utils/request' // 你的axios封装

// 获取系统配置
export const getSystemConfig = (key?: string) => {
  return request({
    url: '/api/config',
    method: 'get',
    params: key ? { key } : {},
  })
}

// 更新系统配置
export const updateSystemConfig = (data: {
  config_key: string
  config_value: any
  config_desc?: string
}) => {
  return request({
    url: '/api/config',
    method: 'put',
    data,
  })
}
