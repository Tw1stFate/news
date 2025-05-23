// 栏目管理模块
const state = {
  columns: [
    { id: 'headlines', name: '头条新闻' },
    { id: 'domestic', name: '国内新闻' },
    { id: 'international', name: '国际新闻' },
    { id: 'finance', name: '财经新闻' },
    { id: 'technology', name: '科技新闻' },
    { id: 'sports', name: '体育新闻' },
    { id: 'entertainment', name: '娱乐新闻' },
    { id: 'lifestyle', name: '生活资讯' },
    { id: 'culture', name: '文化教育' }
  ],
  categories: [
    { id: 'headlines', name: '头条新闻' },
    { id: 'domestic', name: '国内新闻' },
    { id: 'international', name: '国际新闻' },
    { id: 'finance', name: '财经新闻' },
    { id: 'technology', name: '科技新闻' },
    { id: 'sports', name: '体育新闻' },
    { id: 'entertainment', name: '娱乐新闻' },
    { id: 'lifestyle', name: '生活资讯' },
    { id: 'culture', name: '文化教育' },
    { id: 'hot', name: '热门推荐' }
  ]
};

const mutations = {
  SET_COLUMNS(state, columns) {
    state.columns = columns;
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  }
};

const actions = {
  fetchColumns({ commit }) {
    // 模拟从API获取栏目信息
    // 在实际应用中，这里会调用API获取真实数据
    // 现在我们直接使用默认数据
    commit('SET_COLUMNS', state.columns);
  },
  fetchCategories({ commit }) {
    // 模拟从API获取分类信息
    // 在实际应用中，这里会调用API获取真实数据
    commit('SET_CATEGORIES', state.categories);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}; 