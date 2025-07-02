import { createApp } from 'vue'
//import App from './App.vue'
import Ass from './Ass.vue'
createApp(Ass).use(router)
//createApp(App).mount('#app')
createApp(Ass).mount('#ass')
import router from './router' // 引入路由实例
import jp from '../coma/jp.vue'
createApp(Ass)
  .use(router) // 使用路由
  .mount('#ass') // 挂载应用
// 关键！注入路由
jp.use(router)
const ass = createApp(Ass)
// 挂载路由
ass.use(router)
// 可选：挂载 Pinia（用于管理登录状态）
// 挂载到 DOM
ass.mount('#ass')
