// src/router/back.ts（后台路由独立配置文件）
/**
 * 后台路由配置：仅管理员可访问的页面
 * 所有路由均需登录 + 管理员权限
 */
const backRoutes = [
  // 后台首页（核心修改：路径改为 /admin，而非 /）
  {
    path: '/admin',
    name: 'AdminHome',
    component: () => import('@/views/back/home/index.vue'),
    meta: { title: '后台管理-首页', requiresAuth: true, requiresAdmin: true },
  },
  // 图书管理
  {
    path: '/admin/book',
    name: 'AdminBook',
    component: () => import('@/views/back/book/index.vue'),
    meta: { title: '图书管理', requiresAuth: true, requiresAdmin: true },
  },
  // 用户管理
  {
    path: '/admin/user',
    name: 'AdminUser',
    component: () => import('@/views/back/user/index.vue'),
    meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true },
  },
  // 订单管理
  {
    path: '/admin/order',
    name: 'AdminOrder',
    component: () => import('@/views/back/order/index.vue'),
    meta: { title: '订单管理', requiresAuth: true, requiresAdmin: true },
  },
  // 公告管理
  {
    path: '/admin/notice',
    name: 'AdminNotice',
    component: () => import('@/views/back/notice/index.vue'),
    meta: { title: '公告管理', requiresAuth: true, requiresAdmin: true },
  },
  // 系统设置
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: () => import('@/views/back/system/index.vue'),
    meta: { title: '系统设置', requiresAuth: true, requiresAdmin: true },
  },
]

export default backRoutes
