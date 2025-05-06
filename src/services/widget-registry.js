import CarouselWidget1 from '@/components/widgets/CarouselWidget1.vue';
import CarouselWidget2 from '@/components/widgets/CarouselWidget2.vue';
import CarouselWidget3 from '@/components/widgets/CarouselWidget3.vue';
import HeadlineWidget from '@/components/widgets/HeadlineWidget.vue';
import NewsListWidget from '@/components/widgets/NewsListWidget.vue';
import NewsListWidget1 from '@/components/widgets/NewsListWidget1.vue';
import ImageNewsWidget from '@/components/widgets/ImageNewsWidget.vue';
import HotNewsWidget from '@/components/widgets/HotNewsWidget.vue';

// mock 数据
const carouselData = [
  {
    id: 1,
    title: '中国航天事业取得重大突破',
    image: 'https://picsum.photos/800/400?random=1',
    thumbnail: 'https://picsum.photos/800/400?random=1&w=120&h=80',
    date: '2024-01-15',
    link: '#'
  },
  {
    id: 2,
    title: '第二届数字中国建设峰会开幕',
    image: 'https://picsum.photos/800/400?random=2',
    thumbnail: 'https://picsum.photos/800/400?random=2&w=120&h=80',
    date: '2024-01-15',
    link: '#'
  },
  {
    id: 3,
    title: '2023世界互联网大会举行',
    image: 'https://picsum.photos/800/400?random=3',
    thumbnail: 'https://picsum.photos/800/400?random=3&w=120&h=80',
    date: '2024-01-15',
    link: '#'
  },
  {
    id: 4,
    title: '科技创新助力经济高质量发展',
    image: 'https://picsum.photos/800/400?random=4',
    thumbnail: 'https://picsum.photos/800/400?random=4&w=120&h=80',
    date: '2024-01-15',
    link: '#'
  },
  {
    id: 5,
    title: '新能源汽车产业蓬勃发展',
    image: 'https://picsum.photos/800/400?random=5',
    thumbnail: 'https://picsum.photos/800/400?random=5&w=120&h=80',
    date: '2024-01-15',
    link: '#'
  }
];

const mockData = {
  carousel: carouselData,
  headline: carouselData[0],
  newsList: carouselData,
  imageNews: carouselData,
  hotNews: carouselData
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
      items: mockData.carousel
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
      items: mockData.carousel
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
      items: mockData.carousel
    }
  },
  headline: {
    name: '头条新闻',
    icon: 'el-icon-news',
    component: HeadlineWidget,
    defaultConfig: {
      titleStyle: 'large',
      ...mockData.headline
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
      items: mockData.newsList
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
      items: mockData.newsList
    }
  },
  'image-news': {
    name: '图片新闻',
    icon: 'el-icon-picture-outline',
    component: ImageNewsWidget,
    defaultConfig: {
      layout: 'grid',
      count: 6,
      items: mockData.imageNews
    }
  },
  'hot-news': {
    name: '热点排行',
    icon: 'el-icon-trophy',
    component: HotNewsWidget,
    defaultConfig: {
      count: 10,
      showNumber: true,
      items: mockData.hotNews
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
    config: {
      height: 300,
      autoplay: true,
      interval: 5000,
      indicatorPosition: 'bottom-left',
      activeIndicatorWidth: 20,
      showTitle: true,
      titlePosition: 'bottom-right',
      items: mockData.carousel
    }
  },
  {
    id: 'carousel-2',
    name: '轮播图样式2',
    type: 'carousel-2',
    description: '手动切换，缩略图导航',
    config: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showTitle: true,
      items: mockData.carousel
    }
  },
  {
    id: 'carousel-3',
    name: '轮播图样式3',
    type: 'carousel-3',
    description: '左图右文，标题列表',
    config: {
      height: 360,
      autoplay: true,
      interval: 5000,
      showDate: true,
      items: mockData.carousel
    }
  },
  {
    id: 'news-list-1',
    name: '列表样式1',
    type: 'news-list-1',
    description: '带项目符号的标题列表',
    config: {
      height: 400,
      title: '党建引领',
      count: 6,
      showDate: true,
      items: mockData.newsList
    }
  },
  {
    id: 'news-list-2',
    name: '列表样式2',
    type: 'news-list',
    description: '图文混排列表',
    config: {
      height: 400,
      titleStyle: 'medium',
      count: 10,
      showImage: true,
      items: mockData.newsList
    }
  },
  {
    id: 'news-list-3',
    name: '列表样式3',
    type: 'news-list',
    description: '纯文字列表',
    config: {
      height: 360,
      titleStyle: 'medium',
      count: 8,
      showImage: false,
      items: mockData.newsList
    }
  },
  {
    id: 'image-news-1',
    name: '图片样式1',
    type: 'image-news',
    description: '网格布局',
    config: {
      height: 360,
      layout: 'grid',
      count: 6,
      items: mockData.imageNews
    }
  },
  {
    id: 'image-news-2',
    name: '图片样式2',
    type: 'image-news',
    description: '瀑布流布局',
    config: {
      height: 400,
      layout: 'waterfall',
      count: 6,
      items: mockData.imageNews
    }
  },
  {
    id: 'hot-news-1',
    name: '排行样式1',
    type: 'hot-news',
    description: '带序号排行',
    config: {
      height: 360,
      count: 10,
      showNumber: true,
      items: mockData.hotNews
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

  register(type, config) {
    if (!type || !config) {
      throw new Error('Type and config are required for registration');
    }
    this.types[type] = config;
  }
}

// 导出单例实例
export default new WidgetRegistry(); 