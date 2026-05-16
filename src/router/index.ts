import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: () => import('@/views/front/home/index.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/front/login/index.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/front/register/index.vue') },
  { path: '/user', name: 'UserCenter', component: () => import('@/views/front/user/index.vue'), meta: { requiresAuth: true } },
  { path: '/userinfo', name: 'UserInfo', component: () => import('@/views/front/user/user.vue'), meta: { requiresAuth: true } },
  { path: '/books', name: 'BookList', component: () => import('@/views/front/book/list.vue') },
   { path: '/books1', name: 'BookList1', component: () => import('@/views/front/book/list1.vue') },
  { path: '/book/:id', name: 'BookDetail', component: () => import('@/views/front/book/detail.vue') },
  { path: '/book1/:id', name: 'BookDetail1', component: () => import('@/views/front/book/detail1.vue') },
  { path: '/cart', name: 'CartList', component: () => import('@/views/front/cart/index.vue'), meta: { requiresAuth: true } },
   { path: '/shoucang', name: 'ShoucangList', component: () => import('@/views/front/cart/shoucang.vue'), meta: { requiresAuth: true } },
  { path: '/pay', name: 'CartConfirm', component: () => import('@/views/front/pay/index.vue'), meta: { requiresAuth: true } },
  { path: '/pay/direct', name: 'BookConfirm', component: () => import('@/views/front/pay/direct.vue'), meta: { requiresAuth: true } },
  { path: '/order/:orderNo', name: 'OrderDetail', component: () => import('@/views/front/order/detail.vue'), meta: { requiresAuth: true } },
  { path: '/huodong', name: 'homehuodong', component: () => import('@/views/front/home/huodong.vue') },
  { path: `/huodong `, name: 'homehuodong.', component: () => import('@/views/front/home/huodong1.vue') },
  { path: '/activity/:id', name: 'ActivityDetail', component: () => import('@/views/front/activity/ActivityDetail.vue') },
  
  {
  path: '/activity/:id/:title',
  name: 'ActivityDetail',
  component: () => import('@/views/front/activity/ActivityDetail.vue'),
},
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/back/home/index.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'user', name: 'AdminUser', component: () => import('@/views/back/user/index.vue') },
      { path: 'book', name: 'AdminBook', component: () => import('@/views/back/book/index.vue') },
      { path: 'order', name: 'AdminOrder', component: () => import('@/views/back/order/index.vue') },
      { path: 'notice', name: 'AdminNotice', component: () => import('@/views/back/notice/index.vue') },
      { path: 'system', name: 'AdminSystem', component: () => import('@/views/back/system/index.vue') },
      { path: 'useradmin', name: 'AdminUseradmin', component: () => import('@/views/back/user/index.vue') },
      { path: 'orderadmin', name: 'AdminOrderadmin', component: () => import('@/views/back/order/index.vue') },
      { path: 'bookpaihang', name: 'BookPaihangadmin', component: () => import('@/views/back/book/bookpaihang.vue') },
      { path: 'newbook', name: 'newbookadmin', component: () => import('@/views/back/book/newbook.vue') },
        { path: 'huodongzx', name: 'huodongzxadmin', component: () => import('@/views/back/huodongzx/huodongzx.vue') },
    ]
  },
  { path: '/seller', name: 'SellerCenter', component: () => import('@/views/seller/index.vue'), meta: { requiresAuth: true } },
  { path: '/404', name: 'NotFound', component: () => import('@/views/404.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/404' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const userRole = userStore.user?.role || 'buyer'

  if (to.path === '/home') {
    if (!userStore.isLogin) return next()
    if (userRole === 'buyer') return next()
    if (userRole === 'seller') { ElMessage.info('已为您跳转至卖家页面'); return next('/seller') }
    if (userRole === 'admin') { ElMessage.info('已为您跳转至管理页面'); return next('/admin') }
  }

  if ((to.path === '/login' || to.path === '/register') && userStore.isLogin) {
    if (userRole === 'seller') return next('/user')
    if (userRole === 'admin') return next('/admin')
    return next('/home')
  }

  if (to.meta.requiresAuth) {
    if (!userStore.isLogin) { ElMessage.warning('请先登录'); return next('/login') }
    if (to.meta.requiresAdmin && userRole !== 'admin') { ElMessage.error('无管理员权限'); return next('/home') }
  }

  next()
})

export default router