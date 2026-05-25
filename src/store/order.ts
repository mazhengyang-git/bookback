import { defineStore } from 'pinia'
import { ref } from 'vue'

// 全局订单实时同步 Store
export const useOrderStore = defineStore('order', () => {
  // 全局订单列表（两端共享）
  const orderList = ref<any[]>([])
  // 强制刷新标记
  const refreshFlag = ref(false)

  // 更新全局订单
  const setOrderList = (list: any[]) => {
    orderList.value = list
  }

  // 触发全局同步
  const syncOrder = () => {
    refreshFlag.value = !refreshFlag.value
  }

  return {
    orderList,
    refreshFlag,
    setOrderList,
    syncOrder
  }
})