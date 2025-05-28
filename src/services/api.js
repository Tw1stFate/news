import { mockNewsData, mockColumns, mockBranchList, mockSearchNews } from './mock';

// 模拟API服务
const api = {
  /**
   * 获取栏目列表
   * @returns {Promise<Array>} 栏目列表
   */
  getColumns() {
    // 模拟API延迟
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockColumns);
      }, 300);
    });
  },

  /**
   * 获取分行列表
   * @returns {Promise<Array>}
   */
  getBranchList() {
    // 模拟延迟
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockBranchList);
      }, 300);
    });
  },
  
  /**
   * 根据栏目ID获取新闻列表
   * @param {string} columnId 栏目ID
   * @param {number} limit 返回的新闻数量
   * @returns {Promise<Array>} 新闻列表
   */
  getNewsByColumn(columnId, limit = 5) {
    // 定义栏目ID与模拟数据的映射关系
    const columnMap = {
      'headlines': mockNewsData.general,
      'trending': mockNewsData.general.slice().sort(() => 0.5 - Math.random()), // 随机排序
      'social': mockNewsData.entertainment,
      'international': mockNewsData.general.slice(3, 7),
      'technology': mockNewsData.technology,
      'sports': mockNewsData.sports,
      'entertainment': mockNewsData.entertainment
    };
    
    // 获取对应栏目的数据，如果栏目不存在则返回通用新闻
    const newsData = columnMap[columnId] || mockNewsData.general;
    
    // 模拟API延迟
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(newsData.slice(0, limit));
      }, 300);
    });
  },
  
  /**
   * 搜索新闻
   * @param {string} keyword 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  searchNews(keyword) {
    // 模拟搜索逻辑 - 根据关键词过滤
    return new Promise(resolve => {
      setTimeout(() => {
        if (!keyword || keyword.trim() === '') {
          resolve([]);
          return;
        }

        const lowerKeyword = keyword.toLowerCase();
        const results = mockSearchNews.filter(item => {
          return item.title.toLowerCase().includes(lowerKeyword) || 
                 item.summary.toLowerCase().includes(lowerKeyword) ||
                 item.category.toLowerCase().includes(lowerKeyword);
        });

        resolve(results);
      }, 800); // 稍微延长搜索时间，模拟网络请求
    });
  },

  /**
   * 保存布局
   * @param {Object} data 布局数据
   * @returns {Promise<Object>}
   */
  saveLayout(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('保存布局数据:', data);
        resolve({ success: true });
      }, 500);
    });
  }
}; 

export default api; 