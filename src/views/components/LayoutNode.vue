<template>
  <div
    :class="[
      'layout-node',
      `node-${node.type}`,
      `depth-${depth}`,
      {
        'is-hovered': isHovered,
        'has-widget': !!node.widget,
      },
    ]"
    :style="nodeStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 节点头部 - 仅对行布局显示 -->
    <div v-if="node.type === 'row'" class="node-header">
      <div class="node-title">
        <i class="el-icon-menu"></i>
      </div>

      <div class="node-controls">
        <!-- 对于行布局，添加行高输入框和列配置 -->
        <div class="row-settings">
          <!-- 行高设置 -->
          <div class="setting-item">
            <span class="setting-label">行高:</span>
            <el-input
              v-model="node.height"
              size="mini"
              placeholder="自适应"
              style="width: 80px"
              @input="handleHeightChange"
            >
              <template slot="suffix">px</template>
            </el-input>
          </div>
          <!-- 列配置下拉菜单 -->
          <div class="setting-item">
            <span class="setting-label">列配置:</span>
            <el-select
              v-model="columnPreset"
              size="mini"
              placeholder="选择列配置"
              style="width: 120px"
              @change="handlePresetChange"
            >
              <el-option 
                v-for="option in presetOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value">
              </el-option>
            </el-select>
            <!-- 自定义比例输入框 -->
            <el-input
              v-if="showCustomInput"
              v-model="customRatio"
              size="mini"
              placeholder="如 1:2:1"
              style="width: 100px; margin-left: 8px;"
              @change="handleCustomRatioChange"
            >
            </el-input>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <!-- 行布局的上移按钮 -->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-arrow-up"
            class="move-button"
            @click.stop="moveRowUp"
          >
          </el-button>

          <!-- 行布局的下移按钮 -->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-arrow-down"
            class="move-button"
            @click.stop="moveRowDown"
          >
          </el-button>

          <!-- 不是根节点时显示删除按钮 -->
          <el-button
            v-if="!isRoot"
            type="text"
            size="mini"
            icon="el-icon-delete"
            class="delete-button"
            @click="deleteNode"
          >
          </el-button>
        </div>
      </div>
    </div>

    <!-- 节点内容 -->
    <div class="node-content" :style="nodeContentStyle">
      <!-- 有组件的情况 -->
      <div v-if="node.widget" class="node-widget">
        <div class="widget-preview">
          <!-- 渲染实际组件 -->
          <component
            :is="getWidgetComponent(node.widget.type)"
            :config="node.widget.config || {}"
            :nodeId="node.id"
            ref="widgetComponent"
            class="preview-component"
          >
          </component>

          <!-- 悬停时显示的遮罩层 -->
          <div class="widget-overlay">
            <div class="widget-actions">
              <!-- 组件设置按钮 -->
              <el-button
                type="primary"
                size="small"
                icon="el-icon-setting"
                @click.stop="showWidgetSettings"
                >设置
              </el-button>

              <!-- 重新选择样式按钮 -->
              <el-button
                type="success"
                size="small"
                icon="el-icon-refresh"
                @click.stop="selectWidget"
                >重新选择
              </el-button>
              
              <!-- 移除组件按钮 -->
              <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click.stop="removeWidget"
                >移除
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 节点为空并且没有子节点的情况 -->
      <div 
        v-else-if="!node.children || node.children.length === 0" 
        class="empty-node" 
        @click="selectWidget"
      >
        <i class="el-icon-plus"></i>
        <span>添加组件</span>
      </div>
      
      <!-- 有子节点的情况 -->
      <div
        v-else
        :class="node.type === 'row' && hasColumnChildren ? 'column-container' : 'row-container'"
      >
        <!-- 渲染子节点 -->
        <layout-node
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 12"
          :style="getChildStyle(child)"
          @add-row="onAddRow"
          @add-column="onAddColumn"
          @delete-node="onDeleteNode"
          @select-widget="onSelectWidget"
          @move-row="onMoveRow"
        >
        </layout-node>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import WidgetRegistry from "../../services/widget-registry";
import { 
  PRESET_OPTIONS, 
  validateRatio, 
  generateColumnNodes, 
  detectColumnPreset 
} from "@/utils/column-preset";

export default {
  name: "LayoutNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isHovered: false,
      columnPreset: "none",
      presetOptions: PRESET_OPTIONS,
      customRatio: "",
      showCustomInput: false,
    };
  },
  computed: {
    hasColumnChildren() {
      return (
        this.node.children &&
        this.node.children.some((child) => child.type === "column")
      );
    },
    nodeStyle() {
      const style = { position: "relative" };

      // 设置宽度
      if (this.node.width) {
        style.width = this.node.width;
      }

      // 列节点宽度样式
      if (this.node.type === "column") {
        if (this.node.percentWidth) {
          style.width = this.node.percentWidth;
          style.flex = `0 0 ${this.node.percentWidth}`;
        } else if (this.node.span) {
          style.flex = `${this.node.span} 0 0%`;
          style.width = `${this.node.span * 10}%`;
        }
        style.flexShrink = "0";
      }

      // 行节点高度比例
      if (this.node.type === "row" && this.node.flexRatio) {
        style.flex = `${this.node.flexRatio} 0 auto`;
      }

      return style;
    },
    // 节点内容样式
    nodeContentStyle() {
      const style = {};
      
      if (this.node.height) {
        style.height = this.node.height.match(/^\d+$/)
          ? `${this.node.height}px`
          : this.node.height;
        style.overflow = "hidden";
        style.minHeight = "0";
      } else {
        style.minHeight = "0px";
      }
      
      return style;
    },
  },
  created() {
    this.initColumnPreset();
  },
  methods: {
    handleMouseEnter() {
      this.isHovered = true;
    },
    handleMouseLeave() {
      this.isHovered = false;
    },
    deleteNode() {
      this.$emit("delete-node", this.node.id);
    },
    selectWidget() {
      this.$emit("select-widget", this.node.id);
    },
    showWidgetSettings() {
      const widgetComponent = this.$refs.widgetComponent;

      if (
        widgetComponent &&
        typeof widgetComponent.showSettingDialog === "function"
      ) {
        widgetComponent.showSettingDialog((newConfig) => {
          const node = this.node;
          if (node && node.widget) {
            node.widget.config = { ...newConfig };
            this.$root.$emit("layout-updated");
          }
        });
      }
    },
    moveRowUp() {
      this.$emit("move-row", { id: this.node.id, direction: "up" });
    },
    moveRowDown() {
      this.$emit("move-row", { id: this.node.id, direction: "down" });
    },
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    initColumnPreset() {
      if (
        this.node.type !== "row" ||
        !this.node.children ||
        this.node.children.length === 0
      ) {
        this.columnPreset = "none";
        return;
      }

      const columnChildren = this.node.children.filter(
        (child) => child.type === "column"
      );
      if (columnChildren.length !== this.node.children.length) {
        this.columnPreset = "none";
        return;
      }

      this.columnPreset = detectColumnPreset(columnChildren);
    },
    handleHeightChange() {
      this.$root.$emit("layout-updated");
    },
    handlePresetChange(val) {
      this.columnPreset = val;
      
      if (val === "custom") {
        this.showCustomInput = true;
        return;
      } else {
        this.showCustomInput = false;
      }
      
      const parent = this.node;
      
      switch (val) {
        case "none":
          parent.children = [];
          break;
          
        default:
          this.applyColumnPreset(val, parent);
          break;
      }
      
      this.$root.$emit("layout-updated");
    },
    handleCustomRatioChange() {
      if (!validateRatio(this.customRatio)) {
        this.$message.warning("请输入有效的比例格式，如 1:2 或 1:2:1");
        return;
      }
      
      this.applyColumnPreset(this.customRatio, this.node);
      this.$root.$emit("layout-updated");
    },
    applyColumnPreset(preset, parent) {
      parent.children = generateColumnNodes(preset, parent.id, uuidv4);
    },
    getChildStyle(child) {
      if (child.type === "column") {
        return {
          flex: child.percentWidth
            ? `0 0 ${child.percentWidth}`
            : `${child.span} 0 0`,
          width: child.percentWidth || `${child.span * 10}%`,
          minWidth: child.percentWidth || `${child.span * 10}%`,
        };
      }
      return {};
    },
    onAddRow(parentId) {
      this.$emit("add-row", parentId);
    },
    onAddColumn(parentId) {
      this.$emit("add-column", parentId);
    },
    onDeleteNode(nodeId) {
      this.$emit("delete-node", nodeId);
    },
    onSelectWidget(nodeId) {
      this.$emit("select-widget", nodeId);
    },
    onMoveRow(data) {
      this.$emit("move-row", data);
    },
    removeWidget() {
      // 移除当前节点的组件
      if (this.node && this.node.widget) {
        this.$delete(this.node, 'widget');
        this.$delete(this.node, 'columnId');
        this.$delete(this.node, 'columnName');
        this.$delete(this.node, 'hasWidget');
        this.$root.$emit("layout-updated");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 主容器样式
.layout-node {
  position: relative;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  margin: 0;
  transition: all 0.3s;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // 悬停状态
  &.is-hovered {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  // 深度层级颜色
  &.depth-0 {
    background-color: #f6f8fc;
  }
  &.depth-12 {
    background-color: #edf2fa;
  }

  // 行节点样式
  &.node-row {
    border-left: 4px solid #67c23a;
    width: 100%;
    background-color: rgba(103, 194, 58, 0.05);

    &.is-hovered {
      background-color: rgba(103, 194, 58, 0.1);
      border-color: #67c23a;
    }
  }

  // 列节点样式
  &.node-column {
    border-left: 4px solid #409eff;
    // height: 100%;
    background-color: rgba(64, 158, 255, 0.05);
    border-top: 1px dashed #409eff;
    border-bottom: 1px dashed #409eff;

    &.is-hovered {
      background-color: rgba(64, 158, 255, 0.1);
      border-color: #409eff;
    }
    
  }
}

// 节点头部通用样式
.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px dashed #ebeef5;

  // 标题样式
  .node-title {
    display: flex;
    align-items: center;

    i {
      margin-right: 0;
      font-size: 16px;
    }
  }

  // 控制区域
  .node-controls {
    display: flex;
    gap: 8px;
    align-items: center;

    // 行设置区域
    .row-settings {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-right: 10px;

      .setting-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .setting-label {
          font-size: 13px;
          color: #606266;
          white-space: nowrap;
        }

        .el-input {
          min-width: 120px;
        }

        .el-select {
          min-width: 150px;
        }
      }
    }

    // 操作按钮区域
    .action-buttons {
      display: flex;
      align-items: center;
      margin-left: auto;
      
      .move-button {
        color: #409eff;
        margin-right: 5px;
      }
      
      .delete-button {
        color: #f56c6c;
      }
    }
  }
}

// 节点内容区域
.node-content {
  padding: 0px;
  flex: 1;
  overflow: hidden;

  &[style*="height"] {
    flex: none;
  }
}

// 空节点样式
.empty-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  height: 100%;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9f9f9;

  &:hover {
    background-color: #ecf5ff;
    border-color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  i {
    font-size: 28px;
    margin-bottom: 10px;
    color: #409eff;
  }

  span {
    color: #606266;
    font-weight: 500;
  }
}

// 空容器样式
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-style: italic;
  border: 1px dashed #dcdfe6;
}

// 组件样式
.node-widget {
  height: 100%;
  position: relative;
  border-radius: 8px;
  background-color: #fff;
}

// 组件预览
.widget-preview {
  height: 100%;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  position: relative;

  .preview-component {
    width: 100%;
    height: 100%;
  }

  .widget-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 10;

    .widget-actions {
      display: flex;
      gap: 10px;

      .el-button {
        border-radius: 4px;
      }
    }
  }

  &:hover .widget-overlay {
    opacity: 1;
  }
}

// 容器通用样式
.row-container,
.column-container {
  min-height: 60px;
  width: 100%;
  height: 100%;
}

// 行容器样式
.row-container {
  display: flex;
  flex-direction: column;

  & > .layout-node {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 列容器样式
.column-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;

  & > .layout-node {
    min-width: 50px;
    flex-grow: 0;
    flex-shrink: 0;
  }
}
</style>
