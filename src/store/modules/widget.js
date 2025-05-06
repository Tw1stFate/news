import WidgetRegistry from '@/services/widget-registry';

// 栏目样式管理模块
const state = {
  widgets: []
};

const mutations = {
  SET_WIDGETS(state, widgets) {
    state.widgets = widgets;
  },
  CLEAR_WIDGETS(state) {
    state.widgets = [];
  }
};

const actions = {
  fetchWidgets({ commit, state }) {
    return new Promise(resolve => {
      // 如果已经有数据，直接返回
      if (state.widgets.length > 0) {
        resolve(state.widgets);
        return;
      }
      
      // 加载预设的栏目样式
      const defaultWidgets = WidgetRegistry.getDefaultWidgets();
      commit('SET_WIDGETS', defaultWidgets);
      resolve(defaultWidgets);
    });
  },
  clearWidgets({ commit }) {
    commit('CLEAR_WIDGETS');
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}; 