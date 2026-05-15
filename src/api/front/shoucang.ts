// 导入封装好的request.ts（axios拦截器）
import request from '@/utils/request'

// ==================== 调用后端真实接口 ====================
// 1. 获取收藏夹列表（对应后端 /api/shoucang/list 接口）
export const getShoucangList = () => {
  // GET请求，路径拼接后是 http://localhost:3002/api/shoucang/list
  return request.get('/api/shoucang/list')
}

// 2. 加入收藏夹（对应后端 /api/shoucang/add 接口）
export const addToShoucang = (data: { goodsId: number; num: number; spec: string }) => {
  // POST请求，传前端的商品ID/数量/规格
  return request.post('/api/shoucang/add', data)
}


// 4. 删除收藏夹项（对应后端 /api/shoucang/delete 接口）
export const deleteShoucangItem = (shoucangId: number) => {
  return request.post('/api/shoucang/delete', { shoucangId })
}
// 清空收藏夹
export const clearShoucang = () => {
  return request.post('/api/shoucang/clear')
}

