import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/home.vue' // 确保路径正确
import dll from '../components/dll.vue' // 确保路径正确
import zhuce from '../components/zhuce.vue'
import jiaoche from '../coma/jiaoche.vue'
//import mading from '../components/mading.vue'
import denglucg from '../coma/denglucg.vue'
import zhucecg from '../coma/zhucecg.vue'
import ny from '../coma/ny.vue'
import jinpai from '../coma/jp.vue'
import maibahes480 from '../coma/mbh480.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/dll', component: dll },
    { path: '/zhuce', component: zhuce },
    //{ path: '/mading', component: Mading },
    { path: '/jiaoche', component: jiaoche },
    { path: '/denglucg', component: denglucg },
    { path: '/zhucecg', component: zhucecg },
    { path: '/ny', component: ny },
    { path: '/', component: '' },
    { path: '/jinpai', component: jinpai },
    { path: '/MaiBaHe|S480', component: maibahes480 },
  ],
})

//const TargetPage = () => import(/* webpackPrefetch: true */ '../coma/mbh480.vue')
const routes = [
  {
    path: '/MaiBaHe|S480',
    // 动态导入实现懒加载，打包时拆分为单独代码块
    component: () => import('../coma/mbh480.vue'),
  },
  {
    path: '',
    // 动态导入实现懒加载，打包时拆分为单独代码块
    //component: () => import(''),
  },
]
router.afterEach((to, from) => {
  // 解决滚动条不在顶部问题
  window.scrollTo({
    top: 0,
    //behavior: 'smooth', // 可选：平滑滚动，去掉则直接跳到顶部
  })
})

export default router
