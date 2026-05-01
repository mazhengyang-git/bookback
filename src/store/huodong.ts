import { defineStore } from 'pinia'
import { getHuodongListApi } from '@/api/front/huodong'
import type { Huodong } from '@/types/front/huodong'

export const useHuodongStore = defineStore('huodong', {
  state: () => ({
    huodongList: [] as Huodong[],
  }),
  actions: {
    // 获取活动列表
    async fetchHuodongList() {
      const res = await getHuodongListApi()
      this.huodongList = res.data
    },
  },
})
