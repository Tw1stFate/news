<template>
  <div class="layout-editor">
    <el-header height="60px" class="editor-header">
      <div class="header-controls">
        <div class="left-area">
        <h2>新闻门户布局编辑器</h2>
        </div>
        <div class="right-area">
          <el-button-group class="action-group">
            <el-button
              type="primary"
              icon="el-icon-check"
              @click="saveLayout"
              :loading="saving"
              >保存</el-button
            >
            <el-button type="success" icon="el-icon-view" @click="showPreview"
              >预览</el-button
            >
          </el-button-group>
          
          <el-button-group class="action-group">
            <el-button type="info" icon="el-icon-download" @click="exportLayout"
              >导出</el-button
            >
            <el-button
              type="info"
              icon="el-icon-upload2"
              @click="openImportDialog"
              >导入</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-question"
              @click="handleExport('help')"
              >帮助</el-button
            >
            <el-button type="danger" icon="el-icon-delete" @click="resetLayout"
              >重置</el-button
            >
          </el-button-group>
        </div>
      </div>
    </el-header>

    <div class="editor-main">
      <div class="editor-content">
        <!-- 初始空布局状态 -->
        <div v-if="!rootNode" class="empty-layout">
          <el-empty description="布局为空，点击下方的按钮开始设计">
            <template #image>
              <i class="el-icon-s-grid"></i>
            </template>
            <el-button type="primary" @click="createRootNode"
              >创建布局</el-button
            >
          </el-empty>
        </div>

        <!-- 布局树结构显示 -->
        <template v-else>
          <div class="layout-root">
            <div class="layout-container">
              <!-- 使用v-for遍历根节点下的所有布局 -->
              <div v-for="node in rootNode.children" :key="node.id">
                <layout-node 
                  :node="node" 
                  :depth="0"
                  @delete-node="handleDeleteNode"
                  @select-widget="handleSelectWidget"
                  @move-row="handleMoveRow"
                />
            </div>

              <!-- 快速添加行布局 -->
              <div class="add-layout-controls">
                <quick-layout-form
                  :default-config="quickRowConfig"
                  @add-rows="quickAddRows"
                  @update:config="updateQuickConfig"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
                      </div>

    <!-- 选择组件对话框 -->
    <widget-selector
      :visible.sync="widgetDialogVisible"
      :nodeId="selectedNodeId"
      @confirm="handleWidgetConfirm"
      @close="handleCloseWidgetDialog"
    />

    <!-- 布局预览对话框 -->
    <preview-dialog
      :visible.sync="previewDialogVisible"
      :layout-tree="previewLayoutTree"
    />

    <!-- 导入布局对话框 -->
    <import-dialog :visible.sync="importDialogVisible" @import="importLayout" />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import WidgetRegistry from "@/services/widget-registry";
import api from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import LayoutUtils from "@/utils/layout-utils";
import { generateColumnNodes } from "@/utils/column-preset";
import LayoutNode from "@/views/components/LayoutNode.vue";
import WidgetSelector from "@/views/WidgetSelector.vue";
import PreviewDialog from "@/views/components/PreviewDialog.vue";
import ImportDialog from "@/views/components/ImportDialog.vue";
import QuickLayoutForm from "@/views/components/QuickLayoutForm.vue";

export default {
  name: "LayoutEditor",
  components: {
    LayoutNode,
    WidgetSelector,
    PreviewDialog,
    ImportDialog,
    QuickLayoutForm,
  },
  data() {
    return {
      rootNode: null,
      saving: false,
      widgetDialogVisible: false,
      selectedNodeId: null,
      previewDialogVisible: false,
      previewLayoutTree: null,
      importDialogVisible: false,
      quickRowConfig: {
        rows: 1,
        columnPreset: "none",
        customRatio: "1:2:1",
        height: "",
        columnWidths: [],
      },
    };
  },
  computed: {
    ...mapState("column", ["columns"]),
    ...mapState("layout", ["layoutTree"]),
    
    // 获取所有widgets
    widgets() {
      return WidgetRegistry.getDefaultWidgets();
    },
  },
  watch: {
    // 监听vuex中的布局树变化
    layoutTree: {
      handler(newVal) {
        if (
          newVal &&
          (!this.rootNode ||
            JSON.stringify(newVal) !== JSON.stringify(this.rootNode))
        ) {
          console.log("检测到vuex中的布局树变化，正在更新...");
          // 深拷贝以确保不共享引用
          this.rootNode = JSON.parse(JSON.stringify(newVal));

          // 检查是否有组件的叶子节点
          this.markNodesWithComponents(this.rootNode);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    // 加载栏目数据
    this.fetchColumns();
    this.fetchCategories();

    // 尝试从vuex加载已保存的布局
    this.loadLayoutTree().then((layoutTree) => {
      if (layoutTree) {
        this.rootNode = layoutTree;
      }
    });
  },
  mounted() {
    // 监听布局更新事件
    this.$root.$on("layout-updated", () => {
      // 保存布局树
      this.saveLayoutTree(this.rootNode);
    });
  },
  beforeDestroy() {
    // 移除布局更新事件监听
    this.$root.$off("layout-updated");
  },
  methods: {
    ...mapActions("column", ["fetchColumns", "fetchCategories"]),
    ...mapActions("layout", ["saveLayoutTree", "loadLayoutTree"]),
    
    // 创建根节点
    createRootNode() {
      // 使用UUID创建唯一ID
      const containerId = uuidv4();
      const rowId = uuidv4();
      
      this.rootNode = {
        id: containerId,
        type: "container", // 根节点作为容器
        children: [], // 初始化空的children数组
      };
      
      // 添加一个行布局作为首个子节点
      this.rootNode.children.push({
        id: rowId,
        type: "row", // 确保是行布局
        height: "", // 可设置高度
        width: "100%", // 明确设置宽度为100%
        parent: containerId, // 设置父节点
        children: [],
      });
      
      // 保存到vuex
      this.saveLayoutTree(this.rootNode);
    },
    
    // 删除节点
    handleDeleteNode(nodeId) {
      const deleteNode = (node, id) => {
        if (!node || !node.children) return false;
        
        const index = node.children.findIndex((child) => child.id === id);
        if (index >= 0) {
          node.children.splice(index, 1);
          return true;
        }
        
        for (let i = 0; i < node.children.length; i++) {
          if (deleteNode(node.children[i], id)) {
            return true;
          }
        }
        
        return false;
      };
      
      deleteNode(this.rootNode, nodeId);
      this.saveLayoutTree(this.rootNode); // 保存修改后的布局
    },
    
    // 处理节点选择组件
    handleSelectWidget(nodeId) {
      this.selectedNodeId = nodeId;
      this.widgetDialogVisible = true;
    },
    
    // 关闭组件选择对话框
    handleCloseWidgetDialog() {
      this.widgetDialogVisible = false;
      this.selectedNodeId = null;
    },
    
    // 处理组件选择确认
    handleWidgetConfirm(data) {
      const { nodeId, widget, columnId } = data;
      
      // 使用Vue.set确保响应式更新
      const node = this.findNodeById(this.rootNode, nodeId);
      if (node) {
        // 验证组件类型是否可用
        const component = WidgetRegistry.get(widget.type);
        if (!component) {
          this.$message.error(`组件类型 "${widget.type}" 未注册，无法使用`);
          return;
        }
        
        const column = this.columns.find((c) => c.id === columnId);
        
        // 深拷贝组件对象
        const widgetCopy = JSON.parse(JSON.stringify(widget));
        
        // 确保config中不包含items属性
        if (widgetCopy.config && "items" in widgetCopy.config) {
          console.log("移除组件配置中的items属性:", widgetCopy.config.items);
          delete widgetCopy.config.items;
        }
        
        console.log("保存组件数据(已清理items):", widgetCopy);
        
        // 使用Vue的响应式更新机制
        this.$set(node, "widget", widgetCopy);
        this.$set(node, "columnId", columnId);
        this.$set(node, "columnName", column ? column.name : "");
        this.$set(node, "hasWidget", true); // 明确标记有组件
        
        // 创建新的根节点引用来触发完整更新
        const newRootNode = JSON.parse(JSON.stringify(this.rootNode));
        
        // 更新本地状态
        this.rootNode = null; // 先设为null强制刷新
        this.$nextTick(() => {
          this.rootNode = newRootNode;
          
          // 保存到vuex
          console.log("保存到布局树:", newRootNode);
          this.saveLayoutTree(newRootNode);
          
          // 显示成功消息
          this.$message.success("组件关联成功");
        });
      }
    },
    
    // 通过ID查找节点
    findNodeById(node, id) {
      if (!node) return null;
      if (node.id === id) return node;
      
      if (node.children) {
        for (const child of node.children) {
          const found = this.findNodeById(child, id);
          if (found) return found;
        }
      }
      
      return null;
    },
    
    // 获取组件
    getWidgetComponent(type) {
      return WidgetRegistry.get(type);
    },
    
    // 保存布局
    async saveLayout() {
      this.saving = true;
      try {
        await api.saveLayout({ layoutTree: this.rootNode });
        this.saveLayoutTree(this.rootNode); // 保存到vuex
        this.$message.success("布局保存成功");
      } catch (error) {
        this.$message.error("保存失败: " + error.message);
      } finally {
        this.saving = false;
      }
    },
    
    // 重置布局
    resetLayout() {
      this.$confirm("确定要重置布局吗？所有未保存的布局更改将丢失。", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
        this.rootNode = null;
        this.saveLayoutTree(null); // 清空vuex中的布局
          this.$message.success("布局已重置");
        })
        .catch(() => {});
    },
    
    // 处理导出相关操作
    handleExport(command) {
      if (command === "export") {
        this.exportLayout();
      } else if (command === "import") {
        this.openImportDialog();
      } else if (command === "help") {
        this.$alert(
          `<p>布局编辑器使用说明：</p>
          <ol>
            <li>点击<b>创建布局</b>按钮初始化一个行布局</li>
            <li>通过<b>添加行布局</b>按钮可以添加更多行</li>
            <li>在行布局中可以添加<b>行布局</b>或<b>列布局</b></li>
            <li>添加列布局时可以设置宽度比例(如5:5表示等宽两列)</li>
            <li>任何布局都可以设置高度(如200px)</li>
            <li>在叶子节点可以<b>选择组件</b>并关联新闻栏目</li>
            <li>完成后点击<b>保存布局</b>保存您的设计</li>
            <li>可以使用<b>导出</b>功能将布局保存为JSON文件</li>
            <li>使用<b>导入</b>功能可以加载已保存的布局配置</li>
          </ol>`,
          "使用帮助",
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "知道了",
          }
        );
      }
    },
    
    // 导出布局配置
    async exportLayout() {
      try {
        // 使用工具类导出布局
        const success = await LayoutUtils.exportLayoutToFile(this.rootNode);
        
        if (success) {
          this.$message.success("布局配置已导出");
        } else {
          this.$message.error("导出失败");
        }
      } catch (error) {
        this.$message.error("导出失败: " + error.message);
      }
    },
    
    // 打开导入对话框
    openImportDialog() {
      this.importDialogVisible = true;
    },
    
    // 导入布局
    async importLayout(file) {
      // 设置导入中状态
      const loadingInstance = this.$loading({
        lock: true,
        text: "正在解析布局文件...",
        spinner: "el-icon-loading",
        background: "rgba(255, 255, 255, 0.7)",
      });
      
      try {
        // 使用工具类导入布局
        let layoutTree = await LayoutUtils.importLayoutFromFile(file);
        
        // 更新加载提示
        loadingInstance.text = "验证布局数据...";
        
        // 确认导入操作
        try {
          await this.$confirm(
            "导入将覆盖当前布局，确定要继续吗？",
            "确认导入",
            {
              confirmButtonText: "确定导入",
              cancelButtonText: "取消",
              type: "warning",
            closeOnClickModal: false,
              closeOnPressEscape: false,
            }
          );
        } catch (e) {
          // 用户取消导入
          console.log("用户取消导入");
          loadingInstance.close();
          return;
        }
        
        // 使用工具类修复布局样式
        layoutTree = LayoutUtils.fixLayoutNodeStyles(layoutTree);
        
        // 更新加载提示
        loadingInstance.text = "正在应用布局...";
        
        // 确保所有节点的widget和columnId属性正确设置
        this.repairImportedLayout(layoutTree);
        
        // 使用nextTick和setTimeout确保UI完全更新
        this.$nextTick(() => {
          setTimeout(() => {
            try {
              // 更新布局树
              this.rootNode = null; // 先设置为null触发完整重绘
              
              this.$nextTick(() => {
                this.rootNode = layoutTree;
                
                // 保存到vuex
                this.saveLayoutTree(layoutTree);
                
                // 关闭加载提示
                loadingInstance.close();
                
                this.$message.success("布局导入成功");
                this.importDialogVisible = false;
              });
            } catch (error) {
              console.error("应用布局错误:", error);
              loadingInstance.close();
              this.$message.error("应用布局失败: " + error.message);
            }
          }, 300); // 短暂延迟确保DOM已更新
        });
      } catch (error) {
        // 关闭加载提示
        loadingInstance.close();
        
        console.error("导入布局失败:", error);
        this.$message.error({
          message: error.message || "导入失败",
          duration: 5000,
          showClose: true,
        });
      }
    },

    // 修复导入的布局，确保组件和栏目引用正确
    repairImportedLayout(layoutTree) {
      const processNode = (node) => {
        // 检查节点是否有组件
      if (node.widget) {
          const component = WidgetRegistry.get(node.widget.type);
          if (!component) {
            // 组件不存在，清除组件相关属性
            console.warn(
              `导入的布局包含未知组件类型: ${node.widget.type}，已清除`
            );
          delete node.widget;
            delete node.columnId;
            delete node.columnName;
          delete node.hasWidget;
        } else {
            // 组件存在，确保hasWidget属性设置
            node.hasWidget = true;
          
          // 检查关联的栏目是否存在
            if (node.columnId) {
              const existingColumn = this.columns.find(
                (c) => c.id === node.columnId
              );
              if (!existingColumn) {
                // 栏目不存在，清除columnId但保留组件
                console.warn(
                  `导入的布局关联了未知栏目ID: ${node.columnId}，已清除`
                );
                delete node.columnId;
                delete node.columnName;
            } else {
              // 更新栏目名称，确保与当前系统匹配
                node.columnName = existingColumn.name;
              }
            }
        }
      }
      
      // 递归处理子节点
      if (node.children && node.children.length > 0) {
          node.children.forEach((child) => processNode(child));
        }
      };

      // 从根节点开始处理
      processNode(layoutTree);
    },

    // 显示布局预览
    showPreview() {
      if (
        !this.rootNode ||
        !this.rootNode.children ||
        !this.rootNode.children.length
      ) {
        this.$message.warning("布局为空，请先创建布局");
        return;
      }
      
      // 检查布局中是否有组件
      const hasWidgets = this.checkForWidgets(this.rootNode);
      console.log("准备预览，布局中包含组件:", hasWidgets);
      console.log("预览布局树:", JSON.stringify(this.rootNode, null, 2));
      
      this.previewLayoutTree = JSON.parse(JSON.stringify(this.rootNode));
      this.previewDialogVisible = true;
    },

    // 检查节点及其子节点中是否有组件
    checkForWidgets(node) {
      if (!node) return false;
      
      // 当前节点有组件
      if (node.widget) {
        console.log("找到组件:", node.widget.name, node.widget.type);
        return true;
      }
      
      // 递归检查子节点
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (this.checkForWidgets(child)) {
            return true;
          }
        }
      }
      
      return false;
    },

    // 校正列宽度，确保总和为10
    adjustColumnSpans(columns) {
      // 只处理列节点
      const columnNodes = columns.filter((node) => node.type === "column");
      if (columnNodes.length === 0) return;
      
      // 计算当前span总和
      const totalSpan = columnNodes.reduce(
        (sum, col) => sum + (col.span || 0),
        0
      );
      
      // 如果总和不是10，进行校正
      if (totalSpan !== 10) {
        // 计算校正因子
        const factor = 10 / totalSpan;
        
        // 记录累计校正结果
        let assignedSpan = 0;
        
        // 为每列分配校正后的span值
        for (let i = 0; i < columnNodes.length - 1; i++) {
          const rawSpan = columnNodes[i].span * factor;
          const newSpan = Math.round(rawSpan);
          columnNodes[i].span = newSpan;
          assignedSpan += newSpan;
        }
        
        // 最后一列应该是10减去前面所有列的span总和
        columnNodes[columnNodes.length - 1].span = 10 - assignedSpan;
      }
    },

    // 更新快速配置
    updateQuickConfig(config) {
      this.quickRowConfig = config;
    },
    
    // 快速添加行布局
    quickAddRows(config) {
      if (!this.rootNode) {
        this.createRootNode();
      }
      
      if (!this.rootNode.children) {
        this.rootNode.children = [];
      }
      
      // 获取行数
      const rowCount = config.rows || 1;
      
      // 创建行
      for (let i = 0; i < rowCount; i++) {
        const rowNode = {
          id: uuidv4(),
          type: "row",
          height: config.height ? `${config.height}px` : "",
          width: "100%",
          parent: this.rootNode.id,
          children: [],
        };
        
        // 如果需要添加列
        if (config.columnPreset !== "none" && config.columnWidths.length > 0) {
          // 获取列配置
          const preset = config.columnPreset === "custom" ? config.customRatio : config.columnPreset;
          
          // 使用工具类生成列节点
          rowNode.children = generateColumnNodes(preset, rowNode.id, uuidv4);
          
          // 确保span总和为10
          this.adjustColumnSpans(rowNode.children);
        }
        
        // 添加行到根节点
        this.rootNode.children.push(rowNode);
      }
      
      // 保存布局
      this.saveLayoutTree(this.rootNode);
      
      // 显示提示
      this.$message.success(`已添加${rowCount}行布局`);
    },
    
    // 处理行移动
    handleMoveRow(data) {
      const { id, direction } = data;
      
      // 找到行节点及其父节点
      const findNodeWithParent = (nodeId, tree, parent = null) => {
        if (!tree) return { node: null, parent: null };
        
        if (tree.id === nodeId) {
          return { node: tree, parent };
        }
        
        if (tree.children && tree.children.length > 0) {
          for (const child of tree.children) {
            const result = findNodeWithParent(child.id, child, tree);
            if (result.node) {
              return result;
            }
          }
        }
        
        return { node: null, parent: null };
      };
      
      const { node, parent } = findNodeWithParent(id, this.rootNode);
      
      if (!node || !parent || node.type !== "row") {
        this.$message.warning("无法移动：找不到行节点或父节点");
        return;
      }
      
      // 找到节点在父节点children中的索引
      const index = parent.children.findIndex((child) => child.id === id);
      if (index === -1) {
        this.$message.warning("无法移动：节点不在父节点的子节点列表中");
        return;
      }
      
      // 计算目标索引
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      
      // 检查边界
      if (targetIndex < 0 || targetIndex >= parent.children.length) {
        this.$message.warning(
          `已经在${direction === "up" ? "最顶部" : "最底部"}，无法继续${
            direction === "up" ? "上移" : "下移"
          }`
        );
        return;
      }
      
      // 交换位置
      const temp = parent.children[index];
      parent.children[index] = parent.children[targetIndex];
      parent.children[targetIndex] = temp;
      
      // 创建新的根节点引用来触发完整更新
      const newRootNode = JSON.parse(JSON.stringify(this.rootNode));
      
      // 更新本地状态
      this.rootNode = null; // 先设为null强制刷新
      this.$nextTick(() => {
        this.rootNode = newRootNode;
        
        // 保存修改后的布局
        this.saveLayoutTree(this.rootNode);
        this.$message.success(`行已${direction === "up" ? "上移" : "下移"}`);
      });
    },
    
    // 遍历树并标记有组件的节点
    markNodesWithComponents(node) {
      if (!node) return;

      // 检查当前节点是否有组件
      if (node.widget) {
        console.log(`节点 ${node.id} 有组件: ${node.widget.name}`);
        node.hasWidget = true;
      }

      // 递归检查子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => this.markNodesWithComponents(child));
      }
    },
  },
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
      padding: 0 16px;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;

      .left-area {
        flex-shrink: 0;
        margin-right: 10px;

      h2 {
        margin: 0;
          font-size: 18px;
        color: #303133;
        font-weight: 500;
          white-space: nowrap;
        }
      }

      .right-area {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
        overflow-x: auto;
        max-width: calc(100% - 250px);
        justify-content: flex-end;
        
        .action-group {
          flex-shrink: 0;
          
          .el-button span {
            @media (max-width: 768px) {
              display: none;
            }
          }
        }
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

  .empty-layout {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0px;

    .el-icon-s-grid {
      font-size: 60px;
      color: #909399;
    }
  }
  
  .layout-root {
    background-color: #fcfcfc;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .layout-container {
      .add-layout-controls {
        margin-top: 24px;
        padding: 24px;
        background-color: #f9fafc;
        border-radius: 8px;
        border: 1px solid #e6e6e6;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.text-center {
  text-align: center;
}
</style>

<style>
/* 修复行高输入框中的 px 后缀垂直居中问题 */
.layout-node
  .node-controls
  .row-settings
  .setting-item
  .el-input
  .el-input__suffix {
  display: flex;
  align-items: center;
  height: 100%;
  right: 5px;
  color: #909399;
  font-size: 12px;
}

/* 修复添加行控制区域中行高输入框的 px 后缀样式 */
.quick-layout-form .form-group .input-wrapper .el-input .el-input__suffix {
  display: flex;
  align-items: center;
  height: 100%;
  right: 5px;
  color: #909399;
  font-size: 12px;
}

/* 修复布局属性设置对话框中行高输入框的后缀样式 */
.el-form-item .el-input .el-input__suffix {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
