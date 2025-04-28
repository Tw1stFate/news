// src/main.js
import Vue from 'vue';
import App from './App.vue';
import store from './store'; // 引入 Vuex Store
import ElementUI from 'element-ui'; // 引入 Element UI
import 'element-ui/lib/theme-chalk/index.css'; // 引入 Element UI 样式

Vue.config.productionTip = false;

Vue.use(ElementUI); // 全局注册 Element UI

new Vue({
  store, // 把 store 挂载到 Vue 实例
  render: h => h(App),
}).$mount('#app');