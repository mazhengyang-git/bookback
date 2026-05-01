import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//引入全局科幻样式
import '@/assets/css/global.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.directive('cloak', {
  mounted(el) {
    // TODO: 实现loading指令
    el.style.display = 'block'
  },
})
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
