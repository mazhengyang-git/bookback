import { createApp } from 'vue'
//import App from './App.vue'
import Ass from './Ass.vue'
//createApp(App).mount('#app')
import router from './router' // 引入路由实例
import jp from '../coma/jp.vue'
import VueLazyload from 'vue-lazyload'
import loadingImage from '@img/hei.svg' // 确保此路径正确
import errorImage from '@img/dog1.jpg' // 确保此路径正确
// 创建单一应用实例
const ass = createApp(Ass)

// 统一注册插件
ass.use(router)

// 假设你有不同优先级的组件使用懒加载，这里分别注册不同配置
// 高优先级组件使用的懒加载配置

// 挂载应用
ass.mount('#ass')
