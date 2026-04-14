import { User } from '@/types'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: {} as User,
  }),
  getters: {
    isLogin: (state) => !!state.token,
    userRole: (state) => {
      return state.user?.role || 'buyer'
    },
  },
  actions: {
    login(data: {
      code?: number
      msg?: string
      data?: { token: string; user: User }
      token?: any
      user?: any
    }) {
      this.token = data.token
      this.user = data.user
    },
    logout() {
      this.token = ''
      this.user = {} as User
    },
  },
  persist: true,
})
