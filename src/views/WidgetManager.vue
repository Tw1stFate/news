<template>
  <div class="widget-manager">
    <el-header height="60px" class="manager-header">
      <div class="header-controls">
        <h2>栏目样式管理</h2>
      </div>
    </el-header>

    <div class="manager-content">
      <div class="widget-group">
        <h3 class="group-title">轮播图</h3>
        <el-row :gutter="20">
          <el-col :span="12" v-for="widget in carouselWidgets" :key="widget.id">
            <el-card class="widget-card">
              <div class="preview-area">
                <component 
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config"
                  class="preview-component" />
              </div>
              <div class="widget-info text-center">
                <h4>{{ widget.name }}</h4>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="widget-group">
        <h3 class="group-title">新闻列表</h3>
        <el-row :gutter="20">
          <el-col :span="12" v-for="widget in newsListWidgets" :key="widget.id">
            <el-card class="widget-card">
              <div class="preview-area" style="height: 300px;">
                <component 
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config"
                  class="preview-component" />
              </div>
              <div class="widget-info text-center">
                <h4>{{ widget.name }}</h4>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="widget-group">
        <h3 class="group-title">图片新闻</h3>
        <el-row :gutter="20">
          <el-col :span="12" v-for="widget in imageNewsWidgets" :key="widget.id">
            <el-card class="widget-card">
              <div class="preview-area" style="height: 300px;">
                <component 
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config"
                  class="preview-component" />
              </div>
              <div class="widget-info text-center">
                <h4>{{ widget.name }}</h4>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="widget-group">
        <h3 class="group-title">排行榜</h3>
        <el-row :gutter="20">
          <el-col :span="12" v-for="widget in hotNewsWidgets" :key="widget.id">
            <el-card class="widget-card">
              <div class="preview-area" style="height: 300px;">
                <component 
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config"
                  class="preview-component" />
              </div>
              <div class="widget-info text-center">
                <h4>{{ widget.name }}</h4>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WidgetRegistry from '@/services/widget-registry';

export default {
  name: 'WidgetManager',
  computed: {
    ...mapState('widget', ['widgets']),
    
    widgetTypes() {
      return WidgetRegistry.getTypes();
    },
    
    hasOtherWidgets() {
      const knownTypes = ['carousel-1', 'carousel-2', 'carousel-3', 'news-list', 'news-list-1', 'image-news', 'hot-news'];
      return this.widgets.some(widget => !knownTypes.includes(widget.type));
    },
    
    otherWidgets() {
      const knownTypes = ['carousel-1', 'carousel-2', 'carousel-3', 'news-list', 'news-list-1', 'image-news', 'hot-news'];
      return this.widgets.filter(widget => !knownTypes.includes(widget.type));
    },
    
    carouselWidgets() {
      return this.widgets.filter(widget => widget.type.startsWith('carousel-'))
    },
    newsListWidgets() {
      return this.widgets.filter(widget => widget.type.startsWith('news-list'))
    },
    imageNewsWidgets() {
      return this.widgets.filter(widget => widget.type === 'image-news')
    },
    hotNewsWidgets() {
      return this.widgets.filter(widget => widget.type === 'hot-news')
    }
  },
  methods: {
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    getWidgetTypeName(type) {
      const widget = this.widgetTypes.find(w => w.type === type);
      return widget ? widget.name : type;
    },
    
    getWidgetIcon(type) {
      const widget = this.widgetTypes.find(w => w.type === type);
      return widget ? widget.icon : 'el-icon-question';
    },
    
    hasWidgetsOfType(types) {
      if (Array.isArray(types)) {
        return this.widgets.some(widget => types.includes(widget.type));
      }
      return this.widgets.some(widget => widget.type === types);
    },
    
    getWidgetsByType(types) {
      if (Array.isArray(types)) {
        return this.widgets.filter(widget => types.includes(widget.type));
      }
      return this.widgets.filter(widget => widget.type === types);
    },
    async reloadWidgets() {
      await this.$store.dispatch('widget/clearWidgets');
      await this.$store.dispatch('widget/fetchWidgets');
    }
  },
  created() {
    // 加载预设的栏目样式数据
    this.reloadWidgets();
  }
};
</script>

<style lang="scss" scoped>
.widget-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;

  .manager-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 0;

    .header-controls {
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #303133;
        font-weight: 500;
      }
    }
  }

  .manager-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .widget-group {
    margin-bottom: 40px;

    .group-title {
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
  }

  .widget-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .preview-area {
      border-bottom: 1px solid #ebeef5;
      overflow: hidden;
      display: flex;

      :deep(.preview-component) {
        width: 100%;
      }
    }

    .widget-info {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #606266;
        font-weight: normal;
      }
    }
  }
}
</style> 