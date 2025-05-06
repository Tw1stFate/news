import Vue from 'vue';
import VueRouter from 'vue-router';
import LayoutEditor from '@/views/LayoutEditor.vue';
import WidgetManager from '@/views/WidgetManager.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/layout'
  },
  {
    path: '/layout',
    name: 'LayoutEditor',
    component: LayoutEditor,
    meta: {
      title: '新闻门户布局编辑器'
    }
  },
  {
    path: '/widgets',
    name: 'WidgetManager',
    component: WidgetManager,
    meta: {
      title: '栏目样式管理'
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '新闻门户系统';
  next();
});

export default router; 