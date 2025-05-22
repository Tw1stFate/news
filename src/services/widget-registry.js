/* eslint-disable no-unused-vars */
import CarouselWidget1 from '@/components/widgets/CarouselWidget1.vue';
import CarouselWidget2 from '@/components/widgets/CarouselWidget2.vue';
import CarouselWidget3 from '@/components/widgets/CarouselWidget3.vue';
import HeadlineWidget from '@/components/widgets/HeadlineWidget.vue';
import NewsListWidget from '@/components/widgets/NewsListWidget.vue';
import NewsListWidget1 from '@/components/widgets/NewsListWidget1.vue';
import NewsListWidget2 from '@/components/widgets/NewsListWidget2.vue';
import NewsListWidget3 from '@/components/widgets/NewsListWidget3.vue';
import ImageNewsWidget from '@/components/widgets/ImageNewsWidget.vue';
import HotNewsWidget from '@/components/widgets/HotNewsWidget.vue';
import NavBarWidget from '@/components/widgets/NavBarWidget.vue';

// mock 数据
const carouselData = [
  {
    id: 1,
    title: '中国航天事业取得重大突破',
    image: 'https://picsum.photos/800/400?random=1',
    thumbnail: 'https://picsum.photos/800/400?random=1&w=120&h=80',
    date: '2024-01-15',
    link: '#',
    summary: '近日，我国航天事业再次取得重大突破，成功发射新一代运载火箭，这将为我国空间站计划提供有力支持。'
  },
  {
    id: 2,
    title: '第二届数字中国建设峰会开幕',
    image: 'https://picsum.photos/800/400?random=2',
    thumbnail: 'https://picsum.photos/800/400?random=2&w=120&h=80',
    date: '2024-01-15',
    link: '#',
    summary: '第二届数字中国建设峰会在福建福州开幕，来自全国各地的专家学者和企业家共同探讨数字经济发展前景。'
  },
  {
    id: 3,
    title: '2023世界互联网大会举行',
    image: 'https://picsum.photos/800/400?random=3',
    thumbnail: 'https://picsum.photos/800/400?random=3&w=120&h=80',
    date: '2024-01-15',
    link: '#',
    summary: '以"数字赋能未来，合作创造机遇"为主题的2023世界互联网大会在浙江乌镇举行，聚焦全球数字合作。'
  },
  {
    id: 4,
    title: '科技创新助力经济高质量发展',
    image: 'https://picsum.photos/800/400?random=4',
    thumbnail: 'https://picsum.photos/800/400?random=4&w=120&h=80',
    date: '2024-01-15',
    link: '#',
    summary: '国务院发布《关于促进科技创新支撑引领经济高质量发展的若干政策措施》，从多个方面支持科技创新。'
  },
  {
    id: 5,
    title: '新能源汽车产业蓬勃发展',
    image: 'https://picsum.photos/800/400?random=5',
    thumbnail: 'https://picsum.photos/800/400?random=5&w=120&h=80',
    date: '2024-01-15',
    link: '#',
    summary: '截至2023年底，我国新能源汽车保有量超过1300万辆，产业链各环节技术水平显著提升，市场竞争力不断增强。'
  }
];

// 导航栏数据
const navBarData = {
  menuItems: [
    { label: '集团门户', url: 'https://www.example.com/group', target: '_blank', active: false },
    { label: '总行门户', url: '/', target: '_self', active: true },
    { label: '分行门户', dropdown: true, active: false },
    { label: '广议', url: 'https://www.example.com/guangyi', target: '_blank', active: false },
    { label: '采购公告', url: 'https://www.example.com/procurement', target: '_blank', active: false }
  ]
};

const mockData = {
  carousel: carouselData,
  headline: carouselData[0],
  newsList: carouselData,
  imageNews: carouselData,
  hotNews: carouselData,
  navBar: navBarData
};

// 注册组件类型
const widgetTypes = {
  'carousel-1': {
    name: '轮播图样式1',
    icon: 'el-icon-picture',
    component: CarouselWidget1,
    defaultConfig: {
      height: 300,
      autoplay: true,
      interval: 5000,
      indicatorPosition: 'bottom-left',
      activeIndicatorWidth: 20,
      showTitle: true,
      titlePosition: 'bottom-right',
      categoryId: 'headlines', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    }
  },
  'carousel-2': {
    name: '轮播图样式2',
    icon: 'el-icon-picture',
    component: CarouselWidget2,
    defaultConfig: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showTitle: true,
      categoryId: 'headlines', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    }
  },
  'carousel-3': {
    name: '轮播图样式3',
    icon: 'el-icon-picture',
    component: CarouselWidget3,
    defaultConfig: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showDate: true,
      categoryId: 'headlines', // 关联栏目ID
      maxItems: 5              // 最大加载数量
    }
  },
  headline: {
    name: '头条新闻',
    icon: 'el-icon-news',
    component: HeadlineWidget,
    defaultConfig: {
      titleStyle: 'large',
      categoryId: 'headlines', // 关联栏目ID
      maxItems: 1              // 仅显示一条
    }
  },
  'news-list': {
    name: '新闻列表',
    icon: 'el-icon-document',
    component: NewsListWidget,
    defaultConfig: {
      titleStyle: 'medium',
      count: 10,
      showImage: true,
      categoryId: 'general',   // 关联栏目ID
      maxItems: 10             // 最大加载数量
    }
  },
  'news-list-1': {
    name: '列表样式1',
    icon: 'el-icon-document',
    component: NewsListWidget1,
    defaultConfig: {
      height: 400,
      title: '党建引领',
      count: 6,
      showDate: true,
      categoryId: 'domestic',  // 关联栏目ID
      maxItems: 6              // 最大加载数量
    }
  },
  'news-list-2': {
    name: '列表样式2',
    icon: 'el-icon-document',
    component: NewsListWidget2,
    defaultConfig: {
      height: 330,
      title: '行务要闻',
      count: 7,
      showDate: true,
      categoryId: 'domestic',  // 关联栏目ID
      maxItems: 7              // 最大加载数量
    }
  },
  'news-list-3': {
    name: '列表样式3',
    icon: 'el-icon-document',
    component: NewsListWidget3,
    defaultConfig: {
      height: 400,
      title: '双轻业务',
      count: 4,
      categoryId: 'finance',   // 关联栏目ID
      maxItems: 4              // 最大加载数量
    }
  },
  'news-list-4': {
    name: '列表样式4',
    icon: 'el-icon-document',
    component: NewsListWidget,
    defaultConfig: {
      height: 400,
      titleStyle: 'medium',
      count: 10,
      showImage: true,
      categoryId: 'technology', // 关联栏目ID
      maxItems: 10              // 最大加载数量
    }
  },
  'news-list-5': {
    name: '列表样式5',
    icon: 'el-icon-document',
    component: NewsListWidget,
    defaultConfig: {
      height: 360,
      titleStyle: 'medium',
      count: 8,
      showImage: false,
      categoryId: 'international', // 关联栏目ID
      maxItems: 8                  // 最大加载数量
    }
  },
  'image-news': {
    name: '图片新闻',
    icon: 'el-icon-picture-outline',
    component: ImageNewsWidget,
    defaultConfig: {
      layout: 'grid',
      count: 6,
      categoryId: 'lifestyle',  // 关联栏目ID
      maxItems: 6               // 最大加载数量
    }
  },
  'hot-news': {
    name: '热点排行',
    icon: 'el-icon-trophy',
    component: HotNewsWidget,
    defaultConfig: {
      count: 10,
      showNumber: true,
      period: 'day',           // 时间周期：day, week, month
      categoryId: 'hot',       // 关联栏目ID
      maxItems: 10             // 最大加载数量
    }
  },
  'nav-bar': {
    name: '导航栏',
    icon: 'el-icon-menu',
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
    }
  }
};

// 预设的栏目样式
const defaultWidgets = [
  {
    id: 'carousel-1',
    name: '轮播图样式1',
    type: 'carousel-1',
    description: '自动播放大图展示',
    category: '轮播图',
    config: {
      height: 300,
      autoplay: true,
      interval: 5000,
      indicatorPosition: 'bottom-left',
      activeIndicatorWidth: 20,
      showTitle: true,
      titlePosition: 'bottom-right',
      categoryId: 'headlines',
      maxItems: 5
    }
  },
  {
    id: 'carousel-2',
    name: '轮播图样式2',
    type: 'carousel-2',
    description: '手动切换，缩略图导航',
    category: '轮播图',
    config: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showTitle: true,
      categoryId: 'headlines',
      maxItems: 5
    }
  },
  {
    id: 'carousel-3',
    name: '轮播图样式3',
    type: 'carousel-3',
    description: '左图右文，标题列表',
    category: '轮播图',
    config: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showDate: true,
      categoryId: 'headlines',
      maxItems: 5
    }
  },
  {
    id: 'news-list-1',
    name: '列表样式1',
    type: 'news-list-1',
    description: '带项目符号的标题列表',
    category: '新闻列表',
    config: {
      height: 400,
      title: '党建引领',
      count: 6,
      showDate: true,
      categoryId: 'domestic',
      maxItems: 6
    }
  },
  {
    id: 'news-list-2',
    name: '列表样式2',
    type: 'news-list-2',
    description: '简洁标题日期列表',
    category: '新闻列表',
    config: {
      height: 330,
      title: '行务要闻',
      count: 7,
      showDate: true,
      categoryId: 'domestic',
      maxItems: 7
    }
  },
  {
    id: 'news-list-3',
    name: '列表样式3',
    type: 'news-list-3',
    description: '图文列表',
    category: '新闻列表',
    config: {
      height: 400,
      title: '双轻业务',
      count: 4,
      categoryId: 'finance',
      maxItems: 4
    }
  },
  {
    id: 'news-list-4',
    name: '列表样式4',
    type: 'news-list',
    description: '图文混排列表',
    category: '新闻列表',
    config: {
      height: 400,
      titleStyle: 'medium',
      count: 10,
      showImage: true,
      categoryId: 'technology',
      maxItems: 10
    }
  },
  {
    id: 'news-list-5',
    name: '列表样式5',
    type: 'news-list',
    description: '纯文字列表',
    category: '新闻列表',
    config: {
      height: 360,
      titleStyle: 'medium',
      count: 8,
      showImage: false,
      categoryId: 'international',
      maxItems: 8
    }
  },
  {
    id: 'image-news-1',
    name: '图片样式1',
    type: 'image-news',
    description: '网格布局',
    category: '图片新闻',
    config: {
      height: 360,
      layout: 'grid',
      count: 6,
      categoryId: 'lifestyle',
      maxItems: 6
    }
  },
  {
    id: 'image-news-2',
    name: '图片样式2',
    type: 'image-news',
    description: '瀑布流布局',
    category: '图片新闻',
    config: {
      height: 400,
      layout: 'waterfall',
      count: 6,
      categoryId: 'culture',
      maxItems: 6
    }
  },
  {
    id: 'hot-news-1',
    name: '排行样式1',
    type: 'hot-news',
    description: '带序号排行',
    category: '排行榜',
    config: {
      height: 360,
      count: 10,
      showNumber: true,
      period: 'day',
      categoryId: 'hot',
      maxItems: 10
    }
  },
  {
    id: 'nav-bar-1',
    name: '导航栏样式1',
    type: 'nav-bar',
    description: '导航栏样式1',
    category: '导航栏',
    config: {
      logoUrl: 'https://picsum.photos/200/60?random=1',
      showSearch: true,
      menuItems: [
        { label: '集团门户', url: 'https://www.example.com/group', target: '_blank', active: false },
        { label: '总行门户', url: '/', target: '_self', active: true },
        { label: '分行门户', dropdown: true, active: false },
        { label: '广议', url: 'https://www.example.com/guangyi', target: '_blank', active: false },
        { label: '采购公告', url: 'https://www.example.com/procurement', target: '_blank', active: false }
      ]
    }
  }
];

class WidgetRegistry {
  constructor() {
    this.types = widgetTypes;
    this.defaultWidgets = defaultWidgets;
  }

  getTypes() {
    return Object.entries(this.types).map(([type, config]) => ({
      type,
      name: config.name,
      icon: config.icon
    }));
  }

  get(type) {
    return this.types[type]?.component;
  }

  getDefaultConfig(type) {
    return this.types[type]?.defaultConfig || {};
  }

  getDefaultWidgets() {
    return this.defaultWidgets;
  }

  getCategories() {
    // 组件分类
    return [
      '轮播图',
      '新闻列表',
      '图片新闻',
      '排行榜',
      '导航栏',
      '其他组件'
    ];
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