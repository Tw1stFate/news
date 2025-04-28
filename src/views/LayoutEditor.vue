<template>
  <div class="layout-editor">
    <el-header height="60px" class="editor-header">
      <div class="header-controls">
        <h2>新闻门户布局编辑器</h2>
        <div class="actions">
          <el-button type="primary" @click="saveLayout" :loading="saving">保存布局</el-button>
          <el-button @click="loadDefaultLayout" type="success" plain>加载默认布局</el-button>
          <el-button @click="resetLayout" type="danger" plain>重置布局</el-button>
          <el-dropdown trigger="click" @command="handleExport">
            <el-button type="info" plain>
              更多操作 <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="export">导出布局配置</el-dropdown-item>
              <el-dropdown-item command="import">导入布局配置</el-dropdown-item>
              <el-dropdown-item divided command="help">查看帮助</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <div class="editor-main">
      <div class="editor-content">
        <div v-if="layout.rows && layout.rows.length > 0" class="layout-container">
          <div v-for="(row, rowIndex) in layout.rows" 
               :key="row.id" 
               class="layout-row"
               :class="{ 'is-editing': isEditingRow === rowIndex }"
               @mouseenter="handleRowMouseEnter(rowIndex)"
               @mouseleave="handleRowMouseLeave">
            
            <div class="row-controls" v-show="isEditingRow === rowIndex">
              <el-dropdown @command="handleColumnLayout" trigger="hover">
                <el-button type="primary" size="small" icon="el-icon-s-grid">
                  布局
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ rowIndex, layout: '1' }">一列</el-dropdown-item>
                  <el-dropdown-item :command="{ rowIndex, layout: '1:1' }">两列等宽</el-dropdown-item>
                  <el-dropdown-item :command="{ rowIndex, layout: '2:1' }">两列(2:1)</el-dropdown-item>
                  <el-dropdown-item :command="{ rowIndex, layout: '1:2' }">两列(1:2)</el-dropdown-item>
                  <el-dropdown-item :command="{ rowIndex, layout: '1:1:1' }">三列等宽</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteRow(rowIndex)"></el-button>
            </div>

            <el-row :gutter="20" class="row-content">
              <el-col v-for="(column, colIndex) in row.columns"
                     :key="column.id"
                     :span="column.span"
                     class="layout-column"
                     :class="{ 'is-editing': isEditingColumn === `${rowIndex}-${colIndex}` }"
                     @mouseenter="handleColumnMouseEnter(rowIndex, colIndex)"
                     @mouseleave="handleColumnMouseLeave">
                
                <div class="column-content">
                  <template v-if="column.widgets && column.widgets.length > 0">
                    <div v-for="(widget, widgetIndex) in column.widgets"
                         :key="widget.id"
                         class="widget-wrapper"
                         :class="{ 'is-editing': isEditingWidget === `${rowIndex}-${colIndex}-${widgetIndex}` }"
                         @mouseenter="handleWidgetMouseEnter(rowIndex, colIndex, widgetIndex)"
                         @mouseleave="handleWidgetMouseLeave">
                      
                      <div class="widget-controls" v-show="isEditingWidget === `${rowIndex}-${colIndex}-${widgetIndex}`">
                        <el-button-group>
                          <el-button 
                            type="primary" 
                            size="mini" 
                            icon="el-icon-setting"
                            @click="editWidget(rowIndex, colIndex, widgetIndex)">
                          </el-button>
                          <el-button 
                            type="danger" 
                            size="mini" 
                            icon="el-icon-delete"
                            @click="deleteWidget(rowIndex, colIndex, widgetIndex)">
                          </el-button>
                        </el-button-group>
                      </div>

                      <component 
                        :is="getWidgetComponent(widget.type)"
                        :config="widget.config || {}"
                        class="widget-component" />
                    </div>
                  </template>

                  <div class="add-widget-placeholder" :class="{ 'is-column-empty': !column.widgets || column.widgets.length === 0 }">
                    <el-dropdown @command="(type) => handleAddWidget(rowIndex, colIndex, type)" trigger="click">
                      <el-button type="primary" plain size="small" icon="el-icon-plus">
                        {{ !column.widgets || column.widgets.length === 0 ? '添加第一个组件' : '添加更多组件' }}
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="widget in availableWidgets"
                                        :key="widget.type"
                                        :command="widget.type">
                          <i :class="widget.icon"></i> {{ widget.name }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <div v-else class="empty-layout">
          <el-empty description="布局为空，点击下方的&quot;添加行&quot;按钮开始设计">
            <template #image>
              <i class="el-icon-s-grid"></i>
            </template>
          </el-empty>
        </div>

        <div class="add-row-container">
          <el-button type="primary" plain icon="el-icon-plus" @click="addRow">添加行</el-button>
        </div>
      </div>
    </div>

    <widget-config-dialog 
      v-if="currentEditingWidget"
      :visible.sync="configDialogVisible"
      :widget="currentEditingWidget"
      @save="saveWidgetConfig"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import WidgetConfigDialog from '@/components/editor/WidgetConfigDialog.vue';
import WidgetRegistry from '@/services/widget-registry';
import HeadlineWidget from '@/components/widgets/HeadlineWidget.vue';
import NewsListWidget from '@/components/widgets/NewsListWidget.vue';
import ImageNewsWidget from '@/components/widgets/ImageNewsWidget.vue';
import CarouselWidget from '@/components/widgets/CarouselWidget.vue';
import HotNewsWidget from '@/components/widgets/HotNewsWidget.vue';
import api from '@/services/api';

// 注册可用的组件
WidgetRegistry.register('headline', HeadlineWidget);
WidgetRegistry.register('news-list', NewsListWidget);
WidgetRegistry.register('image-news', ImageNewsWidget);
WidgetRegistry.register('carousel', CarouselWidget);
WidgetRegistry.register('hot-news', HotNewsWidget);

export default {
  name: 'LayoutEditor',
  components: {
    WidgetConfigDialog,
    HeadlineWidget,
    NewsListWidget,
    ImageNewsWidget,
    CarouselWidget,
    HotNewsWidget
  },
  data() {
    return {
      configDialogVisible: false,
      saving: false,
      editingWidgetInfo: null,
      isEditingRow: null,
      isEditingColumn: null,
      isEditingWidget: null
    };
  },
  computed: {
    ...mapState('layout', ['currentEditingWidget']),
    ...mapGetters('layout', ['getLayout', 'getAvailableWidgets']),
    
    layout() {
      return this.getLayout;
    },
    
    availableWidgets() {
      return this.getAvailableWidgets;
    }
  },
  methods: {
    ...mapActions('layout', [
      'addRow',
      'addWidget',
      'updateWidgetConfig',
      'deleteWidget',
      'deleteRow',
      'setCurrentEditingWidget',
      'resetLayout',
      'saveLayout',
      'loadDefaultLayout'
    ]),
    
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    // 处理列布局变更
    handleColumnLayout({ rowIndex, layout }) {
      const row = this.layout.rows[rowIndex];
      let newColumns = [];
      
      // 根据选择的布局类型创建列
      if (layout === '1') {
        // 一列 (占满24格)
        newColumns = [{ id: this.generateId(), span: 24, widgets: [] }];
      } else if (layout === '1:1') {
        // 两列等宽 (各12格)
        newColumns = [
          { id: this.generateId(), span: 12, widgets: [] },
          { id: this.generateId(), span: 12, widgets: [] }
        ];
      } else if (layout === '2:1') {
        // 两列 2:1 比例 (16:8格)
        newColumns = [
          { id: this.generateId(), span: 16, widgets: [] },
          { id: this.generateId(), span: 8, widgets: [] }
        ];
      } else if (layout === '1:2') {
        // 两列 1:2 比例 (8:16格)
        newColumns = [
          { id: this.generateId(), span: 8, widgets: [] },
          { id: this.generateId(), span: 16, widgets: [] }
        ];
      } else if (layout === '1:1:1') {
        // 三列等宽 (各8格)
        newColumns = [
          { id: this.generateId(), span: 8, widgets: [] },
          { id: this.generateId(), span: 8, widgets: [] },
          { id: this.generateId(), span: 8, widgets: [] }
        ];
      }
      
      // 将现有的组件转移到新布局中
      if (row.columns && row.columns.length > 0) {
        const existingWidgets = row.columns.flatMap(col => col.widgets || []);
        
        // 如果有组件，则平均分配到新的列中
        if (existingWidgets.length > 0) {
          const widgetsPerColumn = Math.ceil(existingWidgets.length / newColumns.length);
          
          let widgetIndex = 0;
          for (let i = 0; i < newColumns.length && widgetIndex < existingWidgets.length; i++) {
            newColumns[i].widgets = existingWidgets.slice(
              widgetIndex,
              Math.min(widgetIndex + widgetsPerColumn, existingWidgets.length)
            );
            widgetIndex += widgetsPerColumn;
          }
        }
      }
      
      // 提交更新列布局的 mutation
      this.$store.commit('layout/UPDATE_COLUMN_LAYOUT', {
        rowIndex,
        columns: newColumns
      });
    },
    
    // 打开组件配置对话框
    editWidget(rowIndex, colIndex, widgetIndex) {
      const widget = this.layout.rows[rowIndex].columns[colIndex].widgets[widgetIndex];
      this.setCurrentEditingWidget(widget);
      this.editingWidgetInfo = { rowIndex, colIndex, widgetIndex };
      this.configDialogVisible = true;
    },
    
    // 保存组件配置
    saveWidgetConfig(config) {
      if (this.editingWidgetInfo) {
        const { rowIndex, colIndex, widgetIndex } = this.editingWidgetInfo;
        this.updateWidgetConfig({ rowIndex, colIndex, widgetIndex, config });
        this.configDialogVisible = false;
      }
    },
    
    // 获取组件的显示名称
    getWidgetName(type) {
      const widget = this.availableWidgets.find(w => w.type === type);
      return widget ? widget.name : type;
    },
    
    // 保存布局到后端
    async saveLayout() {
      this.saving = true;
      try {
        await api.saveLayout(this.layout);
        this.$message.success('布局保存成功');
      } catch (error) {
        this.$message.error('保存失败: ' + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    // 生成唯一ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    // 加载默认布局
    async loadDefaultLayout() {
      try {
        this.$message.info('正在加载默认布局...');
        const layoutData = await api.getLayoutById('default');
        if (layoutData && layoutData.layout) {
          this.$store.commit('layout/SAVE_LAYOUT', layoutData.layout);
          this.$message.success('默认布局加载成功');
        } else {
          this.$message.error('加载失败：布局数据无效');
        }
      } catch (error) {
        console.error('加载布局失败:', error);
        this.$message.error('加载失败：' + error.message);
      }
    },
    
    // 处理导出相关操作
    handleExport(command) {
      if (command === 'export') {
        this.exportLayout();
      } else if (command === 'import') {
        this.$message.info('此功能正在开发中');
      } else if (command === 'help') {
        this.$alert(
          `<p>布局编辑器使用说明：</p>
          <ol>
            <li>点击<b>添加行</b>按钮创建新行</li>
            <li>使用行右侧的<b>布局</b>下拉菜单设置列结构</li>
            <li>在列中点击<b>添加组件</b>选择要添加的组件</li>
            <li>点击组件的<b>设置</b>图标可配置组件属性</li>
            <li>右侧实时预览区可查看效果</li>
            <li>完成后点击<b>保存布局</b>保存您的设计</li>
          </ol>`,
          '使用帮助',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '知道了'
          }
        );
      }
    },
    
    // 导出布局配置
    exportLayout() {
      try {
        const layoutConfig = JSON.stringify(this.layout, null, 2);
        const blob = new Blob([layoutConfig], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `news-portal-layout-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.$message.success('布局配置已导出');
      } catch (error) {
        this.$message.error('导出失败: ' + error.message);
      }
    },

    handleRowMouseEnter(rowIndex) {
      this.isEditingRow = rowIndex;
    },
    
    handleRowMouseLeave() {
      this.isEditingRow = null;
    },
    
    handleColumnMouseEnter(rowIndex, colIndex) {
      this.isEditingColumn = `${rowIndex}-${colIndex}`;
    },
    
    handleColumnMouseLeave() {
      this.isEditingColumn = null;
    },
    
    handleWidgetMouseEnter(rowIndex, colIndex, widgetIndex) {
      this.isEditingWidget = `${rowIndex}-${colIndex}-${widgetIndex}`;
    },
    
    handleWidgetMouseLeave() {
      this.isEditingWidget = null;
    },
    
    handleAddWidget(rowIndex, colIndex, widgetType) {
      console.log('Adding widget:', { rowIndex, colIndex, widgetType }); // 添加调试日志
      this.$store.dispatch('layout/addWidget', { rowIndex, colIndex, widgetType });
    }
  },
  created() {
    // 初始化，如果布局为空则添加一个默认行
    if (!this.layout.rows || this.layout.rows.length === 0) {
      this.addRow();
      // 提示用户可以加载默认布局
      this.$nextTick(() => {
        this.$message({
          message: '您可以使用"加载默认布局"按钮快速预览完整的新闻门户布局',
          type: 'info',
          duration: 5000,
          showClose: true
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.layout-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;

  .editor-header {
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
      width: 100%;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #303133;
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }

  .editor-main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
    width: 100%;

    .editor-content {
      flex: 1;
      overflow-y: auto;
      background-color: #fff;
      border-radius: 0;
      box-shadow: none;
      padding: 24px;
    }
  }

  .layout-container {
    .layout-row {
      position: relative;
      margin-bottom: 32px;
      margin-top: 40px;
      border-radius: 8px;
      transition: all 0.3s;

      &:first-child {
        margin-top: 0;
      }

      &.is-editing {
        background-color: #ecf5ff;
      }

      .row-controls {
        position: absolute;
        top: -32px;
        right: 0;
        display: flex;
        gap: 8px;
        z-index: 2;
        background-color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .row-content {
        padding: 16px;
      }
    }
  }

  .layout-column {
    transition: all 0.3s;

    &.is-editing {
      .column-content {
        border-color: #409EFF;
        background-color: #ecf5ff;
      }
    }

    .column-content {
      min-height: 120px;
      padding: 16px;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      background-color: #fff;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }

  .widget-wrapper {
    position: relative;
    margin-bottom: 16px;
    transition: all 0.3s;

    &:last-child {
      margin-bottom: 0;
    }

    &.is-editing {
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid #409EFF;
        border-radius: 8px;
        pointer-events: none;
        z-index: 1;
      }
    }

    .widget-controls {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 3;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .widget-component {
      position: relative;
      padding: 16px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      z-index: 2;
    }
  }

  .add-widget-placeholder {
    display: flex;
    justify-content: center;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
    
    &.is-column-empty {
      flex: 1;
      align-items: center;
      min-height: 120px;
      background-color: #f5f7fa;
      border: 2px dashed #e4e7ed;
      margin-top: 0;

      .el-button {
        font-size: 14px;
        padding: 12px 24px;
      }
    }
  }

  .empty-layout {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;

    .el-icon-s-grid {
      font-size: 60px;
      color: #909399;
    }
  }

  .add-row-container {
    margin-top: 24px;
    text-align: center;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .el-button {
      width: 200px;
      height: 40px;
      font-size: 16px;
      padding: 0 24px;
    }
  }
}
</style> 