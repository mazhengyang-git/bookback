import { defineStore } from 'pinia'
import { getZixunListApi } from '@/api/front/zixun'
import type { Zixun } from '@/types/front/zixun'

export const useZixunStore = defineStore('zixun', {
  state: () => ({
    zixunList: [] as Zixun[],
  }),
  actions: {
    // 获取活动列表
    async fetchZixunList() {
      const res = await getZixunListApi()
      this.zixunList = res.data
    },
  },
})
