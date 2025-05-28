// 栏目管理模块
import api from '@/services/api';

const state = {
  columns: []
};

const mutations = {
  SET_COLUMNS(state, columns) {
    state.columns = columns;
  }
};

const actions = {
  async fetchColumns({ commit }) {
    try {
      // 通过API获取栏目数据
      const columns = await api.getColumns();
      commit('SET_COLUMNS', columns);
    } catch (error) {
      console.error('获取栏目数据失败:', error);
      // 如果API请求失败，使用默认数据
      commit('SET_COLUMNS', [
        { id: 'headlines', name: '头条新闻' },
        { id: 'domestic', name: '国内新闻' },
        { id: 'international', name: '国际新闻' },
        { id: 'finance', name: '财经新闻' },
        { id: 'technology', name: '科技新闻' },
        { id: 'sports', name: '体育新闻' },
        { id: 'entertainment', name: '娱乐新闻' },
        { id: 'lifestyle', name: '生活资讯' },
        { id: 'culture', name: '文化教育' }
      ]);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}; 