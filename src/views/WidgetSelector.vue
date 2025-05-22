<template>
  <div class="widget-selector">
    <el-header height="60px" class="selector-header">
      <div class="header-controls">
        <h2>选择栏目样式</h2>
      </div>
    </el-header>

    <div class="selector-content">
      <!-- 分组选项卡 -->
      <el-tabs v-model="activeGroup" type="card" @tab-click="handleTabClick">
        <el-tab-pane 
          v-for="group in widgetGroups" 
          :key="group" 
          :label="group" 
          :name="group">
        </el-tab-pane>
      </el-tabs>

      <!-- 当前分组的组件列表 -->
      <div class="widget-list">
        <el-row :gutter="20">
          <el-col :span="12" v-for="widget in currentGroupWidgets" :key="widget.id">
            <el-card 
              class="widget-card" 
              :class="{ 'is-selected': selectedWidgetId === widget.id }"
              @click.native="selectWidget(widget)">
              <div class="widget-preview">
                <div class="widget-overlay" v-show="hoveredWidgetId === widget.id">
                  <el-button 
                    type="primary" 
                    icon="el-icon-setting" 
                    circle
                    @click.stop="openWidgetSettings(widget)">
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

    <!-- 组件设置对话框 -->
    <el-dialog
      :title="`${selectedWidget ? selectedWidget.name : '组件'}设置`"
      :visible.sync="settingsDialogVisible"
      width="50%"
      :before-close="handleCloseSettingsDialog">
      <widget-settings
        v-if="selectedWidget"
        :widget="selectedWidget"
        :channels="channels"
        @save="handleSaveSettings"
        @cancel="handleCloseSettingsDialog">
      </widget-settings>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseSettingsDialog">取消</el-button>
        <el-button type="primary" @click="applyWidgetSettings">应用</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WidgetRegistry from '@/services/widget-registry';

export default {
  name: 'WidgetSelector',
  components: {
    // 假设我们会创建一个通用的组件设置组件
    WidgetSettings: () => import('@/components/WidgetSettings.vue')
  },
  data() {
    return {
      activeGroup: '',
      hoveredWidgetId: null,
      selectedWidgetId: null,
      settingsDialogVisible: false,
      tempWidgetConfig: null,
      selectedWidget: null
    }
  },
  computed: {
    ...mapState('widget', ['widgets']),
    ...mapState('channel', ['channels']),
    
    widgetGroups() {
      return WidgetRegistry.getGroups();
    },
    
    currentGroupWidgets() {
      if (!this.activeGroup) return [];
      return this.widgets.filter(widget => widget.group === this.activeGroup);
    }
  },
  created() {
    // 加载预设的栏目样式数据
    this.loadWidgets();
    // 默认选中第一个分组
    if (this.widgetGroups.length > 0) {
      this.activeGroup = this.widgetGroups[0];
    }
  },
  methods: {
    async loadWidgets() {
      await this.$store.dispatch('widget/fetchWidgets');
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
    },
    
    openWidgetSettings(widget) {
      this.selectedWidget = JSON.parse(JSON.stringify(widget)); // 深拷贝
      this.tempWidgetConfig = JSON.parse(JSON.stringify(widget.config));
      this.settingsDialogVisible = true;
    },
    
    handleCloseSettingsDialog() {
      this.settingsDialogVisible = false;
      this.selectedWidget = null;
      this.tempWidgetConfig = null;
    },
    
    handleSaveSettings(updatedConfig) {
      if (this.selectedWidget) {
        this.tempWidgetConfig = updatedConfig;
      }
    },
    
    applyWidgetSettings() {
      if (this.selectedWidget && this.tempWidgetConfig) {
        // 找到原始组件并更新配置
        const originalWidget = this.widgets.find(w => w.id === this.selectedWidget.id);
        if (originalWidget) {
          // 更新组件配置
          this.$store.dispatch('widget/updateWidgetConfig', {
            widgetId: this.selectedWidget.id,
            config: this.tempWidgetConfig
          });
          
          // 如果当前选中的就是被修改的组件，更新选中状态
          if (this.selectedWidgetId === this.selectedWidget.id) {
            this.$emit('select', {
              ...originalWidget,
              config: this.tempWidgetConfig
            });
          }
          
          this.$message.success('组件设置已应用');
        }
      }
      this.handleCloseSettingsDialog();
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