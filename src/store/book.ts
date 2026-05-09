import { defineStore } from 'pinia'
// 导入真实接口
import { getBookListApi, getBookDetailApi } from '@/api/front/book'
import { Announcement } from '@/types'

export const useBookStore = defineStore('book', {
  state: () => ({
    bookList: [],
    announcementList: [] as Announcement[],
    bookDetail: null,
  }),
  actions: {
    // 获取列表（完全适配后端）
    async fetchBookList(category?: string) {
      const res = await getBookListApi(category)
      this.bookList = res.data
    },
    // 获取详情
    async fetchBookDetail(id: number) {
      const res = await getBookDetailApi(id)
      this.bookDetail = res.data
    },
    // 设置公告列表
    setAnnouncementList(list: Announcement[]) {
      this.announcementList = list
    }
  }
  
})
