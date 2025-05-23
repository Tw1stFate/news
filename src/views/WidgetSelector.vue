<template>
  <el-dialog
    title="选择栏目样式"
    :visible.sync="visible"
    width="80%"
    :before-close="handleClose">
    <div class="widget-selection">
      <el-tabs v-model="activeWidgetCategory" type="card">
        <el-tab-pane 
          v-for="category in widgetCategories" 
          :key="category" 
          :label="category" 
          :name="category">
          
          <el-row :gutter="20">
            <!-- 导航栏组件需要占用完整一行 -->
            <el-col 
              v-for="widget in getWidgetsByCategory(category)" 
              :key="widget.id"
              :span="category === '导航栏' ? 24 : 12">
              
              <div class="widget-container">
                <div class="widget-header">
                  <h4>{{ widget.name }}</h4>
                  <el-button 
                    v-if="selectedWidgetId === widget.id"
                    type="primary" 
                    size="mini" 
                    icon="el-icon-setting"
                    @click="showWidgetSettings(widget)">设置</el-button>
                </div>
                <el-card 
                  class="widget-card" 
                  :class="{ 'is-selected': selectedWidgetId === widget.id }"
                  @click.native="selectWidget(widget)">
                  <div class="preview-area">
                    <component 
                      :is="getWidgetComponent(widget.type)"
                      :config="widget.config"
                      class="preview-component" />
                  </div>
                </el-card>
                <div class="widget-description">
                  <p>{{ widget.description }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer" class="dialog-footer">
      <div class="channel-selection" v-if="selectedWidgetId">
        <span>关联栏目：</span>
        <el-select v-model="selectedChannelId" placeholder="请选择栏目">
          <el-option
            v-for="channel in channels"
            :key="channel.id"
            :label="channel.name"
            :value="channel.id">
          </el-option>
        </el-select>
      </div>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="confirmSelection" :disabled="!selectedWidgetId">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex';
import WidgetRegistry from '@/services/widget-registry';

export default {
  name: 'WidgetSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    nodeId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      activeWidgetCategory: '轮播图',
      selectedWidgetId: null,
      selectedChannelId: null
    }
  },
  computed: {
    ...mapState('channel', ['channels']),
    
    // 获取所有widgets
    widgets() {
      return WidgetRegistry.getDefaultWidgets();
    },
    
    // 组件分类列表
    widgetCategories() {
      return WidgetRegistry.getCategories();
    }
  },
  methods: {
    // 根据分类获取组件
    getWidgetsByCategory(category) {
      return this.widgets.filter(widget => widget.category === category);
    },
    
    // 选择组件
    selectWidget(widget) {
      this.selectedWidgetId = widget.id;
    },
    
    // 获取组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    // 显示组件设置
    showWidgetSettings(widget) {
      this.$root.$emit('widget-config-requested', widget);
    },
    
    // 关闭对话框
    handleClose() {
      this.reset();
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    
    // 确认选择
    confirmSelection() {
      if (!this.selectedWidgetId) {
        return;
      }
      
      const widget = this.widgets.find(w => w.id === this.selectedWidgetId);
      if (!widget) {
        this.$message.error('选择的组件无效');
        return;
      }
      
      this.$emit('confirm', {
        nodeId: this.nodeId,
        widgetId: this.selectedWidgetId,
        channelId: this.selectedChannelId,
        widget
      });
      
      this.reset();
      this.$emit('update:visible', false);
    },
    
    // 重置状态
    reset() {
      this.selectedWidgetId = null;
      this.selectedChannelId = null;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        // 默认选中第一个分类
        this.activeWidgetCategory = this.widgetCategories[0] || '轮播图';
      } else {
        this.reset();
      }
    }
  },
  created() {
    console.log('WidgetSelector created');
  }
};
</script>

<style lang="scss" scoped>
// 组件选择对话框样式
.widget-selection {
  max-height: 60vh;
  overflow-y: auto;
  
  .widget-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .widget-card {
      flex: 1;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &.is-selected {
        border-color: #409EFF;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .preview-area {
        height: 160px;
        overflow: hidden;
        background-color: #f5f7fa;
        border-radius: 4px;
        position: relative;
        pointer-events: none; // 阻止点击事件，使组件不可交互
        
        .preview-component {
          transform: scale(0.8);
          transform-origin: top left;
        }
      }
    }
    
    .widget-description {
      color: #606266;
      font-size: 13px;
      line-height: 1.4;
      
      p {
        margin: 0;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .channel-selection {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style> 