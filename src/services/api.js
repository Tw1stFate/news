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
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
const mockHotNews = mockNewsData.general.slice(0, 10).map(news => ({
  ...news,
  views: Math.floor(Math.random() * 10000)
})).sort((a, b) => b.views - a.views);

// 模拟API服务
const api = {
  /**
   * 获取分行列表
   * @returns {Promise<Array>}
   */
  getBranchList() {
    // 模拟延迟
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: '北京分行', code: 'bj' },
          { id: 2, name: '上海分行', code: 'sh' },
          { id: 3, name: '广州分行', code: 'gz' },
          { id: 4, name: '深圳分行', code: 'sz' },
          { id: 5, name: '成都分行', code: 'cd' },
          { id: 6, name: '重庆分行', code: 'cq' },
          { id: 7, name: '杭州分行', code: 'hz' },
          { id: 8, name: '南京分行', code: 'nj' },
          { id: 9, name: '武汉分行', code: 'wh' },
          { id: 10, name: '西安分行', code: 'xa' },
          { id: 11, name: '长沙分行', code: 'cs' },
          { id: 12, name: '天津分行', code: 'tj' },
          { id: 13, name: '青岛分行', code: 'qd' },
          { id: 14, name: '大连分行', code: 'dl' },
          { id: 15, name: '苏州分行', code: 'sz' },
          { id: 16, name: '宁波分行', code: 'nb' },
          { id: 17, name: '厦门分行', code: 'xm' },
          { id: 18, name: '郑州分行', code: 'zz' }
        ]);
      }, 300);
    });
  },

  /**
   * 搜索新闻
   * @param {string} keyword 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  searchNews(keyword) {
    // 模拟新闻数据
    const mockNewsData = [
      {
        id: 1,
        title: '我行推出全新数字人民币应用场景，加速普惠金融全面覆盖',
        summary: '近日，我行与多家机构联合举办数字人民币创新应用发布会，推出涵盖零售、教育、医疗等多个民生领域的创新场景，进一步促进数字人民币在普惠金融领域的深入应用。',
        category: '综合',
        date: '2023-09-15',
        image: 'https://img1.baidu.com/it/u=413643897,2396324771&fm=253&fmt=auto&app=138&f=JPEG?w=670&h=500',
        views: 12800,
        link: 'https://example.com/news/1'
      },
      {
        id: 2,
        title: '第四届金融科技创新大赛圆满落幕，我行获多项荣誉',
        summary: '本届大赛以"科技赋能金融，创新驱动发展"为主题，吸引了来自全国各大金融机构和科技企业的500余支队伍参赛。我行凭借区块链供应链金融平台和智能风控系统两个项目分别斩获一等奖和优秀创新奖。',
        category: '科技',
        date: '2023-10-26',
        image: 'https://img2.baidu.com/it/u=2048195462,703560066&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800',
        views: 8500,
        link: 'https://example.com/news/2'
      },
      {
        id: 3,
        title: '我行成功发行100亿元绿色金融债券，助力碳达峰碳中和目标实现',
        summary: '本期绿色金融债券募集资金将专项用于支持节能环保、清洁能源等绿色产业项目，标志着我行在推动绿色金融发展和支持实体经济转型升级方面迈出了坚实一步。',
        category: '综合',
        date: '2023-08-30',
        image: 'https://img0.baidu.com/it/u=3258429127,359617615&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500',
        views: 6300,
        link: 'https://example.com/news/3'
      },
      {
        id: 4,
        title: '我行携手科技巨头构建开放银行生态，推动API经济发展',
        summary: '通过开放银行战略，我行将核心金融能力以API形式向外部合作伙伴开放，已累计上线超过200个API接口，合作伙伴达350家，服务场景覆盖零售、对公、同业等多个业务领域。',
        category: '科技',
        date: '2023-11-12',
        image: 'https://img1.baidu.com/it/u=1051140174,3564208430&fm=253&fmt=auto&app=138&f=JPEG?w=640&h=427',
        views: 9700,
        link: 'https://example.com/news/4'
      },
      {
        id: 5,
        title: '我行成功举办首届乡村振兴金融服务论坛，助力农业现代化',
        summary: '论坛围绕"金融赋能乡村振兴"主题，探讨了金融支持乡村产业发展、农村基础设施建设和农村人居环境改善等议题，并现场发布了我行《乡村振兴金融服务行动计划》。',
        category: '综合',
        date: '2023-07-18',
        image: 'https://img0.baidu.com/it/u=505328752,2850724214&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800',
        views: 5400,
        link: 'https://example.com/news/5'
      },
      {
        id: 6,
        title: '我行与体育总局签署战略合作协议，全面支持体育强国建设',
        summary: '根据协议，我行将在赛事活动组织、体育产业发展、体育基础设施建设等方面提供全方位金融服务，助力提升我国体育综合实力和国际影响力。',
        category: '体育',
        date: '2023-09-05',
        image: 'https://img2.baidu.com/it/u=178567593,2732007837&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333',
        views: 4800,
        link: 'https://example.com/news/6'
      },
      {
        id: 7,
        title: '我行智慧银行旗舰店正式开业，开创金融服务新模式',
        summary: '该旗舰店融合了5G、人工智能、大数据等前沿技术，打造沉浸式金融服务体验，实现了从传统柜台模式向智能化、场景化、社交化转变，开创了实体网点转型的新模式。',
        category: '科技',
        date: '2023-10-08',
        image: 'https://img1.baidu.com/it/u=3652269958,3226044327&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=500',
        views: 11200,
        link: 'https://example.com/news/7'
      },
      {
        id: 8,
        title: '我行与文化和旅游部共建文旅金融服务平台，激活文旅消费潜力',
        summary: '平台将整合文旅资源与金融服务，为文旅企业和消费者提供定制化金融解决方案，助力打通文旅消费堵点，促进文旅产业高质量发展。',
        category: '娱乐',
        date: '2023-06-24',
        image: 'https://img1.baidu.com/it/u=3539872127,101372&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=300',
        views: 6700,
        link: 'https://example.com/news/8'
      },
      {
        id: 9,
        title: '我行举办"金融知识普及月"系列活动，提升公众金融素养',
        summary: '活动采用线上线下相结合的方式，通过短视频、公开课、互动游戏等多种形式，向公众普及投资理财、防范金融风险、个人信息保护等知识，受众超过500万人次。',
        category: '综合',
        date: '2023-09-28',
        image: '',
        views: 3900,
        link: 'https://example.com/news/9'
      },
      {
        id: 10,
        title: '我行推出"青年创业贷"，支持大学生创新创业',
        summary: '该产品针对在校及毕业5年内大学生创业者，提供最高300万元信用贷款支持，并配套创业辅导、资源对接等增值服务，助力青年人才创业梦想。',
        category: '综合',
        date: '2023-11-03',
        image: 'https://img2.baidu.com/it/u=2942499147,1926181103&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=333',
        views: 7500,
        link: 'https://example.com/news/10'
      },
      {
        id: 11,
        title: '"数字人民币+"征文大赛结果揭晓，创新应用场景备受关注',
        summary: '本次大赛收到来自全国各地的参赛作品2000余篇，内容涵盖数字人民币在民生、医疗、教育、交通等领域的创新应用场景构想，充分展现了数字货币的无限可能。',
        category: '科技',
        date: '2023-08-12',
        image: 'https://img0.baidu.com/it/u=3387875563,2806582845&fm=253&fmt=auto&app=120&f=JPEG?w=1422&h=800',
        views: 5100,
        link: 'https://example.com/news/11'
      },
      {
        id: 12,
        title: '我行赞助全国青少年足球锦标赛，助力青少年体育发展',
        summary: '本届锦标赛共吸引了来自全国各地的128支青少年足球队参赛，我行不仅提供赛事赞助，还为参赛球员提供专业培训和发展平台，促进青少年足球人才培养。',
        category: '体育',
        date: '2023-07-05',
        image: 'https://img0.baidu.com/it/u=2028095755,1133193045&fm=253&fmt=auto&app=138&f=JPEG?w=747&h=500',
        views: 4300,
        link: 'https://example.com/news/12'
      },
      {
        id: 13,
        title: '我行区块链技术在跨境贸易融资中的应用获国际认可',
        summary: '在最新一期全球区块链金融应用评估中，我行基于区块链的跨境贸易融资平台位列全球前三，该平台已累计处理跨境贸易融资业务5000余笔，交易金额超过100亿美元。',
        category: '科技',
        date: '2023-10-15',
        image: 'https://img1.baidu.com/it/u=2503022641,4067839&fm=253&fmt=auto&app=138&f=JPEG?w=706&h=500',
        views: 8900,
        link: 'https://example.com/news/13'
      },
      {
        id: 14,
        title: '我行与多家互联网平台合作推出"数字文娱卡"，打造文化消费新场景',
        summary: '"数字文娱卡"整合了音乐、影视、阅读、游戏等多个数字文娱平台的会员权益，消费者可享受一卡多权益的便捷服务，首发当日申请量突破10万张。',
        category: '娱乐',
        date: '2023-09-20',
        image: 'https://img0.baidu.com/it/u=1395980100,2747694771&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500',
        views: 7800,
        link: 'https://example.com/news/14'
      },
      {
        id: 15,
        title: '我行发布2023年三季度经营业绩，各项指标稳健增长',
        summary: '报告显示，截至第三季度末，我行总资产同比增长12.3%，营业收入同比增长8.7%，净利润同比增长7.5%，不良贷款率控制在1.2%以内，各项指标均好于市场预期。',
        category: '综合',
        date: '2023-10-30',
        image: '',
        views: 9500,
        link: 'https://example.com/news/15'
      }
    ];

    // 模拟搜索逻辑 - 根据关键词过滤
    return new Promise(resolve => {
      setTimeout(() => {
        if (!keyword || keyword.trim() === '') {
          resolve([]);
          return;
        }

        const lowerKeyword = keyword.toLowerCase();
        const results = mockNewsData.filter(item => {
          return item.title.toLowerCase().includes(lowerKeyword) || 
                 item.summary.toLowerCase().includes(lowerKeyword) ||
                 item.category.toLowerCase().includes(lowerKeyword);
        });

        resolve(results);
      }, 800); // 稍微延长搜索时间，模拟网络请求
    });
  }
};

export default api; 