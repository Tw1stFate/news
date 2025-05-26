<template>
  <div
    :class="[
      'layout-node',
      `node-${node.type}`,
      `depth-${depth}`,
      {
        'is-hovered': isHovered,
        'is-leaf': isLeafNode,
        'has-widget': !!node.widget,
      },
    ]"
    :style="nodeStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 节点头部 -->
    <div class="node-header">
      <!-- 行布局显示完整header，列布局显示精简header -->
      <div v-if="node.type === 'row'" class="node-title">
        <i class="el-icon-menu" style="margin-right: 5px; font-size: 16px"></i>
        <span>行布局</span>
        <span v-if="node.widget"> - {{ node.widget.name }}</span>
        <span v-if="node.height" class="node-height"
          >高度: {{ node.height }}</span
        >
      </div>
      <div v-else class="node-title column-title">
        <i
          class="el-icon-s-grid"
          style="margin-right: 5px; font-size: 16px"
        ></i>
        <span>列布局</span>
      </div>

      <div class="node-controls">
        <!-- 对于行布局，添加行高输入框和列配置 -->
        <div v-if="node.type === 'row'" class="row-settings">
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
            v-if="node.type === 'row'"
            type="text"
            size="mini"
            icon="el-icon-arrow-up"
            style="color: #409eff; margin-right: 5px"
            @click.stop="moveRowUp"
          >
          </el-button>

          <!-- 行布局的下移按钮 -->
          <el-button
            v-if="node.type === 'row'"
            type="text"
            size="mini"
            icon="el-icon-arrow-down"
            style="color: #409eff; margin-right: 5px"
            @click.stop="moveRowDown"
          >
          </el-button>

          <!-- 不是根节点时显示删除按钮 -->
          <el-button
            v-if="!isRoot"
            type="text"
            size="mini"
            icon="el-icon-delete"
            style="color: #f56c6c"
            @click="deleteNode"
          >
          </el-button>
        </div>
      </div>
    </div>

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 叶子节点内容 -->
      <div v-if="isLeafNode" class="node-widget" v-show="shouldShowContent">
        <div v-if="node.widget" class="widget-preview">
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
            <div class="widget-name">{{ node.widget.name }}</div>
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
                >选择样式
              </el-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-node" @click="selectWidget">
          <i class="el-icon-plus"></i>
          <span>添加组件</span>
        </div>
      </div>

      <!-- 非叶子节点内容 - 子节点容器 -->
      <template v-else>
        <!-- 空容器显示 -->
        <div
          v-if="!node.children || node.children.length === 0"
          class="empty-container"
        >
          <span>{{
            node.type === "row" ? "可添加行或列布局" : "可添加行布局"
          }}</span>
        </div>

        <!-- 子节点容器 -->
        <div
          v-else
          :class="
            hasColumnChildren && node.type === 'row'
              ? 'column-container'
              : node.type === 'row'
              ? 'row-container'
              : 'column-container'
          "
          :style="containerStyle"
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
      </template>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import WidgetRegistry from "@/services/widget-registry";
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
      // 列配置预设选项
      columnPreset: "none",
      // 预设选项列表
      presetOptions: PRESET_OPTIONS,
      // 自定义比例
      customRatio: "",
      showCustomInput: false,
    };
  },
  computed: {
    isLeafNode() {
      return !this.node.children || this.node.children.length === 0;
    },
    shouldShowContent() {
      // 如果是叶子节点或者有组件，始终显示内容
      return this.isLeafNode || this.node.widget;
    },
    isRow() {
      return this.node.type === "row";
    },
    hasColumnChildren() {
      return (
        this.node.children &&
        this.node.children.some((child) => child.type === "column")
      );
    },
    nodeStyle() {
      const style = {};

      // 设置高度
      if (this.node.height) {
        style.height = this.node.height.match(/^\d+$/)
          ? `${this.node.height}px`
          : this.node.height;
      }

      // 设置宽度
      if (this.node.width) {
        style.width = this.node.width;
      }

      // 列节点宽度样式
      if (this.node.type === "column") {
        if (this.node.percentWidth) {
          // 使用精确的百分比宽度
          style.width = this.node.percentWidth;
          style.flex = `0 0 ${this.node.percentWidth}`;
        } else if (this.node.span) {
          // 向后兼容，为老数据使用span
          style.flex = `${this.node.span} 0 0%`;
          style.width = `${this.node.span * 10}%`;
        }
        // 防止列被挤压
        style.flexShrink = "0";
      }

      // 行节点高度比例（如果设置了flexRatio）
      if (this.node.type === "row" && this.node.flexRatio) {
        style.flex = `${this.node.flexRatio} 0 auto`;
      }

      // 通用样式
      style.position = "relative";

      return style;
    },
    containerStyle() {
      const style = {
        display: "flex",
        flexDirection:
          this.node.type === "row" && this.hasColumnChildren
            ? "row"
            : this.node.type === "row"
            ? "column"
            : "row",
        flexWrap: "nowrap",
        width: "100%",
        gap: "0px",
        overflow: "hidden",
      };

      return style;
    },
  },
  created() {
    // 初始化列配置值
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
      // 尝试获取组件实例
      const widgetComponent = this.$refs.widgetComponent;

      // 如果组件实例存在并且有showSettingDialog方法，直接调用
      if (
        widgetComponent &&
        typeof widgetComponent.showSettingDialog === "function"
      ) {
        // 传递回调函数用于接收配置更新
        widgetComponent.showSettingDialog((newConfig) => {
          // 获取当前节点
          const node = this.node;
          if (node && node.widget) {
            // 更新组件配置
            node.widget.config = { ...newConfig };

            // 触发布局更新
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
    // 获取组件实例
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    // 初始化列配置值
    initColumnPreset() {
      // 如果不是行节点或没有子节点，使用默认值"none"
      if (
        this.node.type !== "row" ||
        !this.node.children ||
        this.node.children.length === 0
      ) {
        this.columnPreset = "none";
        return;
      }

      // 检查子节点是否都是列
      const columnChildren = this.node.children.filter(
        (child) => child.type === "column"
      );
      if (columnChildren.length !== this.node.children.length) {
        this.columnPreset = "none";
        return;
      }

      // 使用工具类检测预设类型
      this.columnPreset = detectColumnPreset(columnChildren);
    },
    // 处理高度变更
    handleHeightChange() {
      // 触发布局更新
      this.$root.$emit("layout-updated");
    },
    // 处理列预设变更
    handlePresetChange(val) {
      this.columnPreset = val;
      
      // 如果是自定义，显示输入框
      if (val === "custom") {
        this.showCustomInput = true;
        return;
      } else {
        this.showCustomInput = false;
      }
      
      // 获取父节点引用
      const parent = this.node;
      
      // 根据选择的预设处理
      switch (val) {
        case "none":
          // 不分列 - 清除现有的列节点
          parent.children = [];
          break;
          
        default:
          // 使用预设列配置 (1:1, 1:1:1, 1:2:1, 1:2)
          this.applyColumnPreset(val, parent);
          break;
      }
      
      // 触发布局更新
      this.$root.$emit("layout-updated");
    },
    // 处理自定义比例变更
    handleCustomRatioChange() {
      // 验证输入格式
      if (!validateRatio(this.customRatio)) {
        this.$message.warning("请输入有效的比例格式，如 1:2 或 1:2:1");
        return;
      }
      
      // 应用自定义比例
      this.applyColumnPreset(this.customRatio, this.node);
      
      // 触发布局更新
      this.$root.$emit("layout-updated");
    },
    // 应用列预设配置
    applyColumnPreset(preset, parent) {
      // 使用工具类生成列节点
      parent.children = generateColumnNodes(preset, parent.id, uuidv4);
    },
    // 子节点样式计算
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
    // 事件传递方法
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
  },
};
</script>

<style lang="scss" scoped>
.layout-node {
  position: relative;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  margin: 0;
  transition: all 0.3s;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;

  // 确保高度可以生效
  &[style*="height"] {
    display: flex;
    flex-direction: column;

    .node-content {
      flex: 1;
      overflow: auto;
    }
  }

  &.is-hovered {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  // 不同深度层级颜色区分 - 简化为两种深度
  &.depth-0 {
    background-color: #f6f8fc;
  }

  &.depth-12 {
    background-color: #edf2fa;
  }

  &.node-row {
    border-left: 4px solid #67c23a;
    width: 100%;
    background-color: rgba(103, 194, 58, 0.05);

    &.is-hovered {
      background-color: rgba(103, 194, 58, 0.1);
      border-color: #67c23a;
    }

    .node-header {
      background-color: rgba(103, 194, 58, 0.08);

      .node-title {
        i {
          color: #67c23a;
        }
      }
    }
  }

  &.node-column {
    border-left: 4px solid #409eff;
    height: 100%;
    background-color: rgba(64, 158, 255, 0.05);
    border-top: 1px dashed #409eff;
    border-bottom: 1px dashed #409eff;

    &.is-hovered {
      background-color: rgba(64, 158, 255, 0.1);
      border-color: #409eff;
    }

    .node-header {
      padding: 4px 8px;
      background-color: rgba(64, 158, 255, 0.1);
      border-bottom: 1px dashed #c9e0ff;

      .node-controls {
        display: flex;
        justify-content: flex-end;

        .action-buttons {
          display: flex;
          margin-left: 0;
        }
      }
    }
  }

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px dashed #ebeef5;

    .node-title {
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 16px;
      }

      .node-height {
        margin-left: 10px;
        font-size: 12px;
        color: #909399;
        font-style: italic;
      }

      &.column-title {
        font-size: 13px;
        color: #409eff;

        i {
          color: #409eff;
          font-size: 14px;
        }
      }
    }

    .node-controls {
      display: flex;
      gap: 8px;
      align-items: center;

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

      .action-buttons {
        display: flex;
        align-items: center;
        margin-left: auto;
      }
    }
  }

  .node-content {
    padding: 8px;
    min-height: 80px;
    display: block;
    opacity: 1;
    visibility: visible;

    .empty-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
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

    .node-widget {
      display: block;
      padding: 0;
      margin: 0;
      background-color: #fff;
      border-radius: 8px;
      position: relative;

      .widget-preview {
        display: block;
        min-height: 100px;
        background-color: #fff;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #ebeef5;
        position: relative;

        .preview-component {
          width: 100%;
          height: 100%;
          display: block;
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

          .widget-name {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
          }

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
    }
  }

  // 行容器样式
  .row-container {
    display: flex;
    flex-direction: column;
    gap: 0px;
    min-height: 60px;
    width: 100%;
    padding: 0;
    margin: 0;

    & > .layout-node {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // 列容器样式 - 行中的列容器
  .column-container {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 0px;
    width: 100%;
    min-height: 60px;
    padding: 0;
    margin: 0;
    align-items: stretch;

    & > .layout-node {
      min-width: 50px;
      flex-grow: 0 !important;
      flex-shrink: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      display: block !important;
      float: none !important;
    }
  }
}

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
  margin: 0;
  padding: 0;
}
</style>
