/**
 * 星途科幻图书电商平台 - 路由配置文件
 * 毕设项目：基于Vue3+TypeScript+Element Plus的科幻图书电商平台
 * 开发人：马政阳（替换为你的名字）
 * 开发时间：2026年6月
 *
 * 路由体系说明：
 * 1. 前台路由（front.ts）：买家/卖家访问的页面（首页、图书、购物车、登录等）
 * 2. 后台路由（back.ts）：管理员访问的页面（图书管理、用户管理、订单管理等）
 * 3. 权限守卫：拦截未登录/越权访问，确保不同角色只能访问对应页面
 * 4. 懒加载：所有路由组件均采用懒加载，优化首屏加载性能
 */

// ... 原有代码
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

// 路由懒加载（所有页面组件）
const routes = [
  // 重定向首页
  {
    path: '/',
    redirect: '/home',
  },
  // 首页
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/front/home/index.vue'),
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/front/login/index.vue'),
  },
  // 注册页
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/front/register/index.vue'),
  },
  // 个人中心（需要登录）
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/front/user/index.vue'),
    meta: { requiresAuth: true },
  },
  // 图书商城（列表页）
  {
    path: '/books',
    name: 'BookList',
    component: () => import('@/views/front/book/list.vue'),
  },
  // 图书详情页（动态路由）
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('@/views/front/book/detail.vue'),
  },
  // 购物车（需要登录）
  {
    path: '/cart',
    name: 'CartList',
    component: () => import('@/views/front/cart/index.vue'),
    meta: { requiresAuth: true },
  },
  // 购物车结算（需要登录）
  {
    path: '/pay',
    name: 'CartConfirm',
    component: () => import('@/views/front/pay/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pay/direct',
    name: 'BookConfirm',
    component: () => import('@/views/front/pay/direct.vue'),
    meta: { requiresAuth: true },
  },
  // 订单详情页（动态路由，需要登录）
  {
    path: '/order/:orderNo',
    name: 'OrderDetail',
    component: () => import('@/views/front/order/detail.vue'),
    meta: { requiresAuth: true },
  },
  // 管理员后台（需要管理员权限）
  {
    path: '/admin',
    name: 'Admin',
    // 修正：替换错误的pay页面为后台首页（避免白屏），保留原有嵌套结构
    component: () => import('@/views/back/home/index.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('@/views/back/user/index.vue'),
      },
      {
        path: 'book',
        name: 'AdminBook',
        component: () => import('@/views/back/book/index.vue'),
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: () => import('@/views/back/order/index.vue'),
      },

      // 新增：后台公告管理（保留嵌套结构，增量新增）
      {
        path: 'notice',
        name: 'AdminNotice',
        component: () => import('@/views/back/notice/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      // 新增：后台系统设置（保留嵌套结构，增量新增）
      {
        path: 'system',
        name: 'AdminSystem',
        component: () => import('@/views/back/system/index.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
  // 新增：卖家中心（补全原有缺失的路由，避免跳转/seller白屏）
  {
    path: '/seller',
    name: 'SellerCenter',
    component: () => import('@/views/front/seller/index.vue'),
    meta: { requiresAuth: true },
  },
  // 404 页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
  },
  // 匹配所有未定义路径，重定向到 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

//路由守卫（拦截）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const userRole = userStore.user?.role || 'buyer'

  //==============================================
  //卖家/管理员禁止访问买家首页 /home
  //==============================================
  if (to.path === '/home') {
    //未登录用户直接放行
    if (!userStore.isLogin) {
      return next()
    }
    if (userRole === 'buyer') {
      return next()
    }
    if (userRole === 'seller') {
      ElMessage.info('已为您跳转至卖家页面')
      return next({ path: '/seller', replace: true })
    }
    if (userRole === 'admin') {
      ElMessage.info('已为您跳转至管理页面')
      return next({ path: '/admin', replace: true })
    }
  }

  // ==============================================
  //已登录用户不能再进登录/注册页
  // ==============================================
  if ((to.path === '/login' || to.path === '/register') && userStore.isLogin) {
    if (userRole === 'seller') return next({ path: '/user', replace: true })
    if (userRole === 'admin') return next({ path: '/admin', replace: true }) // 修正：跳转/admin
    return next({ path: '/home', replace: true })
  }

  // ==============================================
  //登录/管理员权限判断
  //==============================================
  if (to.meta.requiresAuth) {
    if (!userStore.isLogin) {
      ElMessage.warning('请先登录')
      return next('/login')
    }

    if (to.meta.requiresAdmin && userRole !== 'admin') {
      ElMessage.error('无管理员权限')
      return next('/home')
    }
  }

  next()
})

export default router
