<template>
  <div class="widget-selector">
    <div class="selector-header">
      <div class="header-controls">
        <h2>选择栏目样式</h2>
      </div>
    </div>

    <div class="selector-content">
      <el-tabs v-model="activeGroup" type="card" @tab-click="handleTabClick">
        <el-tab-pane 
          v-for="group in widgetGroups" 
          :key="group" 
          :label="group" 
          :name="group">
        </el-tab-pane>
      </el-tabs>

      <div class="widget-list">
        <el-row :gutter="20">
          <el-col v-for="widget in currentGroupWidgets" :key="widget.id" :span="12">
            <el-card 
              class="widget-card" 
              :class="{ 'is-selected': selectedWidgetId === widget.id }"
              @click.native="selectWidget(widget)">
              <div class="widget-preview">
                <div v-if="hoveredWidgetId === widget.id" class="widget-overlay">
                  <el-button 
                    type="primary" 
                    icon="el-icon-setting" 
                    circle>
                  </el-button>
                </div>
                <component 
                  :is="getWidgetComponent(widget.type)"
                  :config="widget.config"
                  class="preview-component"
                  @mouseenter.native="hoveredWidgetId = widget.id"
                  @mouseleave.native="hoveredWidgetId = null" />
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
  name: 'WidgetSelector',
  data() {
    return {
      activeGroup: '',
      hoveredWidgetId: null,
      selectedWidgetId: null
    }
  },
  computed: {
    ...mapState('channel', ['channels']),
    
    // 获取所有widgets
    widgets() {
      return WidgetRegistry.getDefaultWidgets();
    },
    
    widgetGroups() {
      return WidgetRegistry.getGroups();
    },
    
    currentGroupWidgets() {
      if (!this.activeGroup) return [];
      return this.widgets.filter(widget => widget.group === this.activeGroup);
    }
  },
  created() {
    // 加载栏目数据
    this.loadChannels();
    // 默认选中第一个分组
    if (this.widgetGroups.length > 0) {
      this.activeGroup = this.widgetGroups[0];
    }
  },
  methods: {
    async loadChannels() {
      await this.$store.dispatch('channel/fetchChannels');
    },
    
    handleTabClick(tab) {
      this.activeGroup = tab.name;
    },
    
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    selectWidget(widget) {
      this.selectedWidgetId = widget.id;
      this.$emit('select', widget);
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-selector {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;

  .selector-header {
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

  .selector-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .widget-list {
    margin-top: 20px;
  }

  .widget-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    &.is-selected {
      border: 2px solid #409EFF;
    }

    .widget-preview {
      position: relative;
      height: 300px;
      overflow: hidden;
      border-bottom: 1px solid #ebeef5;

      .widget-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
      }

      :deep(.preview-component) {
        width: 100%;
        height: 100%;
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