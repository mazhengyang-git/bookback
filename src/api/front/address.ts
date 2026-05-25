import request from '@/utils/request'

// 获取地址列表
export const getAddressList = () => request.get('/api/address/list')
// 获取默认地址
export const getDefaultAddress = () => request.get('/api/address/default')
// 保存地址
export const saveAddress = (data: any) => request.post('/api/address/save', data)
// 删除地址
export const deleteAddress = (id: number) => request.post('/api/address/delete', { id })