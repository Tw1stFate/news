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
    // 简化后的数据处理 - 所有栏目都使用同一个数据源
    // 可以根据不同的栏目ID来随机排序或筛选数据，以模拟不同栏目的内容
    
    // 模拟API延迟
    return new Promise(resolve => {
      setTimeout(() => {
        // 随机打乱数组顺序，模拟不同栏目有不同内容
        const shuffled = columnId ? 
          [...mockNewsData].sort(() => 0.5 - Math.random()) : 
          mockNewsData;
        
        resolve(shuffled.slice(0, limit));
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