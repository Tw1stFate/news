// import { v4 as uuidv4 } from 'uuid';

// 初始状态
const initialState = {
  layoutTree: null, // 布局树结构
  currentEditingWidget: null,
  availableWidgets: [
    { 
      type: 'headline', 
      name: '大标题', 
      icon: 'el-icon-document',
      defaultConfig: {
        title: '新闻标题',
        link: '#',
        styleType: 'default'
      }
    },
    { 
      type: 'news-list', 
      name: '新闻列表', 
      icon: 'el-icon-document-copy',
      defaultConfig: {
        title: '新闻列表',
        showImage: true,
        maxItems: 5,
        category: 'general'
      }
    },
    { 
      type: 'image-news', 
      name: '图文新闻', 
      icon: 'el-icon-picture',
      defaultConfig: {
        title: '图文新闻',
        imagePosition: 'left',
        description: true,
        category: 'general'
      }
    },
    { 
      type: 'carousel', 
      name: '轮播图', 
      icon: 'el-icon-picture-outline-round',
      defaultConfig: {
        autoplay: true,
        interval: 3000,
        items: []
      }
    },
    { 
      type: 'hot-news', 
      name: '热门新闻', 
      icon: 'el-icon-star-on',
      defaultConfig: {
        title: '热门新闻',
        maxItems: 10,
        period: 'day'
      }
    }
  ]
};

// 获取组件默认配置 - 保留作为将来可能使用
// const getWidgetDefaultConfig = (state, type) => {
//   const widget = state.availableWidgets.find(w => w.type === type);
//   return widget ? { ...widget.defaultConfig } : {};
// };

const state = { ...initialState };

const getters = {
  layoutTree: state => state.layoutTree,
  getAvailableWidgets: state => state.availableWidgets,
  getCurrentEditingWidget: state => state.currentEditingWidget
};

const actions = {
  // 保存布局树
  saveLayoutTree({ commit }, layoutTree) {
    commit('SAVE_LAYOUT_TREE', layoutTree);
    
    // 保存到本地存储，确保页面刷新后仍能恢复
    try {
      if (layoutTree) {
        localStorage.setItem('newsPortalLayoutTree', JSON.stringify(layoutTree));
      } else {
        localStorage.removeItem('newsPortalLayoutTree');
      }
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  },
  
  // 加载布局树
  loadLayoutTree({ commit }) {
    return new Promise(resolve => {
      try {
        const savedLayout = localStorage.getItem('newsPortalLayoutTree');
        if (savedLayout) {
          const layoutTree = JSON.parse(savedLayout);
          commit('SAVE_LAYOUT_TREE', layoutTree);
          resolve(layoutTree);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Failed to load layout from localStorage:', error);
        resolve(null);
      }
    });
  },
  
  // 设置当前正在编辑的组件
  setCurrentEditingWidget({ commit }, widget) {
    commit('SET_CURRENT_EDITING_WIDGET', widget);
  }
};

const mutations = {
  SAVE_LAYOUT_TREE(state, layoutTree) {
    state.layoutTree = layoutTree;
  },
  
  SET_CURRENT_EDITING_WIDGET(state, widget) {
    state.currentEditingWidget = widget;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 