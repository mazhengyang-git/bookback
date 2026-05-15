import { defineStore } from 'pinia'

interface ShoucangItem {
  shoucangId: number // 收藏项ID
  id: number // 图书ID
  name: string // 图书名称
 price: number // 价格
  source: string // 来源（如“图书详情页”或“订单页”）
  cover: string // 封面
  spec: string // 规格
 
}

export const useShoucangStore = defineStore('shoucang', {
  state: () => ({
    currentShoucang: [] as ShoucangItem[],
    shoucangPriceTotal: 0 as number,
  }),
  actions: {
    // 添加收藏项
    addToShoucang(item: ShoucangItem) {
      this.currentShoucang.push(item)
   
    },
    // 清空收藏夹
    clearShoucang() {
      this.currentShoucang = []
      this.shoucangPriceTotal = 0
    },
    
    // 删除收藏项
    deleteItem(shoucangId: number) {
      this.currentShoucang = this.currentShoucang.filter((item) => item.shoucangId !== shoucangId)
      
    },
   
  },
})
