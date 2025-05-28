/* eslint-disable no-unused-vars */
import CarouselWidget1 from '../widgets/CarouselWidget1.vue';
import CarouselWidget2 from '../widgets/CarouselWidget2.vue';
import CarouselWidget3 from '../widgets/CarouselWidget3.vue';
import NewsListWidget1 from '../widgets/NewsListWidget1.vue';
import NewsListWidget2 from '../widgets/NewsListWidget2.vue';
import NewsListWidget3 from '../widgets/NewsListWidget3.vue';
import ImageNewsWidget from '../widgets/ImageNewsWidget.vue';
import NavBarWidget from '../widgets/NavBarWidget.vue';

// 组件分类常量
export const WIDGET_CATEGORIES = {
  CAROUSEL: '轮播图',
  NEWS_LIST: '新闻列表',
  IMAGE_NEWS: '图片新闻',
  RANKING: '排行榜',
  NAV_BAR: '导航栏',
  OTHER: '其他组件'
};

// 注册组件类型
const widgetTypes = {
  'carousel-1': {
    name: '轮播图样式1',
    component: CarouselWidget1,
    defaultConfig: {
      height: 300,
      autoplay: true,
      interval: 5000,
      indicatorPosition: 'bottom-left',
      activeIndicatorWidth: 20,
      showTitle: true,
      titlePosition: 'bottom-right',
      categoryId: '', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    },
    description: '自动播放大图展示',
    category: WIDGET_CATEGORIES.CAROUSEL
  },
  'carousel-2': {
    name: '轮播图样式2',
    component: CarouselWidget2,
    defaultConfig: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showTitle: true,
      categoryId: '', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    },
    description: '手动切换，缩略图导航',
    category: WIDGET_CATEGORIES.CAROUSEL
  },
  'carousel-3': {
    name: '轮播图样式3',
    component: CarouselWidget3,
    defaultConfig: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showDate: true,
      categoryId: '', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    },
    description: '左图右文，标题列表',
    category: WIDGET_CATEGORIES.CAROUSEL
  },
  'news-list-1': {
    name: '列表样式1',
    component: NewsListWidget1,
    defaultConfig: {
      height: 400,
      title: '党建引领',
      count: 6,
      showDate: true,
      categoryId: '',  // 关联栏目ID
      maxItems: 6              // 最大加载数量
    },
    description: '带项目符号的标题列表',
    category: WIDGET_CATEGORIES.NEWS_LIST
  },
  'news-list-2': {
    name: '列表样式2',
    component: NewsListWidget2,
    defaultConfig: {
      height: 330,
      title: '行务要闻',
      count: 7,
      showDate: true,
      categoryId: '',  // 关联栏目ID
      maxItems: 7              // 最大加载数量
    },
    description: '简洁标题日期列表',
    category: WIDGET_CATEGORIES.NEWS_LIST
  },
  'news-list-3': {
    name: '列表样式3',
    component: NewsListWidget3,
    defaultConfig: {
      height: 400,
      title: '双轻业务',
      count: 4,
      categoryId: '',   // 关联栏目ID
      maxItems: 4              // 最大加载数量
    },
    description: '图文列表',
    category: WIDGET_CATEGORIES.NEWS_LIST
  },
  'image-news': {
    name: '图片新闻',
    component: ImageNewsWidget,
    defaultConfig: {
      layout: 'grid',
      count: 6,
      categoryId: '',  // 关联栏目ID
      maxItems: 6               // 最大加载数量
    },
    description: '网格布局',
    category: WIDGET_CATEGORIES.IMAGE_NEWS
  },
  'nav-bar': {
    name: '导航栏',
    component: NavBarWidget,
    defaultConfig: {
      logoUrl: 'https://picsum.photos/200/60?random=1',
      showSearch: true,
      menuItems: [
        { label: '集团门户', url: 'https://www.example.com/group', target: '_blank', active: false },
        { label: '总行门户', url: '/', target: '_self', active: true },
        { label: '分行门户', dropdown: true, active: false },
        { label: '广议', url: 'https://www.example.com/guangyi', target: '_blank', active: false },
        { label: '采购公告', url: 'https://www.example.com/procurement', target: '_blank', active: false }
      ]
    },
    description: '导航栏样式1',
    category: WIDGET_CATEGORIES.NAV_BAR
  }
};

class WidgetRegistry {
  constructor() {
    this.types = widgetTypes;
  }

  getTypes() {
    return Object.entries(this.types).map(([type, config]) => ({
      type,
      name: config.name
    }));
  }

  get(type) {
    return this.types[type]?.component;
  }

  getDefaultConfig(type) {
    return this.types[type]?.defaultConfig || {};
  }

  getDefaultWidgets() {
    // 直接从widgetTypes生成组件列表
    return Object.entries(this.types).map(([type, config]) => ({
      name: config.name,
      type: type,
      description: config.description || '暂无描述',
      category: config.category || WIDGET_CATEGORIES.OTHER,
      config: {...config.defaultConfig}
    }));
  }

  getCategories() {
    // 返回所有预定义的组件分类
    return Object.values(WIDGET_CATEGORIES);
  }

  register(type, config) {
    if (!type || !config) {
      throw new Error('Type and config are required for registration');
    }
    this.types[type] = config;
  }
}

// 导出单例实例
export default new WidgetRegistry(); 