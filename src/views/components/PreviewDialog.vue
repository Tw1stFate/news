<template>
  <el-dialog
    title="布局预览效果"
    :visible.sync="visible"
    width="90%"
    class="preview-dialog"
    :fullscreen="true"
    :before-close="handleClose"
    append-to-body
  >
    <div class="preview-toolbar">
      <div class="preview-info">
        <i class="el-icon-info"></i>
        <span>此预览展示了布局的最终效果，包括所有添加的组件和栏目内容</span>
      </div>
      <div class="preview-actions">
        <el-button type="primary" size="small" @click="handleClose">返回编辑</el-button>
      </div>
    </div>

    <div class="preview-container">
      <div v-if="!layoutTree || !layoutTree.children || layoutTree.children.length === 0" class="empty-layout">
        <el-empty description="布局为空，请在编辑器中添加布局和组件">
          <template #image>
            <i class="el-icon-s-grid" style="font-size: 60px; color: #909399"></i>
          </template>
        </el-empty>
      </div>
      
      <div v-else class="preview-content">
        <div 
          v-for="node in layoutTree.children" 
          :key="node.id" 
          class="preview-node-wrapper"
          :style="getNodeWrapperStyle(node)"
        >
          <preview-row :node="node" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import WidgetRegistry from "../../services/widget-registry";

// 预览行组件
const PreviewRow = {
  name: "PreviewRow",
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  render(h) {
    // 如果节点有组件配置，直接渲染组件
    if (this.node.widget && this.node.widget.type) {
      return this.renderWidget(h, this.node);
    }
    
    // 获取行样式
    const rowStyle = {
      width: "100%",
      height: this.node.height ? (
        this.node.height.match(/^\d+$/) ? `${this.node.height}px` : this.node.height
      ) : "100%", // 设置为100%以填充父容器
      display: "flex",
      flexDirection: "column"
    };

    // 检查是否有列子节点
    const hasColumnChildren = this.node.children && 
      this.node.children.some(child => child.type === "column");

    // 创建行容器
    return h("div", {
      class: "preview-row",
      style: rowStyle
    }, [
      // 如果有列子节点，创建列容器
      h("div", {
        class: hasColumnChildren ? "column-container" : "row-content",
        style: hasColumnChildren ? {
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          width: "100%",
          gap: "16px",
          flex: "1"
        } : {
          flex: "1"
        }
      }, this.renderChildren(h))
    ]);
  },
  methods: {
    // 渲染子节点
    renderChildren(h) {
      if (!this.node.children || this.node.children.length === 0) {
        return [this.renderEmptyNode(h)];
      }

      return this.node.children.map(child => {
        if (child.type === "column") {
          return this.renderColumn(h, child);
        } else if (child.type === "row") {
          return h("preview-row", {
            props: {
              node: child
            },
            key: child.id
          });
        }
        return null;
      }).filter(Boolean);
    },

    // 渲染列
    renderColumn(h, column) {
      // 计算列宽度
      const columnWidth = column.percentWidth || (column.span ? `${column.span * 10}%` : "100%");
      
      // 列样式
      const columnStyle = {
        width: columnWidth,
        flex: `0 0 ${columnWidth}`,
        display: "inline-block",
        verticalAlign: "top",
        height: column.height
          ? column.height.match(/^\d+$/)
            ? `${column.height}px`
            : column.height
          : "auto"
      };

      // 如果列有组件配置，直接渲染组件
      if (column.widget && column.widget.type) {
        return h("div", {
          class: "preview-column",
          style: columnStyle,
          attrs: {
            'data-id': column.id
          }
        }, [this.renderWidget(h, column)]);
      }

      // 渲染列及其子内容
      return h("div", {
        class: "preview-column",
        style: columnStyle,
        attrs: {
          'data-id': column.id
        }
      }, [
        h("div", { class: "column-content" }, 
          column.children && column.children.length > 0
            ? column.children.map(child => h("preview-row", {
                props: {
                  node: child
                },
                key: child.id
              }))
            : [this.renderEmptyNode(h)]
        )
      ]);
    },

    // 渲染组件
    renderWidget(h, node) {
      try {
        const widgetType = node.widget.type;
        const widgetComponent = this.getWidgetComponent(widgetType);
        
        if (!widgetComponent) {
          console.error(`找不到组件类型: ${widgetType}`);
          return this.renderErrorWidget(h, `未知组件类型: ${widgetType}`);
        }

        // 准备组件配置，确保高度设置正确传递
        const config = {
          ...node.widget.config,
          // 如果节点有高度设置且组件配置中没有高度，则使用节点高度
          height: node.height && !node.widget.config.height ? 
            (node.height.match(/^\d+$/) ? parseInt(node.height) : node.height) : 
            node.widget.config.height
        };

        // 渲染实际组件
        return h("div", { 
          class: "preview-widget",
          style: node.height ? {
            height: node.height.match(/^\d+$/) ? `${node.height}px` : node.height
          } : {}
        }, [
          h(widgetComponent, {
            props: {
              config: config,
              columnId: node.columnId || null,
              isPreview: true // 特殊标记，告诉组件这是预览模式
            },
            class: "widget-component"
          })
        ]);
      } catch (e) {
        console.error("渲染组件错误:", e);
        return this.renderErrorWidget(h, `渲染错误: ${e.message}`);
      }
    },

    // 渲染错误组件
    renderErrorWidget(h, message) {
      return h("div", { 
        class: "preview-widget error" 
      }, message);
    },

    // 渲染空节点
    renderEmptyNode(h) {
      return h("div", {
        class: "preview-empty-node"
      }, [
        h("div", { class: "empty-placeholder" }, "空布局区域")
      ]);
    },

    // 获取组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    }
  }
};

export default {
  name: "PreviewDialog",
  components: {
    PreviewRow
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    layoutTree: {
      type: Object,
      default: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // 当对话框显示时分析布局
        this.$nextTick(() => {
          this.analyzeLayoutTree();
        });
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
    },
    
    // 分析布局树结构，用于调试
    analyzeLayoutTree() {
      if (!this.layoutTree) return;
      
      console.log("预览布局树结构:", {
        id: this.layoutTree.id,
        type: this.layoutTree.type,
        childrenCount: this.layoutTree.children ? this.layoutTree.children.length : 0
      });
      
      // 分析所有行和列
      let rowCount = 0;
      let columnCount = 0;
      let widgetCount = 0;
      
      const analyzeNode = (node) => {
        if (!node) return;
        
        if (node.type === 'row') rowCount++;
        if (node.type === 'column') columnCount++;
        if (node.widget) widgetCount++;
        
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => analyzeNode(child));
        }
      };
      
      if (this.layoutTree.children) {
        this.layoutTree.children.forEach(child => analyzeNode(child));
      }
      
      console.log(`预览布局统计: ${rowCount}行, ${columnCount}列, ${widgetCount}组件`);
    },
    getNodeWrapperStyle(node) {
      const style = {};
      if (node.height) {
        style.height = node.height.match(/^\d+$/) ? `${node.height}px` : node.height;
      }
      return style;
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
    overflow: hidden;
  }

  ::v-deep .el-dialog__header {
    background-color: #409eff;
    padding: 15px 20px;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .el-dialog__headerbtn {
      top: 15px;

      .el-dialog__close {
        color: white;
      }
    }
  }

  .preview-toolbar {
    padding: 15px 20px;
    background-color: #ecf5ff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d9ecff;

    .preview-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #409eff;

      i {
        font-size: 18px;
      }
    }
    
    .preview-actions {
      display: flex;
      gap: 10px;
    }
  }

  .preview-container {
    width: 100%;
    height: calc(100vh - 130px);
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    background-color: #f5f7fa;

    .preview-content {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      padding: 20px;
      min-height: 100%;
      
      .preview-node-wrapper {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.empty-layout {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #f9f9f9;
  border-radius: 4px;
}

// 全局样式，确保在预览中正确渲染
::v-deep {
  .preview-row {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex: 1;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .column-container {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 16px;
    }
    
    .row-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 16px;
    }
  }
  
  .preview-column {
    box-sizing: border-box;
    min-height: 100px;
    
    .column-content {
      height: 100%;
      background-color: #fff;
      border-radius: 4px;
      overflow: hidden;
    }
  }
  
  .preview-widget {
    width: 100%;
    overflow: hidden;
    
    .widget-component {
      width: 100%;
    }
    
    &.error {
      background-color: #fef0f0;
      color: #f56c6c;
      padding: 20px;
      text-align: center;
      border: 1px solid #fbc4c4;
      border-radius: 4px;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .preview-empty-node {
    min-height: 80px;
    background-color: #f9f9f9;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .empty-placeholder {
      color: #909399;
      font-size: 14px;
      font-style: italic;
    }
  }
}
</style>
