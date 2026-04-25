import { defineStore } from 'pinia'
import { getnewBookListApi, getnewBookDetailApi } from '@/api/front/newbook'

export const useBookStore1 = defineStore('newbook', {
  state: () => ({
    bookList1: [],
    bookDetail1: null,
  }),
  actions: {
    // 获取列表
    async fetchBookList(category?: string) {
      try {
        const res = await getnewBookListApi(category)
        // 重点！后端返回包裹了一层data，必须取 res.data.data
        this.bookList1 = res.data
        console.log('新书数据请求成功', this.bookList1)
      } catch (err) {
        console.error('新书列表请求失败', err)
        this.bookList1 = []
      }
    },
    // 获取详情
    async fetchBookDetail(id: number) {
      try {
        const res = await getnewBookDetailApi(id)
        this.bookDetail1 = res.data
      } catch (err) {
        console.error('图书详情请求失败', err)
        this.bookDetail1 = null
      }
    },
  },
})
