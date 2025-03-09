import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

import store from './store'

// ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
app.use(router).use(store).use(ElementPlus);

// 初始化主题
const theme = localStorage.getItem("theme") || 'light';
store.commit('theme/setTheme', theme);

app.mount('#app');
