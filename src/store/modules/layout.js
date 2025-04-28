import { v4 as uuidv4 } from 'uuid';

// 初始状态：一个空的布局配置
const initialState = {
  layout: {
    rows: [] // 行数组，每行包含列，每列包含组件
  },
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

// 获取组件默认配置
const getWidgetDefaultConfig = (state, type) => {
  const widget = state.availableWidgets.find(w => w.type === type);
  return widget ? { ...widget.defaultConfig } : {};
};

const state = { ...initialState };

const getters = {
  getLayout: state => state.layout,
  getAvailableWidgets: state => state.availableWidgets,
  getCurrentEditingWidget: state => state.currentEditingWidget
};

const actions = {
  // 添加一行
  addRow({ commit }) {
    commit('ADD_ROW');
  },
  
  // 添加一个组件到指定的列
  addWidget({ commit }, { rowIndex, colIndex, widgetType }) {
    commit('ADD_WIDGET', { rowIndex, colIndex, widgetType });
  },
  
  // 更新组件配置
  updateWidgetConfig({ commit }, { rowIndex, colIndex, widgetIndex, config }) {
    commit('UPDATE_WIDGET_CONFIG', { rowIndex, colIndex, widgetIndex, config });
  },
  
  // 删除组件
  deleteWidget({ commit }, { rowIndex, colIndex, widgetIndex }) {
    commit('DELETE_WIDGET', { rowIndex, colIndex, widgetIndex });
  },
  
  // 删除行
  deleteRow({ commit }, { rowIndex }) {
    commit('DELETE_ROW', { rowIndex });
  },
  
  // 设置当前正在编辑的组件
  setCurrentEditingWidget({ commit }, widget) {
    commit('SET_CURRENT_EDITING_WIDGET', widget);
  },
  
  // 保存整个布局
  saveLayout({ commit }, layout) {
    commit('SAVE_LAYOUT', layout);
  },
  
  // 重置布局为空
  resetLayout({ commit }) {
    commit('RESET_LAYOUT');
  }
};

const mutations = {
  ADD_ROW(state) {
    state.layout.rows.push({
      id: uuidv4(),
      columns: [
        {
          id: uuidv4(),
          span: 24, // 默认一列占满
          widgets: []
        }
      ]
    });
  },
  
  ADD_WIDGET(state, { rowIndex, colIndex, widgetType }) {
    console.log('ADD_WIDGET mutation called:', { rowIndex, colIndex, widgetType }); // 添加调试日志
    if (rowIndex >= 0 && rowIndex < state.layout.rows.length) {
      const row = state.layout.rows[rowIndex];
      if (colIndex >= 0 && colIndex < row.columns.length) {
        const column = row.columns[colIndex];
        if (!column.widgets) {
          column.widgets = [];
        }
        const defaultConfig = getWidgetDefaultConfig(state, widgetType);
        column.widgets.push({
          id: uuidv4(),
          type: widgetType,
          config: defaultConfig
        });
        console.log('Widget added successfully:', column.widgets); // 添加调试日志
      }
    }
  },
  
  UPDATE_WIDGET_CONFIG(state, { rowIndex, colIndex, widgetIndex, config }) {
    if (
      rowIndex >= 0 && rowIndex < state.layout.rows.length &&
      colIndex >= 0 && colIndex < state.layout.rows[rowIndex].columns.length &&
      widgetIndex >= 0 && widgetIndex < state.layout.rows[rowIndex].columns[colIndex].widgets.length
    ) {
      const widget = state.layout.rows[rowIndex].columns[colIndex].widgets[widgetIndex];
      widget.config = { ...widget.config, ...config };
    }
  },
  
  DELETE_WIDGET(state, { rowIndex, colIndex, widgetIndex }) {
    if (
      rowIndex >= 0 && rowIndex < state.layout.rows.length &&
      colIndex >= 0 && colIndex < state.layout.rows[rowIndex].columns.length &&
      widgetIndex >= 0 && widgetIndex < state.layout.rows[rowIndex].columns[colIndex].widgets.length
    ) {
      state.layout.rows[rowIndex].columns[colIndex].widgets.splice(widgetIndex, 1);
    }
  },
  
  DELETE_ROW(state, { rowIndex }) {
    if (rowIndex >= 0 && rowIndex < state.layout.rows.length) {
      state.layout.rows.splice(rowIndex, 1);
    }
  },
  
  SET_CURRENT_EDITING_WIDGET(state, widget) {
    state.currentEditingWidget = widget;
  },
  
  SAVE_LAYOUT(state, layout) {
    state.layout = { ...layout };
  },
  
  RESET_LAYOUT(state) {
    state.layout = { rows: [] };
  },
  
  // 更新列布局
  UPDATE_COLUMN_LAYOUT(state, { rowIndex, columns }) {
    if (rowIndex >= 0 && rowIndex < state.layout.rows.length) {
      state.layout.rows[rowIndex].columns = columns;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 