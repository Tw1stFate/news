// 新闻数据 - 简化为单一数组，不再区分栏目
export const mockNewsData = [
  { id: 1, title: '国家发布最新经济政策', image: 'https://picsum.photos/800/400?random=1', date: '2023-04-10', summary: '国务院发布关于促进经济健康发展的十条措施...' },
  { id: 2, title: '科学家发现新型清洁能源', image: 'https://picsum.photos/800/400?random=2', date: '2023-04-09', summary: '该能源可以大幅降低碳排放，为环保事业做出贡献...' },
  { id: 3, title: '国际贸易会议在京召开', image: 'https://picsum.photos/800/400?random=3', date: '2023-04-08', summary: '来自全球50个国家的代表参加了此次会议...' },
  { id: 4, title: '新冠疫苗研发取得重大突破', image: 'https://picsum.photos/800/400?random=4', date: '2023-04-07', summary: '新型疫苗对变异株也有很好的防护效果...' },
  { id: 5, title: '人工智能助力医疗诊断', image: 'https://picsum.photos/800/400?random=5', date: '2023-04-06', summary: 'AI技术在医疗领域的应用日益广泛...' },
  { id: 6, title: '量子计算研究取得突破性进展', image: 'https://picsum.photos/800/400?random=6', date: '2023-04-10', summary: '科学家成功实现了量子优越性...' },
  { id: 7, title: '新一代5G技术全面商用', image: 'https://picsum.photos/800/400?random=7', date: '2023-04-09', summary: '5G将为智能制造和物联网带来革命性变化...' },
  { id: 8, title: '国际电影节获奖名单公布', image: 'https://picsum.photos/800/400?random=8', date: '2023-04-10', summary: '中国电影《何处》获得最佳影片奖...' },
  { id: 9, title: '世界杯预选赛结果公布', image: 'https://picsum.photos/800/400?random=9', date: '2023-04-10', summary: '中国队以3:0战胜对手，取得小组赛首胜...' },
  { id: 10, title: '奥运会筹备工作进展顺利', image: 'https://picsum.photos/800/400?random=10', date: '2023-04-09', summary: '场馆建设已经完成90%...' }
];

// 栏目数据
export const mockColumns = [
  { id: 'headlines', name: '头条新闻' },
  { id: 'domestic', name: '国内新闻' },
  { id: 'international', name: '国际新闻' },
  { id: 'finance', name: '财经新闻' },
  { id: 'technology', name: '科技新闻' },
  { id: 'sports', name: '体育新闻' },
  { id: 'entertainment', name: '娱乐新闻' },
  { id: 'lifestyle', name: '生活资讯' },
  { id: 'culture', name: '文化教育' }
];

// 分行数据
export const mockBranchList = [
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
];

// 搜索新闻数据
export const mockSearchNews = [
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
  }
]; 