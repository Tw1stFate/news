<template>
  <el-dialog
    title="选择栏目样式"
    :visible="visible"
    width="80%"
    :before-close="closeDialog"
    class="widget-selector-dialog"
    :close-on-click-modal="false"
  >
    <div class="widget-selection">
      <el-tabs v-model="activeWidgetCategory" type="card">
        <el-tab-pane
          v-for="category in widgetCategories"
          :key="category"
          :label="category"
          :name="category"
        >
          <el-row :gutter="20">
            <!-- 导航栏组件需要占用完整一行 -->
            <el-col
              v-for="(widget, index) in getWidgetsByCategory(category)"
              :key="`${widget.type}_${index}`"
              :span="category === '导航栏' ? 24 : 12"
            >
              <div class="widget-container">
                <div class="widget-header">
                  <h4>{{ widget.name }}</h4>
                </div>
                <el-card
                  class="widget-card"
                  :class="{
                    'is-selected':
                      selectedWidgetType === widget.type &&
                      selectedWidgetIndex === index,
                  }"
                  @click.native="selectWidget(widget, index)"
                >
                  <div class="preview-area">
                    <component
                      :is="getWidgetComponent(widget.type)"
                      :config="widget.config"
                      :ref="`widget_${widget.type}_${index}`"
                      class="preview-component"
                    />
                  </div>
                </el-card>
                <div class="widget-description">
                  <p>{{ widget.description || "暂无描述" }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button
        type="primary"
        @click="confirmSelection"
        :disabled="!selectedWidgetType"
        >确定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
import WidgetRegistry from "../services/widget-registry";

export default {
  name: "WidgetSelector",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    nodeId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      activeWidgetCategory: "轮播图",
      selectedWidgetType: null,
      selectedWidgetIndex: -1,
    };
  },
  computed: {
    ...mapState("column", ["columns"]),

    // 获取所有widgets
    widgets() {
      return WidgetRegistry.getDefaultWidgets();
    },

    // 组件分类列表
    widgetCategories() {
      return WidgetRegistry.getCategories();
    },
  },
  methods: {
    // 根据分类获取组件
    getWidgetsByCategory(category) {
      return this.widgets.filter((widget) => widget.category === category);
    },

    // 选择组件
    selectWidget(widget, index) {
      this.selectedWidgetType = widget.type;
      this.selectedWidgetIndex = index;
    },

    // 获取组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },

    // 关闭对话框并重置状态
    closeDialog() {
      this.reset();
      this.$emit("update:visible", false);
      this.$emit("close");
    },

    // 确认选择
    confirmSelection() {
      if (!this.selectedWidgetType) {
        return;
      }

      const categoryWidgets = this.getWidgetsByCategory(
        this.activeWidgetCategory
      );
      const widget = categoryWidgets[this.selectedWidgetIndex];

      if (!widget) {
        this.$message.error("选择的组件无效");
        return;
      }

      // 获取组件实例
      const refKey = `widget_${widget.type}_${this.selectedWidgetIndex}`;
      const widgetComponent = this.$refs[refKey] && this.$refs[refKey][0];
      
      // 检查组件是否需要设置参数并且有设置方法
      if (
        widgetComponent && 
        widgetComponent.requiresConfig && 
        typeof widgetComponent.showSettingDialog === "function"
      ) {
        // 显示设置对话框
        widgetComponent.showSettingDialog((newConfig) => {
          // 创建widget副本并更新配置
          const widgetCopy = JSON.parse(JSON.stringify(widget));
          widgetCopy.config = { ...newConfig };
          
          // 发送选中结果并关闭对话框
          this.$emit("confirm", { widget: widgetCopy });
          this.closeDialog();
        });
        return;
      }
      
      // 直接使用当前配置
      const widgetCopy = JSON.parse(JSON.stringify(widget));
      this.$emit("confirm", { widget: widgetCopy });
      this.closeDialog();
    },

    // 重置状态
    reset() {
      this.selectedWidgetType = null;
      this.selectedWidgetIndex = -1;
    },
  },
  watch: {
    visible(val) {
      if (val) {
        // 默认选中第一个分类
        this.activeWidgetCategory = this.widgetCategories[0] || "轮播图";
      } else {
        this.reset();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 对话框样式
.widget-selector-dialog {
  ::v-deep .el-dialog {
    display: flex;
    flex-direction: column;
    margin-top: 5vh !important;
    max-height: 90vh;

    .el-dialog__body {
      flex: 1;
      overflow: auto;
    }

    .el-dialog__header {
      padding: 15px 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .el-dialog__footer {
      padding: 15px 20px;
      border-top: 1px solid #ebeef5;
      text-align: center;
    }
  }
}

// 组件选择对话框样式
.widget-selection {
  min-height: 400px;
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
        border-color: #409eff;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      // 移除el-card的内边距
      ::v-deep .el-card__body {
        padding: 0;
      }

      .preview-area {
        height: 180px;
        overflow: hidden;
        background-color: #f5f7fa;
        border-radius: 4px;
        position: relative;
        pointer-events: none; // 阻止点击事件，使组件不可交互

        // .preview-component {
        //   transform: scale(0.8);
        //   transform-origin: top center;
        // }
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
  justify-content: center;
  gap: 10px;
}

// 响应式调整
@media (max-width: 768px) {
  .widget-selection {
    .el-col {
      width: 100% !important;
    }
  }
}
</style>
