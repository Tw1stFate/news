//import axios from 'axios';

// 这里我们使用 mock 数据，实际项目中会连接到真实后端
const mockNewsData = {
  general: [
    { id: 1, title: '国家发布最新经济政策', image: 'https://picsum.photos/200/120?random=1', date: '2023-04-10', summary: '国务院发布关于促进经济健康发展的十条措施...' },
    { id: 2, title: '科学家发现新型清洁能源', image: 'https://picsum.photos/200/120?random=2', date: '2023-04-09', summary: '该能源可以大幅降低碳排放，为环保事业做出贡献...' },
    { id: 3, title: '国际贸易会议在京召开', image: 'https://picsum.photos/200/120?random=3', date: '2023-04-08', summary: '来自全球50个国家的代表参加了此次会议...' },
    { id: 4, title: '新冠疫苗研发取得重大突破', image: 'https://picsum.photos/200/120?random=4', date: '2023-04-07', summary: '新型疫苗对变异株也有很好的防护效果...' },
    { id: 5, title: '人工智能助力医疗诊断', image: 'https://picsum.photos/200/120?random=5', date: '2023-04-06', summary: 'AI技术在医疗领域的应用日益广泛...' },
    { id: 6, title: '全国教育改革进入新阶段', image: 'https://picsum.photos/200/120?random=6', date: '2023-04-05', summary: '教育部推出新的教育评价体系...' },
    { id: 7, title: '我国首艘国产航母完成海试', image: 'https://picsum.photos/200/120?random=7', date: '2023-04-04', summary: '标志着我国海军建设迈上新台阶...' }
  ],
  technology: [
    { id: 8, title: '量子计算研究取得突破性进展', image: 'https://picsum.photos/200/120?random=8', date: '2023-04-10', summary: '科学家成功实现了量子优越性...' },
    { id: 9, title: '新一代5G技术全面商用', image: 'https://picsum.photos/200/120?random=9', date: '2023-04-09', summary: '5G将为智能制造和物联网带来革命性变化...' },
    { id: 10, title: 'AI芯片性能提升三倍', image: 'https://picsum.photos/200/120?random=10', date: '2023-04-08', summary: '新型AI芯片在保持功耗的同时性能大幅提升...' },
    { id: 11, title: 'VR技术在教育中的应用', image: 'https://picsum.photos/200/120?random=11', date: '2023-04-07', summary: '虚拟现实技术让课堂教学更加生动直观...' },
    { id: 12, title: '区块链技术在供应链中的应用', image: 'https://picsum.photos/200/120?random=12', date: '2023-04-06', summary: '提高了供应链的透明度和效率...' }
  ],
  entertainment: [
    { id: 13, title: '国际电影节获奖名单公布', image: 'https://picsum.photos/200/120?random=13', date: '2023-04-10', summary: '中国电影《何处》获得最佳影片奖...' },
    { id: 14, title: '著名音乐人发布新专辑', image: 'https://picsum.photos/200/120?random=14', date: '2023-04-09', summary: '这张专辑融合了传统音乐和现代元素...' },
    { id: 15, title: '电视剧《春天》收视率创新高', image: 'https://picsum.photos/200/120?random=15', date: '2023-04-08', summary: '该剧讲述了普通人的奋斗故事...' },
    { id: 16, title: '网络文学IP改编热潮', image: 'https://picsum.photos/200/120?random=16', date: '2023-04-07', summary: '越来越多的网络小说被改编成影视作品...' }
  ],
  sports: [
    { id: 17, title: '世界杯预选赛结果公布', image: 'https://picsum.photos/200/120?random=17', date: '2023-04-10', summary: '中国队以3:0战胜对手，取得小组赛首胜...' },
    { id: 18, title: '奥运会筹备工作进展顺利', image: 'https://picsum.photos/200/120?random=18', date: '2023-04-09', summary: '场馆建设已经完成90%...' },
    { id: 19, title: '著名运动员宣布退役', image: 'https://picsum.photos/200/120?random=19', date: '2023-04-08', summary: '这位运动员在20年的职业生涯中获得了众多荣誉...' },
    { id: 20, title: '青少年体育教育受关注', image: 'https://picsum.photos/200/120?random=20', date: '2023-04-07', summary: '国家出台政策鼓励青少年参与体育活动...' }
  ]
};

// 模拟的布局数据
const mockLayoutData = {
  id: 'default',
  name: '默认布局',
  layout: {
    rows: [
      {
        id: '1',
        columns: [
          {
            id: '1-1',
            span: 24,
            widgets: [
              {
                id: '1-1-1',
                type: 'headline',
                config: {
                  title: '新闻头条',
                  link: '#',
                  styleType: 'primary'
                }
              }
            ]
          }
        ]
      },
      {
        id: '2',
        columns: [
          {
            id: '2-1',
            span: 16,
            widgets: [
              {
                id: '2-1-1',
                type: 'carousel',
                config: {
                  autoplay: true,
                  interval: 3000,
                  items: [
                    { id: 1, title: '重大新闻一', image: 'https://picsum.photos/800/400?random=1', link: '#' },
                    { id: 2, title: '重大新闻二', image: 'https://picsum.photos/800/400?random=2', link: '#' },
                    { id: 3, title: '重大新闻三', image: 'https://picsum.photos/800/400?random=3', link: '#' }
                  ]
                }
              }
            ]
          },
          {
            id: '2-2',
            span: 8,
            widgets: [
              {
                id: '2-2-1',
                type: 'hot-news',
                config: {
                  title: '热门新闻',
                  maxItems: 8,
                  period: 'day'
                }
              }
            ]
          }
        ]
      },
      {
        id: '3',
        columns: [
          {
            id: '3-1',
            span: 8,
            widgets: [
              {
                id: '3-1-1',
                type: 'news-list',
                config: {
                  title: '科技新闻',
                  showImage: true,
                  maxItems: 4,
                  category: 'technology'
                }
              }
            ]
          },
          {
            id: '3-2',
            span: 8,
            widgets: [
              {
                id: '3-2-1',
                type: 'news-list',
                config: {
                  title: '娱乐新闻',
                  showImage: true,
                  maxItems: 4,
                  category: 'entertainment'
                }
              }
            ]
          },
          {
            id: '3-3',
            span: 8,
            widgets: [
              {
                id: '3-3-1',
                type: 'news-list',
                config: {
                  title: '体育新闻',
                  showImage: true,
                  maxItems: 4,
                  category: 'sports'
                }
              }
            ]
          }
        ]
      }
    ]
  }
};

// 模拟的热门新闻数据
const mockHotNews = mockNewsData.general.slice(0, 10).map(news => ({
  ...news,
  views: Math.floor(Math.random() * 10000)
})).sort((a, b) => b.views - a.views);

export default {
  // 获取所有可用的布局
  getLayouts() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'default', name: '默认布局' },
          { id: 'simple', name: '简洁布局' }
        ]);
      }, 300);
    });
  },
  
  // 获取指定布局的详细配置
  getLayoutById(/* id */) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockLayoutData);
      }, 300);
    });
  },
  
  // 保存布局
  saveLayout(layout) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('保存布局:', layout);
        resolve({ success: true, message: '保存成功' });
      }, 300);
    });
  },
  
  // 获取新闻数据
  getNewsByCategory(category, limit = 10) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (category === 'hot') {
          resolve(mockHotNews.slice(0, limit));
        } else {
          const news = mockNewsData[category] || mockNewsData.general;
          resolve(news.slice(0, limit));
        }
      }, 300);
    });
  }
}; 